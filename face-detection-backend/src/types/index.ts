
export interface JWTPayload extends Record<string, unknown> {
    userId: string;
    username: string;
    exp: number;
}

export interface WebSocketMessage {
    type: 'connection' | 'camera_status' | 'new_alert' | 'system_stats'
    data: any;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface CameraWithAlerts {
  id: string;
  name: string;
  rtspUrl: string;
  location: string | null;
  enabled: boolean;
  isStreaming: boolean;
  createdAt: Date;
  updatedAt: Date;
  alerts: Array<{
    id: string;
    timestamp: Date;
    faceCount: number;
    confidence: number | null;
  }>;
}