// Custom hook for WebSocket connection and real-time updates

import { useEffect, useRef, useCallback, useState } from 'react';
import type { CameraStatusUpdate, NewAlertMessage, WebSocketMessage } from '../types';

interface UseWebSocketOptions {
    onCameraStatusUpdate?: (update: CameraStatusUpdate) => void;
    onNewAlert?: (alert: NewAlertMessage) => void;
    onConnectionChange?: (connected: boolean) => void;
}

interface UseWebSocketReturn {
    isConnected: boolean;
    lastMessage: WebSocketMessage | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendMessage: (message: any) => void;
    disconnect: () => void;
    reconnect: () => void;
}

export function useWebSocket( url?: string,
  options: UseWebSocketOptions = {} ): UseWebSocketReturn {
    const {
        onCameraStatusUpdate,
        onNewAlert,
        onConnectionChange,
    } = options;

    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    // Default WebSocket URL
    const wsUrl = url || (
        import.meta.env.VITE_WS_URL || 
        `ws://localhost:8000`
    );
    console.log(wsUrl);

    const connect = useCallback(() => {
        try {
            console.log('Connecting to WebSocket:', wsUrl);
            
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                reconnectAttempts.current = 0;
                onConnectionChange?.(true);
            };

            wsRef.current.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                setIsConnected(false);
                onConnectionChange?.(false);

                // Auto-reconnect with exponential backoff
                if (reconnectAttempts.current < maxReconnectAttempts) {
                    const delay = Math.pow(2, reconnectAttempts.current) * 1000; // 1s, 2s, 4s, 8s, 16s
                    console.log(`Reconnecting in ${delay}ms... (attempt ${reconnectAttempts.current + 1})`);
                    
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttempts.current++;
                        connect();
                    }, delay);
                } else {
                    console.error('Max reconnection attempts reached');
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    setLastMessage(message);

                    console.log('WebSocket message:', message.type, message.data);

                    // Handle different message types
                    switch (message.type) {
                        case 'connection':
                        console.log('WebSocket connection confirmed:', message.data.message);
                        break;

                        case 'camera_status':
                        onCameraStatusUpdate?.(message.data as CameraStatusUpdate);
                        break;

                        case 'new_alert':
                        onNewAlert?.(message.data as NewAlertMessage);
                        break;

                        case 'system_stats':
                        console.log('System stats:', message.data);
                        break;

                        default:
                        console.log('Unknown message type:', message.type);
                    }
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            setIsConnected(false);
        }
    }, [wsUrl, onCameraStatusUpdate, onNewAlert, onConnectionChange]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        setIsConnected(false);
        reconnectAttempts.current = maxReconnectAttempts; // Prevent auto-reconnect
    }, []);

    const reconnect = useCallback(() => {
        disconnect();
        reconnectAttempts.current = 0;
        setTimeout(connect, 1000);
    }, [connect, disconnect]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sendMessage = useCallback((message: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket not connected, cannot send message');
        }
    }, []);

    // Connect on mount
    useEffect(() => {
        connect();

        // Cleanup on unmount
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        isConnected,
        lastMessage,
        sendMessage,
        disconnect,
        reconnect,
    };
}