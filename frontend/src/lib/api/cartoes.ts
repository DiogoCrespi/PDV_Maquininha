import api from '../api';
import type { Cartao } from '@/types';

export const cartoesApi = {
  buscarPorId: async (id: string): Promise<Cartao> => {
    const response = await api.get<Cartao>(`/cartoes/${id}`);
    return response.data;
  },
};

