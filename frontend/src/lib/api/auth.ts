import api from '../api';
import type { Usuario } from '@/types';

export interface LoginRequest {
  usuario: string;
  senha: string;
  pos_id?: number;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  verify: async (): Promise<{ usuario: Usuario }> => {
    const response = await api.get<{ usuario: Usuario }>('/auth/verify');
    return response.data;
  },
};

