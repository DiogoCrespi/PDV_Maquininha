'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cartoesApi } from '@/lib/api/cartoes';
import { pagamentosApi } from '@/lib/api/pagamentos';
import ProtectedRoute from '@/components/ProtectedRoute';
import Card from '@/components/Card';
import Button from '@/components/Button';
import CardReader from '@/components/CardReader';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal';
import type { Pedido, Cartao } from '@/types';

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
  const [cartao, setCartao] = useState<Cartao | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCartao, setLoadingCartao] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [erroCartao, setErroCartao] = useState<string | null>(null);
  const [showConfirmacao, setShowConfirmacao] = useState(false);

  useEffect(() => {
    // Buscar pedido do localStorage
    const pedidoSalvo = localStorage.getItem('pedidoAtual');
    if (pedidoSalvo) {
      try {
        const pedidoData = JSON.parse(pedidoSalvo);
        setPedido(pedidoData);
      } catch {
        setErro('Erro ao carregar dados do pedido');
      }
    } else {
      setErro('Pedido não encontrado');
    }
    setLoading(false);
  }, []);

  const handleCardRead = async (cardId: string) => {
    setErroCartao(null);
    setLoadingCartao(true);
    setCartao(null);

    try {
      const cartaoData = await cartoesApi.buscarPorId(cardId);
      
      // Validar cartão ativo
      if (cartaoData.status !== 'ativo') {
        setErroCartao('Cartão não está ativo');
        setLoadingCartao(false);
        return;
      }

      // Validar validade do saldo (12 meses)
      if (cartaoData.created_at) {
        const dataCriacao = new Date(cartaoData.created_at);
        const dataExpiracao = new Date(dataCriacao);
        dataExpiracao.setMonth(dataExpiracao.getMonth() + 12);
        const hoje = new Date();
        
        if (dataExpiracao < hoje) {
          setErroCartao('Saldo do cartão expirado (válido por 12 meses)');
          setLoadingCartao(false);
          return;
        }
      }

      setCartao(cartaoData);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setErroCartao('Cartão não encontrado');
      } else {
        setErroCartao(error.response?.data?.error || 'Erro ao buscar cartão');
      }
    } finally {
      setLoadingCartao(false);
    }
  };

  const handleProcessarPagamento = () => {
    if (!pedido || !cartao) return;

    // Validar saldo
    if (cartao.saldo < pedido.valor_total) {
      setErroCartao('Saldo insuficiente');
      return;
    }

    setShowConfirmacao(true);
  };

  const handleConfirmarPagamento = async () => {
    if (!pedido || !cartao) return;

    setShowConfirmacao(false);
    setProcessando(true);
    setErro(null);

    try {
      const resultado = await pagamentosApi.processar({
        pedido_id: pedido.id,
        cartao_id: cartao.id,
        valor: pedido.valor_total,
      });

      // Limpar dados
      localStorage.removeItem('pedidoAtual');
      localStorage.removeItem('carrinho');

      // Salvar resultado para a tela de confirmação
      localStorage.setItem('pagamentoResultado', JSON.stringify(resultado));

      // Redirecionar para confirmação
      router.push(`/pagamento/confirmacao?pedidoId=${pedido.id}`);
    } catch (error: any) {
      setErro(error.response?.data?.error || 'Erro ao processar pagamento. Tente novamente.');
      setProcessando(false);
    }
  };

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

  const saldoSuficiente = cartao ? cartao.saldo >= pedido.valor_total : false;
  const saldoAposPagamento = cartao ? cartao.saldo - pedido.valor_total : 0;

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

          {/* Leitura de Cartão */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Leitura do Cartão
            </h2>
            <CardReader
              onCardRead={handleCardRead}
              loading={loadingCartao}
              error={erroCartao}
            />
          </Card>

          {/* Informações do Cartão */}
          {cartao && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informações do Cartão
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nome do Cliente</span>
                  <span className="font-semibold">{cartao.nome_cliente}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saldo Atual</span>
                  <span className={`font-semibold ${saldoSuficiente ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {cartao.saldo.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor do Pedido</span>
                  <span className="font-semibold text-blue-600">
                    R$ {pedido.valor_total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-semibold">Saldo Após Pagamento</span>
                    <span className={`text-lg font-bold ${saldoAposPagamento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {saldoAposPagamento.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
                {!saldoSuficiente && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-3">
                    Saldo insuficiente para realizar o pagamento
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Erro geral */}
          {erro && (
            <Card className="p-6 bg-red-50 border-red-200">
              <p className="text-red-700">{erro}</p>
            </Card>
          )}

          {/* Botões */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push('/categorias')}
              className="flex-1"
              disabled={processando}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleProcessarPagamento}
              className="flex-1"
              disabled={!cartao || !saldoSuficiente || processando}
              isLoading={processando}
            >
              {processando ? 'Processando...' : 'Processar Pagamento'}
            </Button>
          </div>
        </div>
      </main>

      {/* Modal de Confirmação */}
      <Modal
        isOpen={showConfirmacao}
        onClose={() => setShowConfirmacao(false)}
        title="Confirmar Pagamento"
        size="md"
      >
        {cartao && pedido && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-semibold">{cartao.nome_cliente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor:</span>
                <span className="font-semibold text-blue-600">
                  R$ {pedido.valor_total.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Saldo Atual:</span>
                <span className="font-semibold">
                  R$ {cartao.saldo.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600 font-semibold">Saldo Após:</span>
                <span className="font-bold text-green-600">
                  R$ {saldoAposPagamento.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Deseja confirmar o pagamento deste pedido?
            </p>

            <div className="flex gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowConfirmacao(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmarPagamento}
                className="flex-1"
              >
                Confirmar Pagamento
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

