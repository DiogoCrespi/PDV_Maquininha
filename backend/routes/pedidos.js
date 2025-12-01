const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Criar novo pedido
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { numero_mesa, itens } = req.body;

    if (!itens || itens.length === 0) {
      return res.status(400).json({ error: 'Pedido deve conter pelo menos um item' });
    }

    // Calcular valor total
    let valorTotal = 0;
    for (const item of itens) {
      const produto = await db.getAsync('SELECT preco FROM produtos WHERE id = ? AND ativo = 1', [item.produto_id]);
      if (!produto) {
        return res.status(400).json({ error: `Produto ${item.produto_id} não encontrado` });
      }
      valorTotal += produto.preco * item.quantidade;
    }

    // Criar pedido
    const pedidoResult = await db.runAsync(
      'INSERT INTO pedidos (numero_mesa, usuario_id, pos_id, valor_total) VALUES (?, ?, ?, ?)',
      [numero_mesa || null, req.user.id, req.user.pos_id, valorTotal]
    );

    const pedidoId = pedidoResult.lastID;

    // Inserir itens do pedido
    for (const item of itens) {
      const produto = await db.getAsync('SELECT preco FROM produtos WHERE id = ?', [item.produto_id]);
      await db.runAsync(
        'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, observacao) VALUES (?, ?, ?, ?, ?)',
        [pedidoId, item.produto_id, item.quantidade, produto.preco, item.observacao || null]
      );
    }

    // Buscar pedido completo
    const pedido = await db.getAsync(
      `SELECT p.*, u.nome as usuario_nome 
       FROM pedidos p 
       LEFT JOIN usuarios u ON p.usuario_id = u.id 
       WHERE p.id = ?`,
      [pedidoId]
    );

    const itensPedido = await db.allAsync(
      `SELECT ip.*, pr.nome as produto_nome 
       FROM itens_pedido ip 
       JOIN produtos pr ON ip.produto_id = pr.id 
       WHERE ip.pedido_id = ?`,
      [pedidoId]
    );

    res.status(201).json({
      ...pedido,
      itens: itensPedido
    });
  } catch (error) {
    next(error);
  }
});

// Buscar pedido por ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const pedido = await db.getAsync(
      `SELECT p.*, u.nome as usuario_nome 
       FROM pedidos p 
       LEFT JOIN usuarios u ON p.usuario_id = u.id 
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const itens = await db.allAsync(
      `SELECT ip.*, pr.nome as produto_nome, pr.imagem as produto_imagem
       FROM itens_pedido ip 
       JOIN produtos pr ON ip.produto_id = pr.id 
       WHERE ip.pedido_id = ?`,
      [req.params.id]
    );

    res.json({
      ...pedido,
      itens
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

