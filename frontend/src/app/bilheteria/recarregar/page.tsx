'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { bilheteriaApi } from '@/lib/api/bilheteria';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import type { Cartao } from '@/types';

export default function RecarregarSaldoPage() {
  const router = useRouter();
  const [cartaoId, setCartaoId] = useState('');
  const [cartao, setCartao] = useState<Cartao | null>(null);
  const [valor, setValor] = useState('');
  const [loadingCartao, setLoadingCartao] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  const handleBuscarCartao = async () => {
    if (!cartaoId.trim()) return;

    setErro(null);
    setLoadingCartao(true);
    setCartao(null);

    try {
      const cartaoData = await bilheteriaApi.buscarCartao(cartaoId.trim());
      
      if (cartaoData.status !== 'ativo') {
        setErro('Cartão não está ativo');
        setLoadingCartao(false);
        return;
      }

      setCartao(cartaoData);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setErro('Cartão não encontrado');
      } else {
        setErro(error.response?.data?.error || 'Erro ao buscar cartão');
      }
    } finally {
      setLoadingCartao(false);
    }
  };

  const handleRecarregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartao) return;

    const valorNum = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNum) || valorNum <= 0) {
      setErro('Valor inválido');
      return;
    }

    setErro(null);
    setLoading(true);

    try {
      const resultadoData = await bilheteriaApi.recarregarSaldo(cartao.id, {
        valor: valorNum,
      });

      setResultado(resultadoData);
      setSucesso(true);
      setValor('');
      // Recarregar dados do cartão
      const cartaoAtualizado = await bilheteriaApi.buscarCartao(cartao.id);
      setCartao(cartaoAtualizado);
    } catch (error: any) {
      setErro(error.response?.data?.error || 'Erro ao recarregar saldo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recarregar Saldo</h1>
        <p className="text-gray-600">Recarregue o saldo de um cartão</p>
      </div>

      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              label="ID do Cartão"
              type="text"
              value={cartaoId}
              onChange={(e) => setCartaoId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBuscarCartao()}
              placeholder="Digite o ID do cartão"
              disabled={loadingCartao}
              className="flex-1"
            />
            <div className="flex items-end">
              <Button
                variant="primary"
                onClick={handleBuscarCartao}
                isLoading={loadingCartao}
                disabled={!cartaoId.trim() || loadingCartao}
              >
                Buscar
              </Button>
            </div>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {erro}
            </div>
          )}
        </div>
      </Card>

      {cartao && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados do Cartão</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">ID:</span>
              <span className="font-mono font-semibold">{cartao.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cliente:</span>
              <span className="font-semibold">{cartao.nome_cliente}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Saldo Atual:</span>
              <span className="text-lg font-bold text-blue-600">
                R$ {cartao.saldo.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          <form onSubmit={handleRecarregar} className="space-y-4">
            <Input
              label="Valor da Recarga (R$)"
              type="text"
              value={valor}
              onChange={(e) => {
                const v = e.target.value.replace(/[^\d,]/g, '');
                setValor(v);
              }}
              placeholder="0,00"
              required
              disabled={loading}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setCartao(null);
                  setCartaoId('');
                  setValor('');
                  setErro(null);
                }}
                className="flex-1"
                disabled={loading}
              >
                Limpar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                isLoading={loading}
                disabled={loading}
              >
                Recarregar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Modal de Sucesso */}
      <Modal
        isOpen={sucesso}
        onClose={() => {
          setSucesso(false);
          setResultado(null);
        }}
        title="Recarga Realizada com Sucesso!"
        size="md"
      >
        {resultado && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold mb-2">Saldo recarregado com sucesso!</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-semibold">{resultado.cartao.nome_cliente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor Recarregado:</span>
                <span className="font-semibold text-blue-600">
                  R$ {resultado.transacao.valor.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Saldo Anterior:</span>
                <span className="font-semibold">
                  R$ {resultado.transacao.saldo_anterior.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600 font-semibold">Novo Saldo:</span>
                <span className="text-lg font-bold text-green-600">
                  R$ {resultado.transacao.saldo_posterior.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                setSucesso(false);
                setResultado(null);
              }}
              className="w-full"
            >
              Fechar
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

