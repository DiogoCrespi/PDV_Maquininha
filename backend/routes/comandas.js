const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { reimprimirComanda, buscarDadosComanda, formatarComanda } = require('../services/impressora');

const router = express.Router();

// Reimprimir comanda
router.post('/:pedidoId/reimprimir', authenticate, async (req, res, next) => {
  try {
    const { pedidoId } = req.params;

    // Verificar se pedido existe e foi pago
    const pedido = await db.getAsync('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    if (pedido.pago !== 1) {
      return res.status(400).json({ error: 'Pedido ainda não foi pago' });
    }

    const resultado = await reimprimirComanda(pedidoId);

    if (resultado.success) {
      res.json({
        success: true,
        message: 'Comanda reimpressa com sucesso',
        comanda: resultado.comanda
      });
    } else {
      res.status(500).json({
        success: false,
        error: resultado.error || 'Erro ao reimprimir comanda'
      });
    }

  } catch (error) {
    next(error);
  }
});

// Visualizar comanda (sem imprimir)
router.get('/:pedidoId/visualizar', authenticate, async (req, res, next) => {
  try {
    const { pedidoId } = req.params;

    // Verificar se pedido existe
    const pedido = await db.getAsync('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const dados = await buscarDadosComanda(pedidoId);
    const comandaFormatada = formatarComanda(dados);

    res.json({
      pedido: dados.pedido,
      itens: dados.itens,
      comanda: comandaFormatada
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;

