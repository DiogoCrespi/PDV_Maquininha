import { useState, useEffect } from 'react';
import { categoriasApi } from '@/lib/api/categorias';
import type { Categoria } from '@/types';

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await categoriasApi.listar();
        setCategorias(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erro ao carregar categorias');
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  return { categorias, loading, error };
}

