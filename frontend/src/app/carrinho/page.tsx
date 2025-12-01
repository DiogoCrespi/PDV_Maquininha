'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import Input from '@/components/Input';

export default function CarrinhoPage() {
  return (
    <ProtectedRoute>
      <CarrinhoContent />
    </ProtectedRoute>
  );
}

function CarrinhoContent() {
  const router = useRouter();
  const { usuario, logout } = useAuth();
  const { itens, removerItem, atualizarQuantidade, atualizarObservacao, total, limparCarrinho } = useCart();

  const handleFinalizarCompra = () => {
    if (itens.length === 0) return;
    router.push('/pedido/revisao');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/categorias')}
            >
              ← Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Carrinho</h1>
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
        {itens.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Seu carrinho está vazio</p>
            <Button onClick={() => router.push('/categorias')} variant="primary">
              Ver Categorias
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Lista de Itens */}
            <div className="space-y-3">
              {itens.map((item) => (
                <Card key={item.produto.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.produto.nome}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        R$ {item.produto.preco.toFixed(2).replace('.', ',')} cada
                      </p>
                      
                      {/* Observação */}
                      {item.observacao && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 mb-1">Observação:</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            {item.observacao}
                          </p>
                        </div>
                      )}

                      {/* Campo de observação editável */}
                      <div className="mt-2">
                        <Input
                          label="Observação"
                          type="text"
                          maxLength={200}
                          value={item.observacao || ''}
                          onChange={(e) => atualizarObservacao(item.produto.id, e.target.value)}
                          placeholder="Adicione uma observação..."
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {/* Quantidade */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => atualizarQuantidade(item.produto.id, item.quantidade - 1)}
                        >
                          -
                        </Button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantidade}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => atualizarQuantidade(item.produto.id, item.quantidade + 1)}
                        >
                          +
                        </Button>
                      </div>

                      {/* Subtotal */}
                      <p className="font-bold text-blue-600">
                        R$ {(item.produto.preco * item.quantidade).toFixed(2).replace('.', ',')}
                      </p>

                      {/* Remover */}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removerItem(item.produto.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Resumo */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={limparCarrinho}
                  className="flex-1"
                >
                  Limpar Carrinho
                </Button>
                <Button
                  variant="primary"
                  onClick={handleFinalizarCompra}
                  className="flex-1"
                >
                  Finalizar Compra
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

