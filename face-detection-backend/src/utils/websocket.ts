
import { WebSocket } from 'ws';
import { WebSocketMessage } from '../types';
import { time } from 'console';

class WebSocketManager {

    private clients = new Set<WebSocket>();

    public addClient(ws: WebSocket): void {
        this.clients.add(ws);
        console.log('new websocket client connected. Total clients:', this.clients.size);

        ws.on('close', () => {
            this.removeClient(ws);
        });
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            this.removeClient(ws);
        });
        this.sendToClient(ws, {
            type: 'connection',
            data : {
                message: 'connected to face detection dashboard',
                timestamp: new Date().toISOString()
            }
        });
    }

    private removeClient(ws: WebSocket): void {
        this.clients.delete(ws);
        console.log('websocket client disconnected. Total clients:', this.clients.size);
    }

    private sendToClient(ws: WebSocket, message: WebSocketMessage): void {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }

    }

    public getClientCount(): number {
        return this.clients.size;
    }

    public broadcast(message: WebSocketMessage): void {
        const msgString = JSON.stringify(message);
        let sentCount = 0;
        for (const client of this.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msgString);
                sentCount++;
            } else {
                this.clients.delete(client);
            }
        }
        if (sentCount > 0) {
            console.log(`Broadcasted message to ${sentCount} clients:`, message.type);
        }
    }

    /**
     * Send camera status update
     */
    public broadcastCameraStatus(cameraId: string, isStreaming: boolean): void {
        this.broadcast({
            type: 'camera_status',
            data: { 
                cameraId, 
                isStreaming, 
                timestamp: new Date().toISOString() 
            }
        });
    }

    /**
     * Send new alert notification
     */
    public broadcastAlert(alert: any): void {
        this.broadcast({
            type: 'new_alert',
            data: { 
                ...alert, 
                timestamp: new Date().toISOString() 
            }
        });
    }

    /**
     * Send system statistics
     */
    public broadcastSystemStats(stats: any): void {
        this.broadcast({
            type: 'system_stats',
            data: { 
                ...stats, 
                timestamp: new Date().toISOString() 
            }
        });
    }

}

export const wsManager = new WebSocketManager();