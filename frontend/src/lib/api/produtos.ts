import api from '../api';
import type { Produto } from '@/types';

export const produtosApi = {
  listar: async (): Promise<Produto[]> => {
    const response = await api.get<Produto[]>('/produtos');
    return response.data;
  },

  listarPorCategoria: async (categoriaId: number): Promise<Produto[]> => {
    const response = await api.get<Produto[]>(`/produtos/categoria/${categoriaId}`);
    return response.data;
  },

  buscarPorId: async (id: number): Promise<Produto> => {
    const response = await api.get<Produto>(`/produtos/${id}`);
    return response.data;
  },
};

