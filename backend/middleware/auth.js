require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ ERRO: JWT_SECRET não definido no arquivo .env');
  process.exit(1);
}

// Middleware de autenticação
async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuário
    const user = await db.getAsync('SELECT * FROM usuarios WHERE id = ? AND ativo = 1', [decoded.id]);
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }

    // Adicionar informações do usuário à requisição
    req.user = {
      id: user.id,
      usuario: user.usuario,
      nome: user.nome,
      tipo: user.tipo,
      pos_id: user.pos_id
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    next(error);
  }
}

// Middleware para verificar se é admin
function isAdmin(req, res, next) {
  if (req.user.tipo !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
}

module.exports = { authenticate, isAdmin };

