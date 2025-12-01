const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Buscar cartão por ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const cartao = await db.getAsync('SELECT * FROM cartoes WHERE id = ?', [req.params.id]);
    
    if (!cartao) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    res.json(cartao);
  } catch (error) {
    next(error);
  }
});

// Atualizar saldo do cartão (após pagamento)
router.patch('/:id/saldo', authenticate, async (req, res, next) => {
  try {
    const { valor } = req.body;
    const cartaoId = req.params.id;

    if (valor === undefined) {
      return res.status(400).json({ error: 'Valor é obrigatório' });
    }

    // Buscar cartão atual
    const cartao = await db.getAsync('SELECT * FROM cartoes WHERE id = ?', [cartaoId]);
    
    if (!cartao) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    if (cartao.status !== 'ativo') {
      return res.status(400).json({ error: 'Cartão não está ativo' });
    }

    const novoSaldo = cartao.saldo + valor;

    if (novoSaldo < 0) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Atualizar saldo
    await db.runAsync(
      'UPDATE cartoes SET saldo = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?',
      [novoSaldo, cartaoId]
    );

    const cartaoAtualizado = await db.getAsync('SELECT * FROM cartoes WHERE id = ?', [cartaoId]);
    res.json(cartaoAtualizado);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

