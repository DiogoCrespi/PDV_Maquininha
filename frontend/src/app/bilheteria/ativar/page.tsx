'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { bilheteriaApi } from '@/lib/api/bilheteria';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import Badge from '@/components/Badge';

export default function AtivarCartaoPage() {
  const router = useRouter();
  const [cartaoId, setCartaoId] = useState('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [cartaoAtivado, setCartaoAtivado] = useState<any>(null);

  const handleAtivar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      const resultado = await bilheteriaApi.ativarCartao({
        cartao_id: cartaoId.trim(),
        nome_cliente: nomeCliente.trim(),
      });

      setCartaoAtivado(resultado.cartao);
      setSucesso(true);
      setCartaoId('');
      setNomeCliente('');
    } catch (error: any) {
      setErro(error.response?.data?.error || 'Erro ao ativar cartão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFecharModal = () => {
    setSucesso(false);
    setCartaoAtivado(null);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ativar Cartão</h1>
        <p className="text-gray-600">Ative um novo cartão no sistema</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleAtivar} className="space-y-4">
          <Input
            label="ID do Cartão"
            type="text"
            value={cartaoId}
            onChange={(e) => setCartaoId(e.target.value)}
            placeholder="Digite o ID do cartão"
            required
            disabled={loading}
          />

          <Input
            label="Nome do Cliente"
            type="text"
            value={nomeCliente}
            onChange={(e) => setNomeCliente(e.target.value)}
            placeholder="Digite o nome do cliente"
            required
            disabled={loading}
          />

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {erro}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/bilheteria')}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={loading}
              disabled={loading}
            >
              Ativar Cartão
            </Button>
          </div>
        </form>
      </Card>

      {/* Modal de Sucesso */}
      <Modal
        isOpen={sucesso}
        onClose={handleFecharModal}
        title="Cartão Ativado com Sucesso!"
        size="md"
      >
        {cartaoAtivado && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold mb-2">Cartão ativado com sucesso!</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">ID do Cartão:</span>
                <span className="font-mono font-semibold">{cartaoAtivado.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-semibold">{cartaoAtivado.nome_cliente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Saldo Inicial:</span>
                <span className="font-semibold">R$ 0,00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant="success" size="sm">Ativo</Badge>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={handleFecharModal}
                className="flex-1"
              >
                Fechar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  handleFecharModal();
                  router.push('/bilheteria/recarregar');
                }}
                className="flex-1"
              >
                Recarregar Saldo
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

