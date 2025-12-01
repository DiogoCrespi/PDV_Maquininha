'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { pedidosApi } from '@/lib/api/pedidos';
import ProtectedRoute from '@/components/ProtectedRoute';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Loading from '@/components/Loading';

export default function RevisaoPedidoPage() {
  return (
    <ProtectedRoute>
      <RevisaoPedidoContent />
    </ProtectedRoute>
  );
}

function RevisaoPedidoContent() {
  const router = useRouter();
  const { usuario, logout } = useAuth();
  const { itens, total, limparCarrinho } = useCart();
  
  const [numeroMesa, setNumeroMesa] = useState<string>('');
  const [semMesa, setSemMesa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleFinalizarPedido = async () => {
    if (itens.length === 0) {
      setErro('O carrinho está vazio');
      return;
    }

    // Validar mesa (se não for sem mesa)
    if (!semMesa && !numeroMesa.trim()) {
      setErro('Informe o número da mesa ou marque "Sem mesa"');
      return;
    }

    // Validar número da mesa se informado
    if (!semMesa && numeroMesa.trim()) {
      const mesaNum = parseInt(numeroMesa);
      if (isNaN(mesaNum) || mesaNum <= 0) {
        setErro('Número da mesa inválido');
        return;
      }
    }

    setErro(null);
    setLoading(true);

    try {
      // Preparar itens para a API
      const itensPedido = itens.map((item) => ({
        produto_id: item.produto.id,
        quantidade: item.quantidade,
        observacao: item.observacao || undefined,
      }));

      // Criar pedido
      const pedido = await pedidosApi.criar({
        numero_mesa: semMesa ? null : parseInt(numeroMesa),
        itens: itensPedido,
      });

      // Limpar carrinho
      limparCarrinho();

      // Salvar ID do pedido para a tela de pagamento
      localStorage.setItem('pedidoAtual', JSON.stringify(pedido));

      // Redirecionar para pagamento
      router.push(`/pagamento?pedidoId=${pedido.id}`);
    } catch (error: any) {
      setErro(error.response?.data?.error || 'Erro ao criar pedido. Tente novamente.');
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    router.push('/carrinho');
  };

  if (itens.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Seu carrinho está vazio</p>
          <Button onClick={() => router.push('/categorias')} variant="primary">
            Ver Categorias
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" onClick={handleVoltar}>
              ← Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Revisão do Pedido</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Itens do Pedido */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Itens do Pedido</h2>
            <div className="space-y-4">
              {itens.map((item) => (
                <div
                  key={item.produto.id}
                  className="flex items-start justify-between gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.produto.nome}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      Quantidade: {item.quantidade} × R$ {item.produto.preco.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      Subtotal: R$ {(item.produto.preco * item.quantidade).toFixed(2).replace('.', ',')}
                    </p>
                    {item.observacao && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Observação:</p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          {item.observacao}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Informações da Mesa */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações da Mesa</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="semMesa"
                  checked={semMesa}
                  onChange={(e) => {
                    setSemMesa(e.target.checked);
                    if (e.target.checked) {
                      setNumeroMesa('');
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="semMesa" className="text-sm font-medium text-gray-700">
                  Pedido sem mesa (balcão/viagem)
                </label>
              </div>

              {!semMesa && (
                <Input
                  label="Número da Mesa"
                  type="number"
                  min="1"
                  value={numeroMesa}
                  onChange={(e) => setNumeroMesa(e.target.value)}
                  placeholder="Digite o número da mesa"
                  required
                />
              )}
            </div>
          </Card>

          {/* Resumo */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xl font-semibold text-gray-900">Total do Pedido:</span>
              <span className="text-3xl font-bold text-blue-600">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {erro && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {erro}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleVoltar}
                className="flex-1"
                disabled={loading}
              >
                Voltar
              </Button>
              <Button
                variant="primary"
                onClick={handleFinalizarPedido}
                className="flex-1"
                isLoading={loading}
                disabled={loading}
              >
                Avançar para Pagamento
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

