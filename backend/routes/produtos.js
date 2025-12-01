const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Listar produtos por categoria
router.get('/categoria/:categoriaId', authenticate, async (req, res, next) => {
  try {
    const produtos = await db.allAsync(
      'SELECT p.*, c.nome as categoria_nome FROM produtos p JOIN categorias c ON p.categoria_id = c.id WHERE p.categoria_id = ? AND p.ativo = 1 ORDER BY p.nome',
      [req.params.categoriaId]
    );
    res.json(produtos);
  } catch (error) {
    next(error);
  }
});

// Listar todos os produtos
router.get('/', authenticate, async (req, res, next) => {
  try {
    const produtos = await db.allAsync(
      'SELECT p.*, c.nome as categoria_nome FROM produtos p JOIN categorias c ON p.categoria_id = c.id WHERE p.ativo = 1 ORDER BY c.ordem, p.nome'
    );
    res.json(produtos);
  } catch (error) {
    next(error);
  }
});

// Buscar produto por ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const produto = await db.getAsync(
      'SELECT p.*, c.nome as categoria_nome FROM produtos p JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ?',
      [req.params.id]
    );
    
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(produto);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

