import api from '../api';
import type { Pedido, Cartao } from '@/types';

export interface ProcessarPagamentoRequest {
  pedido_id: number;
  cartao_id: string;
  valor: number;
}

export interface ProcessarPagamentoResponse {
  success: boolean;
  pedido: Pedido;
  cartao: Cartao;
  transacao: {
    valor: number;
    saldo_anterior: number;
    saldo_posterior: number;
  };
  impressao?: {
    sucesso: boolean;
    mensagem?: string;
  };
}

export const pagamentosApi = {
  processar: async (data: ProcessarPagamentoRequest): Promise<ProcessarPagamentoResponse> => {
    const response = await api.post<ProcessarPagamentoResponse>('/pagamentos/processar', data);
    return response.data;
  },
};

