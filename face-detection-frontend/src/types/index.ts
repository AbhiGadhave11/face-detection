/* eslint-disable @typescript-eslint/no-explicit-any */

export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface Camera {
  id: string;
  name: string;
  rtspUrl: string;
  location: string | null;
  enabled: boolean;
  isStreaming: boolean;
  createdAt: string;
  updatedAt: string;
  alertCount?: number;
  alerts?: Alert[];
}

export interface Alert {
  id: string;
  cameraId: string;
  timestamp: string;
  faceCount: number;
  confidence: number | null;
  snapshotUrl: string | null;
  metadata: any;
  camera?: Camera;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  details?: any;
  // For cameras endpoint
  cameras?: Camera[];
  camera?: Camera;
  // For alerts endpoint
  alerts?: Alert[];
  alert?: Alert;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface CreateCameraData {
  name: string;
  rtspUrl: string;
  location?: string;
}

export interface UpdateCameraData {
  name?: string;
  rtspUrl?: string;
  location?: string;
  enabled?: boolean;
}

// WebSocket
export interface WebSocketMessage {
  type: 'connection' | 'camera_status' | 'new_alert' | 'system_stats';
  data: any;
}

export interface CameraStatusUpdate {
  cameraId: string;
  isStreaming: boolean;
  timestamp: string;
}

export interface NewAlertMessage {
  id: string;
  cameraId: string;
  timestamp: string;
  faceCount: number;
  confidence: number | null;
  snapshotUrl: string | null;
  camera: Camera;
}

// UI State 
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}

export interface CameraFormData {
  name: string;
  rtspUrl: string;
  location: string;
}

export interface AlertFilters {
  cameraId?: string;
  startDate?: Date;
  endDate?: Date;
  minConfidence?: number;
}