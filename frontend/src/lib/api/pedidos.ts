import api from '../api';
import type { Pedido, ItemPedido } from '@/types';

export interface CriarPedidoRequest {
  numero_mesa?: number | null;
  itens: {
    produto_id: number;
    quantidade: number;
    observacao?: string;
  }[];
}

export interface CriarPedidoResponse extends Pedido {
  itens: ItemPedido[];
}

export const pedidosApi = {
  criar: async (data: CriarPedidoRequest): Promise<CriarPedidoResponse> => {
    const response = await api.post<CriarPedidoResponse>('/pedidos', data);
    return response.data;
  },

  buscarPorId: async (id: number): Promise<Pedido> => {
    const response = await api.get<Pedido>(`/pedidos/${id}`);
    return response.data;
  },

  listar: async (params?: { status?: string; data?: string; limite?: number }): Promise<Pedido[]> => {
    const response = await api.get<Pedido[]>('/pedidos', { params });
    return response.data;
  },
};

