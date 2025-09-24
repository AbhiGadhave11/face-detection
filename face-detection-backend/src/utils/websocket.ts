import { WebSocket } from 'ws';
import { WebSocketMessage } from '../types';

class WebSocketManager {
  private clients = new Set<WebSocket>();
  private server: any = null; // Will store WebSocketServer instance
  private isServerRunning = false;

  /**
   * Set the WebSocket server instance (called from main server)
   */
  setServer(server: any): void {
    this.server = server;
    this.isServerRunning = true;
    console.log('📡 WebSocket server instance registered');
  }

  /**
   * Check if WebSocket server is running
   */
  isRunning(): boolean {
    return this.isServerRunning && this.server !== null;
  }

  /**
   * Get server status information
   */
  getServerStatus(): { running: boolean; clients: number; server: boolean } {
    return {
      running: this.isServerRunning,
      clients: this.clients.size,
      server: this.server !== null
    };
  }

  /**
   * Add a new WebSocket client
   */
  addClient(ws: WebSocket): void {
    this.clients.add(ws);
    console.log(`📡 New WebSocket client connected. Total: ${this.clients.size}`);

    // Setup event handlers
    ws.on('close', () => {
      this.removeClient(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.removeClient(ws);
    });

    // Send welcome message
    this.sendToClient(ws, {
      type: 'connection',
      data: { 
        message: 'Connected to Face Detection Dashboard',
        timestamp: new Date().toISOString(),
        clientCount: this.clients.size
      }
    });
  }

  /**
   * Remove a WebSocket client
   */
  private removeClient(ws: WebSocket): void {
    this.clients.delete(ws);
    console.log(`📡 WebSocket client disconnected. Total: ${this.clients.size}`);
  }

  /**
   * Send message to a specific client
   */
  private sendToClient(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send message to client:', error);
        this.removeClient(ws);
      }
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message: WebSocketMessage): void {
    if (!this.isRunning()) {
      console.warn('⚠️ WebSocket server not running, cannot broadcast');
      return;
    }

    const messageStr = JSON.stringify(message);
    let sentCount = 0;
    let failedCount = 0;

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageStr);
          sentCount++;
        } catch (error) {
          console.error('Failed to send to client:', error);
          this.clients.delete(client);
          failedCount++;
        }
      } else {
        // Clean up closed connections
        this.clients.delete(client);
        failedCount++;
      }
    });

    if (sentCount > 0) {
      console.log(`📡 Broadcasted ${message.type} to ${sentCount} clients${failedCount > 0 ? ` (${failedCount} failed)` : ''}`);
    }
  }

  /**
   * Get number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get active client count (only OPEN connections)
   */
  getActiveClientCount(): number {
    let activeCount = 0;
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        activeCount++;
      }
    });
    return activeCount;
  }

  /**
   * Send camera status update
   */
  broadcastCameraStatus(cameraId: string, isStreaming: boolean): void {
    this.broadcast({
      type: 'camera_status',
      data: { cameraId, isStreaming, timestamp: new Date().toISOString() }
    });
  }

  /**
   * Send new alert notification
   */
  broadcastAlert(alert: any): void {
    this.broadcast({
      type: 'new_alert',
      data: { ...alert, timestamp: new Date().toISOString() }
    });
  }

  /**
   * Send system statistics
   */
  broadcastSystemStats(stats: any): void {
    this.broadcast({
      type: 'system_stats',
      data: { ...stats, timestamp: new Date().toISOString() }
    });
  }

  /**
   * Ping all connected clients to check health
   */
  pingClients(): { total: number; active: number; inactive: number } {
    let active = 0;
    let inactive = 0;

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.ping();
          active++;
        } catch (error) {
          this.clients.delete(client);
          inactive++;
        }
      } else {
        this.clients.delete(client);
        inactive++;
      }
    });

    return { total: this.clients.size, active, inactive };
  }

  /**
   * Shutdown WebSocket manager
   */
  shutdown(): void {
    console.log('📡 Shutting down WebSocket manager...');
    
    // Close all client connections
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.close(1001, 'Server shutting down');
      }
    });
    
    this.clients.clear();
    this.isServerRunning = false;
    this.server = null;
    
    console.log('📡 WebSocket manager shutdown complete');
  }
}

// Export singleton instance
export const wsManager = new WebSocketManager();