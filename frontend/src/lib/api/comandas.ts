import api from '../api';

export interface ReimprimirComandaResponse {
  success: boolean;
  message: string;
  comanda?: string;
  error?: string;
}

export const comandasApi = {
  reimprimir: async (pedidoId: number): Promise<ReimprimirComandaResponse> => {
    const response = await api.post<ReimprimirComandaResponse>(
      `/comandas/${pedidoId}/reimprimir`
    );
    return response.data;
  },
};

