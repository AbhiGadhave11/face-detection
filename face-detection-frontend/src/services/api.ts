
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { Alert, ApiResponse, AuthResponse, Camera, CreateCameraData, UpdateCameraData } from '../types';

class ApiService {
    private client: AxiosInstance
    constructor() {
        this.client = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('API Error:', error.response?.data || error.message);
                if (error.response?.status === 401) {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }  
        );
    }

    public async login(username: string, password: string): Promise<AuthResponse> {
        const response: AxiosResponse<AuthResponse> = await this.client.post('/auth/login', { 
            username, 
            password 
        });
        console.log('Login response:', response.data);
        return response.data;
    }

    public async logout(): Promise<void> {
        return this.client.post('/auth/logout');
    }

    async verifyToken(): Promise<{ valid: boolean }> {
        const response = await this.client.get('/auth/verify');
        return response.data;
    }

    async getCameras(): Promise<Camera[]> {
        const response: AxiosResponse<ApiResponse> = await this.client.get('/cameras');
        return response.data.cameras || [];
    }

    async getCamera(id: string): Promise<Camera> {
        const response: AxiosResponse<ApiResponse> = await this.client.get(`/cameras/${id}`);
        return response.data.camera!;
    }

    async createCamera(data: CreateCameraData): Promise<Camera> {
        const response: AxiosResponse<ApiResponse> = await this.client.post(
            '/cameras', data
        );
        return response.data.camera!;
    }

    async updateCamera(id: string, data: UpdateCameraData): Promise<Camera> {
        const response: AxiosResponse<ApiResponse> = await this.client.put(
            `/cameras/${id}`, data
        );
        return response.data.camera!;
    }

    async deleteCamera(id: string): Promise<void> {
        await this.client.delete(`/cameras/${id}`);
    }

    async startCamera(id: string): Promise<Camera> {
        const response: AxiosResponse<ApiResponse> = await this.client.post(
            `/cameras/${id}/start`
        );
        return response.data.camera!;
    }

    async stopCamera(id: string): Promise<Camera> {
        const response: AxiosResponse<ApiResponse> = await this.client.post(
            `/cameras/${id}/stop`
        );
        return response.data.camera!;
    }

    async getCameraAlerts(
        cameraId: string, 
        page: number = 1, 
        limit: number = 20
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<{ alerts: Alert[]; pagination: any }> {
        const response: AxiosResponse<ApiResponse> = await this.client.get(
            `/cameras/${cameraId}/alerts?page=${page}&limit=${limit}`
        );
        return {
            alerts: response.data.alerts || [],
            pagination: response.data.pagination,
        };
    }

    async healthCheck(): Promise<{ status: string; database: string }> {
        const response = await this.client.get('/health', {
            baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
        });
        return response.data;
    }

}

export const apiService = new ApiService();