require('dotenv').config();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  console.log('🔄 Inicializando banco de dados...');

  try {
    // Criar tabelas
    await createTables();
    
    // Inserir dados iniciais
    await insertInitialData();
    
    console.log('✅ Banco de dados inicializado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

async function createTables() {
  console.log('📋 Criando tabelas...');

  // Tabela de usuários/operadores
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      usuario TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'operador',
      pos_id INTEGER,
      ativo INTEGER DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pos_id) REFERENCES pontos_venda(id)
    )
  `);

  // Tabela de pontos de venda (POS)
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS pontos_venda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      ativo INTEGER DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de cartões
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS cartoes (
      id TEXT PRIMARY KEY,
      nome_cliente TEXT NOT NULL,
      saldo REAL DEFAULT 0.0,
      status TEXT DEFAULT 'inativo',
      data_ativacao DATETIME,
      data_expiracao DATETIME,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de categorias
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      descricao TEXT,
      requer_comanda INTEGER DEFAULT 0,
      ordem INTEGER DEFAULT 0,
      ativo INTEGER DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de produtos
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      preco REAL NOT NULL,
      categoria_id INTEGER NOT NULL,
      imagem TEXT,
      ativo INTEGER DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    )
  `);

  // Tabela de pedidos
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_mesa TEXT,
      usuario_id INTEGER,
      pos_id INTEGER,
      status TEXT DEFAULT 'pendente',
      valor_total REAL NOT NULL,
      pago INTEGER DEFAULT 0,
      comanda_impressa INTEGER DEFAULT 0,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (pos_id) REFERENCES pontos_venda(id)
    )
  `);

  // Tabela de itens do pedido
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS itens_pedido (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER NOT NULL,
      produto_id INTEGER NOT NULL,
      quantidade INTEGER NOT NULL,
      preco_unitario REAL NOT NULL,
      observacao TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
      FOREIGN KEY (produto_id) REFERENCES produtos(id)
    )
  `);

  // Tabela de transações (pagamentos)
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS transacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER,
      cartao_id TEXT,
      tipo TEXT NOT NULL,
      valor REAL NOT NULL,
      saldo_anterior REAL,
      saldo_posterior REAL,
      descricao TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
      FOREIGN KEY (cartao_id) REFERENCES cartoes(id)
    )
  `);

  // Tabela de mesas (opcional, para controle)
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS mesas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'livre',
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Tabelas criadas com sucesso!');
}

async function insertInitialData() {
  console.log('📦 Inserindo dados iniciais...');

  // Criar ponto de venda padrão
  const posResult = await db.runAsync(`
    INSERT OR IGNORE INTO pontos_venda (id, nome, descricao) 
    VALUES (1, 'POS Principal', 'Ponto de venda principal')
  `);

  // Criar usuário admin padrão
  const adminUsuario = process.env.ADMIN_USUARIO || 'admin';
  const adminSenha = process.env.ADMIN_SENHA || 'admin123';
  const adminNome = process.env.ADMIN_NOME || 'Administrador';
  
  const senhaHash = await bcrypt.hash(adminSenha, 10);
  await db.runAsync(`
    INSERT OR IGNORE INTO usuarios (id, nome, usuario, senha, tipo, pos_id) 
    VALUES (1, ?, ?, ?, 'admin', 1)
  `, [adminNome, adminUsuario, senhaHash]);

  // Criar categorias iniciais
  const categorias = [
    { nome: 'Refrigerante', requer_comanda: 0, ordem: 1 },
    { nome: 'Cerveja', requer_comanda: 0, ordem: 2 },
    { nome: 'Chopp', requer_comanda: 0, ordem: 3 },
    { nome: 'Porções', requer_comanda: 1, ordem: 4 },
    { nome: 'Lanches', requer_comanda: 1, ordem: 5 },
    { nome: 'Picolés', requer_comanda: 0, ordem: 6 }
  ];

  for (const cat of categorias) {
    await db.runAsync(`
      INSERT OR IGNORE INTO categorias (nome, requer_comanda, ordem) 
      VALUES (?, ?, ?)
    `, [cat.nome, cat.requer_comanda, cat.ordem]);
  }

  console.log('✅ Dados iniciais inseridos!');
  console.log(`👤 Usuário admin criado: ${process.env.ADMIN_USUARIO || 'admin'}`);
}

// Executar inicialização
initDatabase();

