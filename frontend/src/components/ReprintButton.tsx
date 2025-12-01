'use client';

import { useState } from 'react';
import Button from './Button';

interface ReprintButtonProps {
  pedidoId: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function ReprintButton({
  pedidoId,
  onSuccess,
  onError,
  className = '',
}: ReprintButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleReimprimir = async () => {
    setLoading(true);
    try {
      const { comandasApi } = await import('@/lib/api/comandas');
      const resultado = await comandasApi.reimprimir(pedidoId);

      if (resultado.success) {
        onSuccess?.();
      } else {
        onError?.(resultado.error || 'Erro ao reimprimir comanda');
      }
    } catch (error: any) {
      const mensagemErro =
        error.response?.data?.error || 'Erro ao reimprimir comanda. Tente novamente.';
      onError?.(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleReimprimir}
      isLoading={loading}
      disabled={loading}
      className={className}
    >
      {loading ? 'Imprimindo...' : 'Reimprimir Comanda'}
    </Button>
  );
}

