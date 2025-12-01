const express = require('express');
const db = require('../config/database');
const { authenticate, isAdmin } = require('../middleware/auth');

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

// Criar produto (admin)
router.post('/', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { nome, descricao, preco, categoria_id, imagem } = req.body;

    if (!nome || !preco || !categoria_id) {
      return res.status(400).json({ error: 'Nome, preço e categoria são obrigatórios' });
    }

    // Verificar se categoria existe
    const categoria = await db.getAsync('SELECT * FROM categorias WHERE id = ?', [categoria_id]);
    if (!categoria) {
      return res.status(400).json({ error: 'Categoria não encontrada' });
    }

    const result = await db.runAsync(
      'INSERT INTO produtos (nome, descricao, preco, categoria_id, imagem) VALUES (?, ?, ?, ?, ?)',
      [nome, descricao || null, parseFloat(preco), categoria_id, imagem || null]
    );

    const produto = await db.getAsync(
      'SELECT p.*, c.nome as categoria_nome FROM produtos p JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ?',
      [result.lastID]
    );

    res.status(201).json(produto);
  } catch (error) {
    next(error);
  }
});

// Atualizar produto (admin)
router.put('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { nome, descricao, preco, categoria_id, imagem, ativo } = req.body;

    const produto = await db.getAsync('SELECT * FROM produtos WHERE id = ?', [req.params.id]);
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    if (categoria_id) {
      const categoria = await db.getAsync('SELECT * FROM categorias WHERE id = ?', [categoria_id]);
      if (!categoria) {
        return res.status(400).json({ error: 'Categoria não encontrada' });
      }
    }

    await db.runAsync(
      'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, categoria_id = ?, imagem = ?, ativo = ? WHERE id = ?',
      [
        nome || produto.nome,
        descricao !== undefined ? descricao : produto.descricao,
        preco !== undefined ? parseFloat(preco) : produto.preco,
        categoria_id || produto.categoria_id,
        imagem !== undefined ? imagem : produto.imagem,
        ativo !== undefined ? (ativo ? 1 : 0) : produto.ativo,
        req.params.id
      ]
    );

    const produtoAtualizado = await db.getAsync(
      'SELECT p.*, c.nome as categoria_nome FROM produtos p JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ?',
      [req.params.id]
    );

    res.json(produtoAtualizado);
  } catch (error) {
    next(error);
  }
});

// Excluir produto (admin) - soft delete
router.delete('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const produto = await db.getAsync('SELECT * FROM produtos WHERE id = ?', [req.params.id]);
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    await db.runAsync('UPDATE produtos SET ativo = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Produto desativado com sucesso' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

