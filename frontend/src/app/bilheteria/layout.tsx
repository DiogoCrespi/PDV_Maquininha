'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Button from '@/components/Button';

export default function BilheteriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <BilheteriaLayoutContent>{children}</BilheteriaLayoutContent>
    </ProtectedRoute>
  );
}

function BilheteriaLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { usuario, logout } = useAuth();

  const menuItems = [
    { path: '/bilheteria', label: 'Dashboard', icon: '📊' },
    { path: '/bilheteria/ativar', label: 'Ativar Cartão', icon: '➕' },
    { path: '/bilheteria/recarregar', label: 'Recarregar', icon: '💳' },
    { path: '/bilheteria/devolver', label: 'Devolver', icon: '↩️' },
    { path: '/bilheteria/consultas', label: 'Consultas', icon: '🔍' },
    { path: '/bilheteria/relatorios', label: 'Relatórios', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-20">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Bilheteria</h1>
          {usuario && (
            <p className="text-sm text-gray-600 mt-1">Olá, {usuario.nome}</p>
          )}
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button
            variant="secondary"
            onClick={() => router.push('/categorias')}
            className="w-full mb-2"
            size="sm"
          >
            Ir para PDV
          </Button>
          <Button
            variant="secondary"
            onClick={logout}
            className="w-full"
            size="sm"
          >
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}

