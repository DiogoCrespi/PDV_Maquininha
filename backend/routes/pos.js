const express = require('express');
const db = require('../config/database');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Listar todos os POS (apenas admin)
router.get('/', authenticate, isAdmin, async (req, res, next) => {
  try {
    const pos = await db.allAsync('SELECT * FROM pontos_venda ORDER BY nome');
    res.json(pos);
  } catch (error) {
    next(error);
  }
});

// Buscar POS por ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const pos = await db.getAsync('SELECT * FROM pontos_venda WHERE id = ?', [req.params.id]);
    
    if (!pos) {
      return res.status(404).json({ error: 'POS não encontrado' });
    }

    res.json(pos);
  } catch (error) {
    next(error);
  }
});

// Criar novo POS (apenas admin)
router.post('/', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const result = await db.runAsync(
      'INSERT INTO pontos_venda (nome, descricao) VALUES (?, ?)',
      [nome, descricao || null]
    );

    const novoPos = await db.getAsync('SELECT * FROM pontos_venda WHERE id = ?', [result.lastID]);
    res.status(201).json(novoPos);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

