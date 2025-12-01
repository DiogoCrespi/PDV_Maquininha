'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Loading from '@/components/Loading';
import type { Pedido } from '@/types';

export default function PagamentoPage() {
  return (
    <ProtectedRoute>
      <PagamentoContent />
    </ProtectedRoute>
  );
}

function PagamentoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { usuario, logout } = useAuth();
  
  const pedidoId = searchParams.get('pedidoId');
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    // Buscar pedido do localStorage ou da URL
    const pedidoSalvo = localStorage.getItem('pedidoAtual');
    if (pedidoSalvo) {
      try {
        const pedidoData = JSON.parse(pedidoSalvo);
        setPedido(pedidoData);
      } catch {
        setErro('Erro ao carregar dados do pedido');
      }
    } else if (pedidoId) {
      // Se não tem no localStorage, buscar pela API
      // Por enquanto, vamos usar o localStorage
      setErro('Pedido não encontrado');
    } else {
      setErro('ID do pedido não informado');
    }
    setLoading(false);
  }, [pedidoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (erro || !pedido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full">
          <p className="text-red-600 mb-4">{erro || 'Pedido não encontrado'}</p>
          <Button onClick={() => router.push('/categorias')} variant="primary">
            Voltar para Início
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Pagamento</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Informações do Pedido */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Pedido #</span>
                <span className="font-semibold">{pedido.id}</span>
              </div>
              {pedido.numero_mesa && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Mesa</span>
                  <span className="font-semibold">{pedido.numero_mesa}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Valor Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  R$ {pedido.valor_total.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horário</span>
                <span className="font-semibold">
                  {new Date(pedido.criado_em).toLocaleTimeString('pt-BR')}
                </span>
              </div>
            </div>
          </Card>

          {/* Informação de Pagamento */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações de Pagamento
            </h2>
            <p className="text-gray-600 mb-4">
              Esta tela será implementada na FASE 4 com a integração do sistema de cartão.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Em desenvolvimento:</strong> Sistema de leitura de cartão e processamento de pagamento.
              </p>
            </div>
          </Card>

          {/* Botões */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push('/categorias')}
              className="flex-1"
            >
              Voltar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                // TODO: Implementar processamento de pagamento na FASE 4
                alert('Sistema de pagamento será implementado na FASE 4');
              }}
              className="flex-1"
            >
              Processar Pagamento
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

