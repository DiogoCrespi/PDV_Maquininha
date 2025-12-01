'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { bilheteriaApi } from '@/lib/api/bilheteria';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import type { Cartao } from '@/types';

export default function DevolverSaldoPage() {
  const router = useRouter();
  const [cartaoId, setCartaoId] = useState('');
  const [cartao, setCartao] = useState<Cartao | null>(null);
  const [valor, setValor] = useState('');
  const [devolverTudo, setDevolverTudo] = useState(false);
  const [cancelarCartao, setCancelarCartao] = useState(false);
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

      if (cartaoData.saldo <= 0) {
        setErro('Cartão não possui saldo para devolução');
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

  const handleDevolver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartao) return;

    // Validar horário (após 17h)
    const agora = new Date();
    const hora = agora.getHours();
    if (hora < 17) {
      setErro('Devolução de saldo só é permitida após 17h');
      return;
    }

    const valorNum = devolverTudo
      ? cartao.saldo
      : parseFloat(valor.replace(',', '.'));

    if (!devolverTudo && (isNaN(valorNum) || valorNum <= 0)) {
      setErro('Valor inválido');
      return;
    }

    if (!devolverTudo && valorNum > cartao.saldo) {
      setErro('Valor a devolver é maior que o saldo disponível');
      return;
    }

    setErro(null);
    setLoading(true);

    try {
      const resultadoData = await bilheteriaApi.devolverSaldo(cartao.id, {
        valor: devolverTudo ? undefined : valorNum,
        cancelar_cartao: cancelarCartao,
      });

      setResultado(resultadoData);
      setSucesso(true);
      setValor('');
      setDevolverTudo(false);
      setCancelarCartao(false);
    } catch (error: any) {
      setErro(error.response?.data?.error || 'Erro ao devolver saldo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Devolver Saldo</h1>
        <p className="text-gray-600">Devolva o saldo de um cartão (após 17h)</p>
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
              <span className="text-gray-600">Saldo Disponível:</span>
              <span className="text-lg font-bold text-blue-600">
                R$ {cartao.saldo.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          <form onSubmit={handleDevolver} className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="devolverTudo"
                checked={devolverTudo}
                onChange={(e) => {
                  setDevolverTudo(e.target.checked);
                  if (e.target.checked) {
                    setValor('');
                  }
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="devolverTudo" className="text-sm font-medium text-gray-700">
                Devolver todo o saldo
              </label>
            </div>

            {!devolverTudo && (
              <Input
                label="Valor a Devolver (R$)"
                type="text"
                value={valor}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^\d,]/g, '');
                  setValor(v);
                }}
                placeholder="0,00"
                required={!devolverTudo}
                disabled={loading || devolverTudo}
              />
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cancelarCartao"
                checked={cancelarCartao}
                onChange={(e) => setCancelarCartao(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="cancelarCartao" className="text-sm font-medium text-gray-700">
                Cancelar cartão após devolução
              </label>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setCartao(null);
                  setCartaoId('');
                  setValor('');
                  setDevolverTudo(false);
                  setCancelarCartao(false);
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
                Devolver Saldo
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
        title="Devolução Realizada com Sucesso!"
        size="md"
      >
        {resultado && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold mb-2">Saldo devolvido com sucesso!</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-semibold">{resultado.cartao.nome_cliente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor Devolvido:</span>
                <span className="font-semibold text-red-600">
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
              {resultado.transacao.cartao_cancelado && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                  <p className="text-yellow-800 text-sm">
                    ⚠ Cartão foi cancelado após a devolução
                  </p>
                </div>
              )}
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

