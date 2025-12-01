'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bilheteriaApi } from '@/lib/api/bilheteria';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import Badge from '@/components/Badge';
import type { Cartao } from '@/types';

export default function BilheteriaDashboard() {
  const router = useRouter();
  const [cartoesAtivos, setCartoesAtivos] = useState<Cartao[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCartoes: 0,
    saldoTotal: 0,
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const relatorio = await bilheteriaApi.relatorioCartoesAtivos();
        setCartoesAtivos(relatorio.cartoes.slice(0, 10)); // Últimos 10
        setStats({
          totalCartoes: relatorio.total_cartoes,
          saldoTotal: relatorio.saldo_total,
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema de bilheteria</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cartões Ativos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCartoes}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💳</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Saldo Total</p>
              <p className="text-3xl font-bold text-gray-900">
                R$ {stats.saldoTotal.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ações Rápidas</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => router.push('/bilheteria/ativar')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ativar Cartão
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => router.push('/bilheteria/recarregar')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Recarregar
                </button>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Cartões Recentes */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Cartões Ativos Recentes</h2>
          <button
            onClick={() => router.push('/bilheteria/consultas')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todos
          </button>
        </div>

        {cartoesAtivos.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Nenhum cartão ativo encontrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cliente</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Saldo</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {cartoesAtivos.map((cartao) => (
                  <tr key={cartao.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-mono">{cartao.id}</td>
                    <td className="py-3 px-4 text-sm">{cartao.nome_cliente}</td>
                    <td className="py-3 px-4 text-sm text-right font-semibold">
                      R$ {cartao.saldo.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={cartao.status === 'ativo' ? 'success' : 'secondary'}
                        size="sm"
                      >
                        {cartao.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

