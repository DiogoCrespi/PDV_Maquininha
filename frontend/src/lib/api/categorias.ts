import api from '../api';
import type { Categoria } from '@/types';

export const categoriasApi = {
  listar: async (): Promise<Categoria[]> => {
    const response = await api.get<Categoria[]>('/categorias');
    return response.data;
  },

  buscarPorId: async (id: number): Promise<Categoria> => {
    const response = await api.get<Categoria>(`/categorias/${id}`);
    return response.data;
  },
};

