process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../../server');
const db = require('../../config/database');
const bcrypt = require('bcryptjs');

describe('Testes E2E - Popular Banco com Dados de Teste', () => {
  let tokenAdmin;

  beforeAll(async () => {
    // Garantir que existe um admin
    const adminHash = await bcrypt.hash('admin123', 10);
    await db.runAsync(
      `INSERT OR IGNORE INTO usuarios (id, nome, usuario, senha, tipo, pos_id) 
       VALUES (1, 'Administrador', 'admin', ?, 'admin', 1)`,
      [adminHash]
    );
  });

  // Login
  test('Login como admin', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'admin',
        senha: 'admin123'
      });

    expect(response.status).toBe(200);
    tokenAdmin = response.body.token;
  });

  // Criar múltiplas categorias
  test('Criar categorias variadas', async () => {
    const categorias = [
      { nome: 'Refrigerantes', ordem: 1, requer_comanda: 0 },
      { nome: 'Cervejas', ordem: 2, requer_comanda: 0 },
      { nome: 'Chopp', ordem: 3, requer_comanda: 0 },
      { nome: 'Águas', ordem: 4, requer_comanda: 0 },
      { nome: 'Sucos', ordem: 5, requer_comanda: 0 },
      { nome: 'Porções', ordem: 6, requer_comanda: 1 },
      { nome: 'Lanches', ordem: 7, requer_comanda: 1 },
      { nome: 'Pizzas', ordem: 8, requer_comanda: 1 },
      { nome: 'Picolés', ordem: 9, requer_comanda: 0 },
      { nome: 'Doces', ordem: 10, requer_comanda: 0 }
    ];

    for (const cat of categorias) {
      const response = await request(app)
        .post('/api/categorias')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(cat);

      if (response.status === 201 || response.status === 200) {
        console.log(`✅ Categoria: ${cat.nome}`);
      }
    }
  });

  // Criar múltiplos produtos
  test('Criar produtos variados', async () => {
    // Buscar categorias
    const catResponse = await request(app)
      .get('/api/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    const categorias = catResponse.body;
    const getCategoriaId = (nome) => categorias.find(c => c.nome === nome)?.id;

    const produtos = [
      // Refrigerantes
      { nome: 'Coca-Cola 350ml', preco: 5.50, categoria: 'Refrigerantes' },
      { nome: 'Pepsi 350ml', preco: 5.00, categoria: 'Refrigerantes' },
      { nome: 'Guaraná Antarctica 350ml', preco: 5.00, categoria: 'Refrigerantes' },
      { nome: 'Fanta Laranja 350ml', preco: 5.50, categoria: 'Refrigerantes' },
      
      // Cervejas
      { nome: 'Brahma 350ml', preco: 8.50, categoria: 'Cervejas' },
      { nome: 'Skol 350ml', preco: 8.00, categoria: 'Cervejas' },
      { nome: 'Heineken 350ml', preco: 12.00, categoria: 'Cervejas' },
      { nome: 'Stella Artois 350ml', preco: 11.50, categoria: 'Cervejas' },
      
      // Chopp
      { nome: 'Chopp Pilsen 300ml', preco: 10.00, categoria: 'Chopp' },
      { nome: 'Chopp IPA 300ml', preco: 12.00, categoria: 'Chopp' },
      
      // Águas
      { nome: 'Água Mineral 500ml', preco: 3.00, categoria: 'Águas' },
      { nome: 'Água com Gás 500ml', preco: 3.50, categoria: 'Águas' },
      
      // Sucos
      { nome: 'Suco de Laranja 500ml', preco: 7.00, categoria: 'Sucos' },
      { nome: 'Suco de Maracujá 500ml', preco: 7.50, categoria: 'Sucos' },
      { nome: 'Suco de Acerola 500ml', preco: 7.00, categoria: 'Sucos' },
      
      // Porções
      { nome: 'Porção de Batata Frita', preco: 18.00, categoria: 'Porções' },
      { nome: 'Porção de Mandioca', preco: 15.00, categoria: 'Porções' },
      { nome: 'Porção de Frango à Passarinho', preco: 35.00, categoria: 'Porções' },
      
      // Lanches
      { nome: 'Hambúrguer Artesanal', preco: 25.00, categoria: 'Lanches' },
      { nome: 'X-Burger', preco: 18.00, categoria: 'Lanches' },
      { nome: 'X-Salada', preco: 20.00, categoria: 'Lanches' },
      { nome: 'X-Bacon', preco: 22.00, categoria: 'Lanches' },
      
      // Pizzas
      { nome: 'Pizza Margherita', preco: 45.00, categoria: 'Pizzas' },
      { nome: 'Pizza Calabresa', preco: 48.00, categoria: 'Pizzas' },
      { nome: 'Pizza Portuguesa', preco: 50.00, categoria: 'Pizzas' },
      
      // Picolés
      { nome: 'Picolé de Chocolate', preco: 4.00, categoria: 'Picolés' },
      { nome: 'Picolé de Morango', preco: 4.00, categoria: 'Picolés' },
      { nome: 'Picolé de Coco', preco: 4.00, categoria: 'Picolés' },
      
      // Doces
      { nome: 'Brigadeiro', preco: 3.50, categoria: 'Doces' },
      { nome: 'Beijinho', preco: 3.50, categoria: 'Doces' },
      { nome: 'Bem Casado', preco: 5.00, categoria: 'Doces' }
    ];

    let criados = 0;
    for (const produto of produtos) {
      const categoriaId = getCategoriaId(produto.categoria);
      if (!categoriaId) {
        console.log(`⚠️ Categoria não encontrada: ${produto.categoria}`);
        continue;
      }

      const response = await request(app)
        .post('/api/produtos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          nome: produto.nome,
          preco: produto.preco,
          categoria_id: categoriaId
        });

      if (response.status === 201) {
        criados++;
        console.log(`✅ ${produto.nome} - R$ ${produto.preco.toFixed(2)}`);
      }
    }

    console.log(`\n✅ Total de produtos criados: ${criados}`);
    expect(criados).toBeGreaterThan(0);
  });

  // Criar múltiplos cartões
  test('Criar cartões para vários clientes', async () => {
    const clientes = [
      { id: 'CARD001', nome: 'João Silva' },
      { id: 'CARD002', nome: 'Maria Santos' },
      { id: 'CARD003', nome: 'Pedro Oliveira' },
      { id: 'CARD004', nome: 'Ana Costa' },
      { id: 'CARD005', nome: 'Carlos Souza' }
    ];

    for (const cliente of clientes) {
      const response = await request(app)
        .post('/api/bilheteria/cartoes/ativar')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          cartao_id: cliente.id,
          nome_cliente: cliente.nome
        });

      if (response.status === 200) {
        console.log(`✅ Cartão ${cliente.id} - ${cliente.nome}`);
        
        // Recarregar saldo aleatório entre 20 e 100
        const saldo = Math.floor(Math.random() * 80) + 20;
        await request(app)
          .post(`/api/bilheteria/cartoes/${cliente.id}/recarregar`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({ valor: saldo });
      }
    }
  });

  // Criar usuários operadores
  test('Criar usuários operadores', async () => {
    const operadores = [
      { nome: 'Vendedor 1', usuario: 'vendedor1', senha: 'vendedor123' },
      { nome: 'Vendedor 2', usuario: 'vendedor2', senha: 'vendedor123' },
      { nome: 'Vendedor 3', usuario: 'vendedor3', senha: 'vendedor123' }
    ];

    for (const op of operadores) {
      const senhaHash = await bcrypt.hash(op.senha, 10);
      await db.runAsync(
        `INSERT OR IGNORE INTO usuarios (nome, usuario, senha, tipo, pos_id) 
         VALUES (?, ?, ?, 'operador', 1)`,
        [op.nome, op.usuario, senhaHash]
      );
      console.log(`✅ Operador criado: ${op.usuario}`);
    }
  });

  // Resumo final
  test('Gerar resumo dos dados criados', async () => {
    const categorias = await db.allAsync('SELECT COUNT(*) as total FROM categorias WHERE ativo = 1');
    const produtos = await db.allAsync('SELECT COUNT(*) as total FROM produtos WHERE ativo = 1');
    const cartoes = await db.allAsync("SELECT COUNT(*) as total FROM cartoes WHERE status = 'ativo'");
    const usuarios = await db.allAsync('SELECT COUNT(*) as total FROM usuarios WHERE ativo = 1');

    console.log('\n📊 RESUMO DO BANCO DE DADOS:');
    console.log('==============================');
    console.log(`Categorias: ${categorias[0].total}`);
    console.log(`Produtos: ${produtos[0].total}`);
    console.log(`Cartões Ativos: ${cartoes[0].total}`);
    console.log(`Usuários: ${usuarios[0].total}`);
    console.log('==============================\n');

    expect(categorias[0].total).toBeGreaterThan(0);
    expect(produtos[0].total).toBeGreaterThan(0);
    expect(cartoes[0].total).toBeGreaterThan(0);
    expect(usuarios[0].total).toBeGreaterThan(0);
  });
});

