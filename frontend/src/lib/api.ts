import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/format';

// Core API client configuration
const API_TIMEOUT = 15000; // 15 seconds

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || '/api/v1',
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Inject JWT token automatically
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.get<string | null>('mb_auth_token', null);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(normalizeError(error));
  }
);

// Response Interceptor: Handle errors and auto-logout on expired sessions (401)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    
    if (status === 401) {
      // Clear token and broadcast logout if unauthorized / token expired
      storage.remove('mb_auth_token');
      storage.remove('mb_user_profile');
      
      // Dispatch custom event to notify stores/components without importing them directly
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    }
    
    return Promise.reject(normalizeError(error));
  }
);

/**
 * Standardize API error shapes to avoid handling different axios structures in components
 */
export function normalizeError(error: any): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any;
    
    return {
      message: data?.detail || data?.message || error.message || 'An unexpected API error occurred',
      code: data?.error_code || 'API_ERROR',
      status: error.response?.status,
      details: data?.details || null,
    };
  }
  
  return {
    message: error.message || 'A network error occurred. Please check your connection.',
    code: 'NETWORK_ERROR',
  };
}
