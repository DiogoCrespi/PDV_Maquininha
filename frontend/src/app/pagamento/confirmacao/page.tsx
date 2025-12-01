'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Loading from '@/components/Loading';
import PrintStatus from '@/components/PrintStatus';
import ReprintButton from '@/components/ReprintButton';
import type { Pedido, Cartao } from '@/types';

interface PagamentoResultado {
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

export default function ConfirmacaoPagamentoPage() {
  return (
    <ProtectedRoute>
      <ConfirmacaoPagamentoContent />
    </ProtectedRoute>
  );
}

function ConfirmacaoPagamentoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { usuario, logout } = useAuth();
  
  const [resultado, setResultado] = useState<PagamentoResultado | null>(null);
  const [loading, setLoading] = useState(true);
  const [reprintStatus, setReprintStatus] = useState<{ sucesso: boolean; mensagem?: string } | null>(null);

  useEffect(() => {
    // Buscar resultado do localStorage
    const resultadoSalvo = localStorage.getItem('pagamentoResultado');
    if (resultadoSalvo) {
      try {
        const resultadoData = JSON.parse(resultadoSalvo);
        setResultado(resultadoData);
      } catch {
        console.error('Erro ao carregar resultado do pagamento');
      }
    }
    setLoading(false);
  }, []);

  const handleNovoPedido = () => {
    localStorage.removeItem('pagamentoResultado');
    router.push('/categorias');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!resultado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full">
          <p className="text-red-600 mb-4">Resultado do pagamento não encontrado</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Pagamento Confirmado</h1>
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
          {/* Sucesso */}
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-green-900">
                  Pagamento Processado com Sucesso!
                </h2>
                <p className="text-sm text-green-700">O pagamento foi realizado com sucesso</p>
              </div>
            </div>
          </Card>

          {/* Resumo do Pedido */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Pedido #</span>
                <span className="font-semibold">{resultado.pedido.id}</span>
              </div>
              {resultado.pedido.numero_mesa && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Mesa</span>
                  <span className="font-semibold">{resultado.pedido.numero_mesa}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Valor Pago</span>
                <span className="text-2xl font-bold text-blue-600">
                  R$ {resultado.transacao.valor.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </Card>

          {/* Informações do Cartão */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações do Cartão</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Cliente</span>
                <span className="font-semibold">{resultado.cartao.nome_cliente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Saldo Anterior</span>
                <span className="font-semibold">
                  R$ {resultado.transacao.saldo_anterior.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor Descontado</span>
                <span className="font-semibold text-red-600">
                  - R$ {resultado.transacao.valor.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600 font-semibold">Novo Saldo</span>
                <span className="text-lg font-bold text-green-600">
                  R$ {resultado.transacao.saldo_posterior.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </Card>

          {/* Status de Impressão */}
          {resultado.impressao && (
            <Card className={`p-6 ${resultado.impressao.sucesso ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Comanda</h2>
                <PrintStatus
                  sucesso={resultado.impressao.sucesso}
                  mensagem={resultado.impressao.mensagem}
                />
              </div>
              
              {resultado.impressao.sucesso ? (
                <div className="space-y-3">
                  <p className="text-green-700">
                    Comanda impressa com sucesso na cozinha.
                  </p>
                  <ReprintButton
                    pedidoId={resultado.pedido.id}
                    onSuccess={() => {
                      setReprintStatus({
                        sucesso: true,
                        mensagem: 'Comanda reimpressa com sucesso!',
                      });
                      setTimeout(() => setReprintStatus(null), 3000);
                    }}
                    onError={(error) => {
                      setReprintStatus({
                        sucesso: false,
                        mensagem: error,
                      });
                      setTimeout(() => setReprintStatus(null), 5000);
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-yellow-800">
                    {resultado.impressao.mensagem || 'Erro ao imprimir comanda'}
                  </p>
                  <ReprintButton
                    pedidoId={resultado.pedido.id}
                    onSuccess={() => {
                      setReprintStatus({
                        sucesso: true,
                        mensagem: 'Comanda reimpressa com sucesso!',
                      });
                      setTimeout(() => setReprintStatus(null), 3000);
                    }}
                    onError={(error) => {
                      setReprintStatus({
                        sucesso: false,
                        mensagem: error,
                      });
                      setTimeout(() => setReprintStatus(null), 5000);
                    }}
                  />
                </div>
              )}

              {reprintStatus && (
                <div className="mt-3 pt-3 border-t">
                  <PrintStatus
                    sucesso={reprintStatus.sucesso}
                    mensagem={reprintStatus.mensagem}
                  />
                </div>
              )}
            </Card>
          )}

          {/* Mostrar opção de reimpressão mesmo se não houve tentativa inicial */}
          {!resultado.impressao && resultado.pedido.itens && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Comanda</h2>
              </div>
              <div className="space-y-3">
                <p className="text-gray-600">
                  Este pedido não requer comanda ou a impressão não foi necessária.
                </p>
                <ReprintButton
                  pedidoId={resultado.pedido.id}
                  onSuccess={() => {
                    setReprintStatus({
                      sucesso: true,
                      mensagem: 'Comanda impressa com sucesso!',
                    });
                    setTimeout(() => setReprintStatus(null), 3000);
                  }}
                  onError={(error) => {
                    setReprintStatus({
                      sucesso: false,
                      mensagem: error,
                    });
                    setTimeout(() => setReprintStatus(null), 5000);
                  }}
                />
                {reprintStatus && (
                  <div className="mt-3 pt-3 border-t">
                    <PrintStatus
                      sucesso={reprintStatus.sucesso}
                      mensagem={reprintStatus.mensagem}
                    />
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Botão */}
          <Button
            variant="primary"
            onClick={handleNovoPedido}
            className="w-full"
            size="lg"
          >
            Novo Pedido
          </Button>
        </div>
      </main>
    </div>
  );
}

