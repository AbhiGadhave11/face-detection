import { Hono } from "hono";
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { testDatabaseConnection } from './utils/database';
import auth from './routes/auth';
import { serve } from '@hono/node-server';
import { ca } from "zod/v4/locales";
import cameras from "./routes/cameras";

const app = new Hono();
const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;

app.use('*', logger())
app.use('*', cors({
    origin: ['https://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

app.get('/', (c) => {
    return c.json({
        message: 'FaceDetection Backend is running',
        version: '1.0.0',
        status: 'running',
    });
});

app.route('/api/auth', auth);
app.route('/api/cameras', cameras);

app.get('/health', async (c) => {
    const dbConnected = await testDatabaseConnection();

    return c.json({
        status: 'ok',
        database: dbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
    });
});

app.notFound((c) => {
    return c.json({ error: 'Route Not Found' }, 404);
});

app.onError((err, c) => {
    console.error('Server Error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
});

console.log(`Starting server on port ${port}...`);

async function startServer() {
  console.log(`🚀 Starting server on port ${port}...`);

  // Start the server
  serve({
    fetch: app.fetch,
    port: port,
    hostname: '0.0.0.0'
  });

  console.log(`✅ Server running on http://localhost:${port}`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
  console.log(`🔐 Auth endpoint: http://localhost:${port}/api/auth/login`);
}

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});

export default {
    port, 
    fetch: app.fetch
};