const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-key-aqui-mude-em-producao';

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { usuario, senha, pos_id } = req.body;

    if (!usuario || !senha) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    // Buscar usuário
    const user = await db.getAsync(
      'SELECT * FROM usuarios WHERE usuario = ? AND ativo = 1',
      [usuario]
    );

    if (!user) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    // Se pos_id foi fornecido, verificar se o usuário tem acesso
    if (pos_id && user.pos_id && user.pos_id !== pos_id) {
      return res.status(403).json({ error: 'Usuário não tem acesso a este POS' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        usuario: user.usuario,
        tipo: user.tipo,
        pos_id: user.pos_id
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Buscar informações do POS se houver
    let pos = null;
    if (user.pos_id) {
      pos = await db.getAsync('SELECT * FROM pontos_venda WHERE id = ?', [user.pos_id]);
    }

    res.json({
      token,
      usuario: {
        id: user.id,
        nome: user.nome,
        usuario: user.usuario,
        tipo: user.tipo,
        pos: pos
      }
    });
  } catch (error) {
    next(error);
  }
});

// Verificar token
router.get('/verify', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuário atualizado
    const user = await db.getAsync('SELECT * FROM usuarios WHERE id = ? AND ativo = 1', [decoded.id]);
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    let pos = null;
    if (user.pos_id) {
      pos = await db.getAsync('SELECT * FROM pontos_venda WHERE id = ?', [user.pos_id]);
    }

    res.json({
      usuario: {
        id: user.id,
        nome: user.nome,
        usuario: user.usuario,
        tipo: user.tipo,
        pos: pos
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;

