const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

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

module.exports = router;

