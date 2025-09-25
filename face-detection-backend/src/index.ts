import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { testDatabaseConnection } from './utils/database';
import { wsManager } from './utils/websocket';
import auth from './routes/auth';
import cameras from './routes/cameras';
import { serveStatic } from '@hono/node-server/serve-static'
import { serve } from '@hono/node-server'
import path from 'path'
import { fileURLToPath } from 'url'

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:5173', 
    'http://localhost:3000'
    ], // Vite and React dev servers
  credentials: true,
}));

app.route('/api/auth', auth);

app.route('/api/cameras', cameras);


app.use(
  '/assets/*',
  serveStatic({ root: path.join(__dirname, '../dist') })
);

app.get('*', serveStatic({ root: path.join(__dirname, '../dist'), path: 'index.html' }))


app.get('/', (c) => {
  return c.json({ 
    message: 'Face Detection Backend API',
    version: '1.0.0',
    status: 'running',
    websocket: 'ws://localhost:8000'
  });
});

// WebSocket-specific health check
app.get('/health/websocket', async (c) => {
  const wsStatus = wsManager.getServerStatus();
  const wsHealth = wsManager.pingClients();
  
  return c.json({
    websocket: {
      server_running: wsStatus.running,
      server_instance: wsStatus.server,
      clients_total: wsHealth.total,
      clients_active: wsHealth.active,
      clients_inactive: wsHealth.inactive,
      last_check: new Date().toISOString()
    }
  });
});

app.get('/health', async (c) => {
  const dbConnected = await testDatabaseConnection();
  const wsStatus = wsManager.getServerStatus();
  const wsHealth = wsManager.pingClients();
  
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbConnected ? 'connected' : 'disconnected',
        connected: dbConnected
      },
      websocket: {
        status: wsStatus.running ? 'running' : 'stopped',
        server_running: wsStatus.running,
        clients_total: wsHealth.total,
        clients_active: wsHealth.active,
        clients_inactive: wsHealth.inactive
      },
      api: {
        status: 'running',
        uptime: process.uptime()
      }
    },
    // Legacy format for compatibility
    database: dbConnected ? 'connected' : 'disconnected',
    websocket: wsStatus.running 
      ? `${wsHealth.active}/${wsHealth.total} clients active` 
      : 'WebSocket server not running'
  });
});


app.notFound((c) => {
  return c.json({ error: 'Route not found' }, 404);
});

app.onError((err, c) => {
  console.error('❌ Server error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;

async function startServer() {
  console.log(`🚀 Starting server on port ${port}...`);

  const connected = await testDatabaseConnection();
  if (!connected) {
    console.error('❌ Failed to connect to database. Exiting...');
    process.exit(1);
  }

  // Create HTTP server
  const server = createServer();

  const wss = new WebSocketServer({ server });

  wsManager.setServer(wss);

  wss.on('connection', (ws, req) => {
    console.log(`📡 New WebSocket connection from ${req.socket.remoteAddress}`);
    wsManager.addClient(ws);
  });

  server.on('request', async (req, res) => {
    try {
      const stream = req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined;
      const response = await app.fetch(
        new Request(`http://${req.headers.host}${req.url}`, {
          method: req.method,
          headers: req.headers as any,
          body: stream as unknown as BodyInit, // temporary cast
          duplex: 'half' as 'half',
        }as unknown as RequestInit)
      );

      res.statusCode = response.status;
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      if (response.body) {
        const reader = response.body.getReader();
        const pump = async () => {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            return;
          }
          res.write(value);
          pump();
        };
        pump();
      } else {
        res.end();
      }
    } catch (error) {
      console.error('❌ Request handling error:', error);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`HTTP Server running on http://localhost:${port}`);
    console.log(`WebSocket Server running on ws://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`Auth endpoint: http://localhost:${port}/api/auth/login`);
  });

  process.on('SIGINT', () => {
    console.log('\n Shutting down server...');
    wsManager.shutdown();
    server.close(() => {
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    console.log('\n Shutting down server...');
    wsManager.shutdown();
    server.close(() => {
      process.exit(0);
    });
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});