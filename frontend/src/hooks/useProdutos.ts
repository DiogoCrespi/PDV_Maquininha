import { useState, useEffect } from 'react';
import { produtosApi } from '@/lib/api/produtos';
import type { Produto } from '@/types';

export function useProdutos(categoriaId?: number) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProdutos = async () => {
      if (!categoriaId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await produtosApi.listarPorCategoria(categoriaId);
        setProdutos(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erro ao carregar produtos');
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, [categoriaId]);

  return { produtos, loading, error };
}

