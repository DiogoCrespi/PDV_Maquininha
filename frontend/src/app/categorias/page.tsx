'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCategorias } from '@/hooks/useCategorias';
import ProtectedRoute from '@/components/ProtectedRoute';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import Button from '@/components/Button';

export default function CategoriasPage() {
  return (
    <ProtectedRoute>
      <CategoriasContent />
    </ProtectedRoute>
  );
}

// Função para obter emoji baseado no nome da categoria
function getCategoriaEmoji(nome: string): string {
  const nomeLower = nome.toLowerCase();
  if (nomeLower.includes('refrigerante')) return '🥤';
  if (nomeLower.includes('cerveja')) return '🍺';
  if (nomeLower.includes('chopp')) return '🍺';
  if (nomeLower.includes('porção') || nomeLower.includes('porções')) return '🍗';
  if (nomeLower.includes('lanche') || nomeLower.includes('lanches')) return '🍔';
  if (nomeLower.includes('picolé') || nomeLower.includes('picolés')) return '🍧';
  return '🍽️'; // Emoji padrão para comida
}

function CategoriasContent() {
  const router = useRouter();
  const { usuario, logout } = useAuth();
  const { categorias, loading, error } = useCategorias();

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
          <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
            {usuario && (
              <p className="text-sm text-gray-600">Olá, {usuario.nome}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {categorias.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhuma categoria disponível</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categorias.map((categoria) => (
              <Card
                key={categoria.id}
                hover
                onClick={() => router.push(`/produtos/${categoria.id}`)}
                className="text-center"
              >
                <div className="p-6">
                  <div className="text-5xl mb-3">
                    {getCategoriaEmoji(categoria.nome)}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {categoria.nome}
                  </h2>
                  {categoria.descricao && (
                    <p className="text-sm text-gray-600">{categoria.descricao}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

