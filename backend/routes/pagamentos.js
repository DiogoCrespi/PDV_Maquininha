const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Processar pagamento
router.post('/processar', authenticate, async (req, res, next) => {
  try {
    const { pedido_id, cartao_id, valor } = req.body;

    if (!pedido_id || !cartao_id || !valor) {
      return res.status(400).json({ error: 'Dados incompletos para processar pagamento' });
    }

    // Buscar pedido
    const pedido = await db.getAsync('SELECT * FROM pedidos WHERE id = ?', [pedido_id]);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    if (pedido.pago === 1) {
      return res.status(400).json({ error: 'Pedido já foi pago' });
    }

    // Buscar cartão
    const cartao = await db.getAsync('SELECT * FROM cartoes WHERE id = ?', [cartao_id]);
    if (!cartao) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    if (cartao.status !== 'ativo') {
      return res.status(400).json({ error: 'Cartão não está ativo' });
    }

    // Validar saldo
    const saldoAtual = parseFloat(cartao.saldo || 0);
    const valorPedido = parseFloat(valor);

    if (saldoAtual < valorPedido) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Validar validade do saldo (12 meses)
    if (cartao.data_expiracao) {
      const dataExpiracao = new Date(cartao.data_expiracao);
      const hoje = new Date();
      if (dataExpiracao < hoje) {
        return res.status(400).json({ error: 'Saldo do cartão expirado' });
      }
    }

    // Calcular novo saldo
    const novoSaldo = saldoAtual - valorPedido;

    // Iniciar transação (SQLite não suporta transações reais, mas vamos fazer tudo sequencialmente)
    try {
      // Atualizar saldo do cartão
      await db.runAsync(
        'UPDATE cartoes SET saldo = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?',
        [novoSaldo, cartao_id]
      );

      // Criar registro de transação
      await db.runAsync(
        `INSERT INTO transacoes (pedido_id, cartao_id, tipo, valor, saldo_anterior, saldo_posterior, descricao)
         VALUES (?, ?, 'pagamento', ?, ?, ?, ?)`,
        [
          pedido_id,
          cartao_id,
          valorPedido,
          saldoAtual,
          novoSaldo,
          `Pagamento do pedido #${pedido_id}`
        ]
      );

      // Atualizar status do pedido
      await db.runAsync(
        'UPDATE pedidos SET pago = 1, status = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?',
        ['pago', pedido_id]
      );

      // Buscar pedido atualizado
      const pedidoAtualizado = await db.getAsync(
        `SELECT p.*, u.nome as usuario_nome 
         FROM pedidos p 
         LEFT JOIN usuarios u ON p.usuario_id = u.id 
         WHERE p.id = ?`,
        [pedido_id]
      );

      // Buscar itens do pedido
      const itens = await db.allAsync(
        `SELECT ip.*, pr.nome as produto_nome, c.nome as categoria_nome, c.requer_comanda
         FROM itens_pedido ip 
         JOIN produtos pr ON ip.produto_id = pr.id
         JOIN categorias c ON pr.categoria_id = c.id
         WHERE ip.pedido_id = ?`,
        [pedido_id]
      );

      // Verificar se precisa imprimir comanda
      const { pedidoRequerComanda, imprimirComanda } = require('../services/impressora');
      let resultadoImpressao = null;
      
      const requerComanda = await pedidoRequerComanda(pedido_id);
      if (requerComanda) {
        resultadoImpressao = await imprimirComanda(pedido_id);
      }

      res.json({
        success: true,
        pedido: {
          ...pedidoAtualizado,
          itens
        },
        cartao: {
          ...cartao,
          saldo: novoSaldo
        },
        transacao: {
          valor: valorPedido,
          saldo_anterior: saldoAtual,
          saldo_posterior: novoSaldo
        },
        impressao: resultadoImpressao
      });

    } catch (error) {
      // Em caso de erro, tentar reverter (SQLite não tem rollback automático)
      console.error('Erro ao processar pagamento:', error);
      throw error;
    }

  } catch (error) {
    next(error);
  }
});

// Buscar histórico de transações de um cartão
router.get('/cartao/:cartaoId', authenticate, async (req, res, next) => {
  try {
    const transacoes = await db.allAsync(
      `SELECT t.*, p.numero_mesa, p.valor_total
       FROM transacoes t
       LEFT JOIN pedidos p ON t.pedido_id = p.id
       WHERE t.cartao_id = ?
       ORDER BY t.criado_em DESC
       LIMIT 50`,
      [req.params.cartaoId]
    );

    res.json(transacoes);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

