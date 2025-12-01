const express = require('express');
const db = require('../config/database');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Listar todas as categorias ativas
router.get('/', authenticate, async (req, res, next) => {
  try {
    const categorias = await db.allAsync(
      'SELECT * FROM categorias WHERE ativo = 1 ORDER BY ordem, nome'
    );
    res.json(categorias);
  } catch (error) {
    next(error);
  }
});

// Buscar categoria por ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const categoria = await db.getAsync('SELECT * FROM categorias WHERE id = ?', [req.params.id]);
    
    if (!categoria) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json(categoria);
  } catch (error) {
    next(error);
  }
});

// Criar categoria (admin)
router.post('/', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { nome, descricao, requer_comanda, ordem } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
    }

    const result = await db.runAsync(
      'INSERT INTO categorias (nome, descricao, requer_comanda, ordem) VALUES (?, ?, ?, ?)',
      [nome, descricao || null, requer_comanda ? 1 : 0, ordem || 0]
    );

    const categoria = await db.getAsync('SELECT * FROM categorias WHERE id = ?', [result.lastID]);
    res.status(201).json(categoria);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Categoria com este nome já existe' });
    }
    next(error);
  }
});

// Atualizar categoria (admin)
router.put('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { nome, descricao, requer_comanda, ordem, ativo } = req.body;

    const categoria = await db.getAsync('SELECT * FROM categorias WHERE id = ?', [req.params.id]);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    await db.runAsync(
      'UPDATE categorias SET nome = ?, descricao = ?, requer_comanda = ?, ordem = ?, ativo = ? WHERE id = ?',
      [
        nome || categoria.nome,
        descricao !== undefined ? descricao : categoria.descricao,
        requer_comanda !== undefined ? (requer_comanda ? 1 : 0) : categoria.requer_comanda,
        ordem !== undefined ? ordem : categoria.ordem,
        ativo !== undefined ? (ativo ? 1 : 0) : categoria.ativo,
        req.params.id
      ]
    );

    const categoriaAtualizada = await db.getAsync('SELECT * FROM categorias WHERE id = ?', [req.params.id]);
    res.json(categoriaAtualizada);
  } catch (error) {
    next(error);
  }
});

// Excluir categoria (admin) - soft delete
router.delete('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const categoria = await db.getAsync('SELECT * FROM categorias WHERE id = ?', [req.params.id]);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    await db.runAsync('UPDATE categorias SET ativo = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Categoria desativada com sucesso' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

