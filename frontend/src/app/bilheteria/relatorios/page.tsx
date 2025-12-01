'use client';

import { useState, useEffect } from 'react';
import { bilheteriaApi } from '@/lib/api/bilheteria';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Loading from '@/components/Loading';
import Badge from '@/components/Badge';
import type { Transacao } from '@/types';

export default function RelatoriosPage() {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [tipoRelatorio, setTipoRelatorio] = useState<'recargas' | 'devolucoes' | 'cartoes' | null>(null);
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState<any>(null);

  const handleGerarRelatorio = async (tipo: 'recargas' | 'devolucoes' | 'cartoes') => {
    setTipoRelatorio(tipo);
    setLoading(true);
    setDados(null);

    try {
      if (tipo === 'recargas') {
        const resultado = await bilheteriaApi.relatorioRecargas(data);
        setDados(resultado);
      } else if (tipo === 'devolucoes') {
        const resultado = await bilheteriaApi.relatorioDevolucoes(data);
        setDados(resultado);
      } else if (tipo === 'cartoes') {
        const resultado = await bilheteriaApi.relatorioCartoesAtivos();
        setDados(resultado);
      }
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
        <p className="text-gray-600">Gere relatórios do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recargas do Dia</h3>
          <div className="space-y-3">
            <Input
              label="Data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={() => handleGerarRelatorio('recargas')}
              className="w-full"
              isLoading={loading && tipoRelatorio === 'recargas'}
            >
              Gerar Relatório
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Devoluções do Dia</h3>
          <div className="space-y-3">
            <Input
              label="Data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={() => handleGerarRelatorio('devolucoes')}
              className="w-full"
              isLoading={loading && tipoRelatorio === 'devolucoes'}
            >
              Gerar Relatório
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cartões Ativos</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Relatório de todos os cartões ativos</p>
            <Button
              variant="primary"
              onClick={() => handleGerarRelatorio('cartoes')}
              className="w-full"
              isLoading={loading && tipoRelatorio === 'cartoes'}
            >
              Gerar Relatório
            </Button>
          </div>
        </Card>
      </div>

      {loading && <Loading />}

      {dados && tipoRelatorio && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {tipoRelatorio === 'recargas' && 'Relatório de Recargas'}
              {tipoRelatorio === 'devolucoes' && 'Relatório de Devoluções'}
              {tipoRelatorio === 'cartoes' && 'Relatório de Cartões Ativos'}
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDados(null);
                setTipoRelatorio(null);
              }}
            >
              Fechar
            </Button>
          </div>

          {tipoRelatorio === 'recargas' && dados.recargas && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Data</p>
                  <p className="font-semibold">{new Date(dados.data).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Recargas</p>
                  <p className="font-semibold text-lg">{dados.total_recargas}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="font-semibold text-lg text-blue-600">
                    R$ {dados.valor_total.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold">Data/Hora</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Cartão</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Cliente</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.recargas.map((r: any) => (
                      <tr key={r.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {new Date(r.created_at).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 text-sm font-mono">{r.cartao_id}</td>
                        <td className="py-3 px-4 text-sm">{r.nome_cliente}</td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">
                          R$ {r.valor.toFixed(2).replace('.', ',')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tipoRelatorio === 'devolucoes' && dados.devolucoes && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Data</p>
                  <p className="font-semibold">{new Date(dados.data).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Devoluções</p>
                  <p className="font-semibold text-lg">{dados.total_devolucoes}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="font-semibold text-lg text-red-600">
                    R$ {dados.valor_total.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold">Data/Hora</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Cartão</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Cliente</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.devolucoes.map((d: any) => (
                      <tr key={d.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {new Date(d.created_at).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 text-sm font-mono">{d.cartao_id}</td>
                        <td className="py-3 px-4 text-sm">{d.nome_cliente}</td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-red-600">
                          R$ {d.valor.toFixed(2).replace('.', ',')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tipoRelatorio === 'cartoes' && dados.cartoes && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total de Cartões</p>
                  <p className="font-semibold text-lg">{dados.total_cartoes}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Saldo Total</p>
                  <p className="font-semibold text-lg text-blue-600">
                    R$ {dados.saldo_total.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Cliente</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold">Saldo</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Ativação</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Expiração</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.cartoes.map((c: any) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-mono">{c.id}</td>
                        <td className="py-3 px-4 text-sm">{c.nome_cliente}</td>
                        <td className="py-3 px-4 text-sm text-right font-semibold">
                          R$ {c.saldo.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {c.data_ativacao ? new Date(c.data_ativacao).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {c.data_expiracao ? new Date(c.data_expiracao).toLocaleDateString('pt-BR') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

