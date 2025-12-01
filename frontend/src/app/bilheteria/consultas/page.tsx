'use client';

import { useState } from 'react';
import { bilheteriaApi } from '@/lib/api/bilheteria';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Loading from '@/components/Loading';
import Badge from '@/components/Badge';
import type { Cartao, Transacao } from '@/types';

export default function ConsultasPage() {
  const [cartaoId, setCartaoId] = useState('');
  const [cartao, setCartao] = useState<Cartao | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleBuscar = async () => {
    if (!cartaoId.trim()) return;

    setErro(null);
    setLoading(true);
    setCartao(null);
    setTransacoes([]);

    try {
      const [cartaoData, transacoesData] = await Promise.all([
        bilheteriaApi.buscarCartao(cartaoId.trim()),
        bilheteriaApi.historicoTransacoes(cartaoId.trim()),
      ]);

      setCartao(cartaoData);
      setTransacoes(transacoesData);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setErro('Cartão não encontrado');
      } else {
        setErro(error.response?.data?.error || 'Erro ao buscar cartão');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Consultas</h1>
        <p className="text-gray-600">Consulte informações de cartões e transações</p>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex gap-2">
          <Input
            label="ID do Cartão"
            type="text"
            value={cartaoId}
            onChange={(e) => setCartaoId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
            placeholder="Digite o ID do cartão"
            disabled={loading}
            className="flex-1"
          />
          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={handleBuscar}
              isLoading={loading}
              disabled={!cartaoId.trim() || loading}
            >
              Buscar
            </Button>
          </div>
        </div>

        {erro && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {erro}
          </div>
        )}
      </Card>

      {cartao && (
        <>
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações do Cartão</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">ID do Cartão</p>
                <p className="font-mono font-semibold">{cartao.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Cliente</p>
                <p className="font-semibold">{cartao.nome_cliente}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Saldo</p>
                <p className="text-lg font-bold text-blue-600">
                  R$ {cartao.saldo.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <Badge
                  variant={
                    cartao.status === 'ativo'
                      ? 'success'
                      : cartao.status === 'cancelado'
                      ? 'danger'
                      : 'secondary'
                  }
                  size="sm"
                >
                  {cartao.status}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Histórico de Transações</h2>
            {transacoes.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Nenhuma transação encontrada</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data/Hora</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Valor</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Saldo</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacoes.map((transacao) => (
                      <tr key={transacao.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {new Date(transacao.created_at).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              transacao.tipo === 'recarga'
                                ? 'success'
                                : transacao.tipo === 'devolucao'
                                ? 'warning'
                                : transacao.tipo === 'pagamento'
                                ? 'primary'
                                : 'secondary'
                            }
                            size="sm"
                          >
                            {transacao.tipo}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-semibold">
                          {transacao.tipo === 'recarga' ? '+' : '-'}
                          R$ {transacao.valor.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="py-3 px-4 text-sm text-right">
                          R$ {transacao.saldo_posterior?.toFixed(2).replace('.', ',') || '0,00'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {transacao.descricao || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

