import api from '../api';
import type { Cartao, Transacao } from '@/types';

export interface AtivarCartaoRequest {
  cartao_id: string;
  nome_cliente: string;
}

export interface AtivarCartaoResponse {
  success: boolean;
  message: string;
  cartao: Cartao;
}

export interface RecarregarSaldoRequest {
  valor: number;
}

export interface RecarregarSaldoResponse {
  success: boolean;
  message: string;
  cartao: Cartao;
  transacao: {
    valor: number;
    saldo_anterior: number;
    saldo_posterior: number;
  };
}

export interface DevolverSaldoRequest {
  valor?: number;
  cancelar_cartao?: boolean;
}

export interface DevolverSaldoResponse {
  success: boolean;
  message: string;
  cartao: Cartao;
  transacao: {
    valor: number;
    saldo_anterior: number;
    saldo_posterior: number;
    cartao_cancelado: boolean;
  };
}

export interface RelatorioRecargas {
  data: string;
  total_recargas: number;
  valor_total: number;
  recargas: Transacao[];
}

export interface RelatorioDevolucoes {
  data: string;
  total_devolucoes: number;
  valor_total: number;
  devolucoes: Transacao[];
}

export interface RelatorioCartoesAtivos {
  total_cartoes: number;
  saldo_total: number;
  cartoes: Cartao[];
}

export const bilheteriaApi = {
  ativarCartao: async (data: AtivarCartaoRequest): Promise<AtivarCartaoResponse> => {
    const response = await api.post<AtivarCartaoResponse>('/bilheteria/cartoes/ativar', data);
    return response.data;
  },

  recarregarSaldo: async (cartaoId: string, data: RecarregarSaldoRequest): Promise<RecarregarSaldoResponse> => {
    const response = await api.post<RecarregarSaldoResponse>(
      `/bilheteria/cartoes/${cartaoId}/recarregar`,
      data
    );
    return response.data;
  },

  devolverSaldo: async (cartaoId: string, data: DevolverSaldoRequest): Promise<DevolverSaldoResponse> => {
    const response = await api.post<DevolverSaldoResponse>(
      `/bilheteria/cartoes/${cartaoId}/devolver`,
      data
    );
    return response.data;
  },

  cancelarCartao: async (cartaoId: string, motivo?: string): Promise<{ success: boolean; message: string; cartao: Cartao }> => {
    const response = await api.post(`/bilheteria/cartoes/${cartaoId}/cancelar`, { motivo });
    return response.data;
  },

  listarCartoes: async (params?: { status?: string; busca?: string }): Promise<Cartao[]> => {
    const response = await api.get<Cartao[]>('/bilheteria/cartoes', { params });
    return response.data;
  },

  buscarCartao: async (cartaoId: string): Promise<Cartao> => {
    const response = await api.get<Cartao>(`/cartoes/${cartaoId}`);
    return response.data;
  },

  historicoTransacoes: async (cartaoId: string, params?: { tipo?: string; limite?: number }): Promise<Transacao[]> => {
    const response = await api.get<Transacao[]>(`/bilheteria/cartoes/${cartaoId}/transacoes`, { params });
    return response.data;
  },

  relatorioRecargas: async (data?: string): Promise<RelatorioRecargas> => {
    const response = await api.get<RelatorioRecargas>('/bilheteria/relatorios/recargas', {
      params: data ? { data } : undefined,
    });
    return response.data;
  },

  relatorioDevolucoes: async (data?: string): Promise<RelatorioDevolucoes> => {
    const response = await api.get<RelatorioDevolucoes>('/bilheteria/relatorios/devolucoes', {
      params: data ? { data } : undefined,
    });
    return response.data;
  },

  relatorioCartoesAtivos: async (): Promise<RelatorioCartoesAtivos> => {
    const response = await api.get<RelatorioCartoesAtivos>('/bilheteria/relatorios/cartoes-ativos');
    return response.data;
  },
};
