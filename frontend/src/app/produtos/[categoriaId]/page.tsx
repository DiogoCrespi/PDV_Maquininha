'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProdutos } from '@/hooks/useProdutos';
import { useCart } from '@/context/CartContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import Input from '@/components/Input';

export default function ProdutosPage() {
  return (
    <ProtectedRoute>
      <ProdutosContent />
    </ProtectedRoute>
  );
}

function ProdutosContent() {
  const params = useParams();
  const router = useRouter();
  const categoriaId = Number(params.categoriaId);
  
  const { usuario, logout } = useAuth();
  const { produtos, loading, error } = useProdutos(categoriaId);
  const { adicionarItem, quantidadeItens } = useCart();
  
  const [produtoSelecionado, setProdutoSelecionado] = useState<number | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState('');

  const handleAbrirModal = (produtoId: number) => {
    setProdutoSelecionado(produtoId);
    setQuantidade(1);
    setObservacao('');
  };

  const handleFecharModal = () => {
    setProdutoSelecionado(null);
    setQuantidade(1);
    setObservacao('');
  };

  const handleAdicionarAoCarrinho = () => {
    if (!produtoSelecionado) return;

    const produto = produtos.find((p) => p.id === produtoSelecionado);
    if (!produto) return;

    adicionarItem(produto, quantidade, observacao || undefined);
    handleFecharModal();
  };

  const produto = produtoSelecionado
    ? produtos.find((p) => p.id === produtoSelecionado)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/categorias')} variant="secondary">
              Voltar
            </Button>
            <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
          </div>
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
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/categorias')}
            >
              ← Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          </div>
          <div className="flex items-center gap-4">
            {quantidadeItens > 0 && (
              <Badge variant="primary" size="lg">
                {quantidadeItens} {quantidadeItens === 1 ? 'item' : 'itens'}
              </Badge>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push('/carrinho')}
              disabled={quantidadeItens === 0}
            >
              Carrinho
            </Button>
            <Button variant="secondary" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {produtos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Nenhum produto disponível nesta categoria</p>
            <Button onClick={() => router.push('/categorias')} variant="secondary">
              Voltar para Categorias
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {produtos.map((produto) => (
              <Card
                key={produto.id}
                hover
                onClick={() => handleAbrirModal(produto.id)}
                className="flex flex-col"
              >
                <div className="flex-1">
                  {produto.imagem ? (
                    <img
                      src={produto.imagem}
                      alt={produto.nome}
                      className="w-full h-32 object-cover rounded-t-lg mb-3"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-t-lg mb-3 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Sem imagem</span>
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900 mb-1">{produto.nome}</h3>
                  {produto.descricao && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {produto.descricao}
                    </p>
                  )}
                </div>
                <div className="mt-auto pt-3 border-t">
                  <p className="text-lg font-bold text-blue-600">
                    R$ {produto.preco.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Seleção */}
      <Modal
        isOpen={produtoSelecionado !== null}
        onClose={handleFecharModal}
        title={produto?.nome}
        size="md"
      >
        {produto && (
          <div className="space-y-4">
            <div>
              <p className="text-2xl font-bold text-blue-600 mb-2">
                R$ {produto.preco.toFixed(2).replace('.', ',')}
              </p>
              {produto.descricao && (
                <p className="text-gray-600">{produto.descricao}</p>
              )}
            </div>

            <Input
              label="Quantidade"
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
            />

            <Input
              label="Observação (opcional)"
              type="text"
              maxLength={200}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Sem cebola, bem passado..."
            />
            {observacao.length > 0 && (
              <p className="text-xs text-gray-500 text-right">
                {observacao.length}/200 caracteres
              </p>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={handleFecharModal}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleAdicionarAoCarrinho}
                className="flex-1"
              >
                Adicionar ao Carrinho
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

