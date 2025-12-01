process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../../server');
const db = require('../../config/database');
const bcrypt = require('bcryptjs');

// Limpar banco antes dos testes
beforeAll(async () => {
  // Criar banco de teste se necessário
  console.log('🧹 Preparando ambiente de teste...');
});

afterAll(async () => {
  // Fechar conexão do banco
  db.close();
});

describe('Testes E2E - Criação de Dados Completos', () => {
  let tokenAdmin;
  let categoriaId;
  let produtoId;
  let cartaoId;
  let pedidoId;
  let usuarioId;

  // 1. Criar usuário administrador
  test('1. Criar usuário administrador', async () => {
    const senhaHash = await bcrypt.hash('teste123', 10);
    
    // Verificar se já existe
    const existente = await db.getAsync('SELECT id FROM usuarios WHERE usuario = ?', ['teste_admin']);
    
    if (existente) {
      usuarioId = existente.id;
      console.log('✅ Usuário admin já existe:', usuarioId);
    } else {
      const result = await db.runAsync(
        `INSERT INTO usuarios (nome, usuario, senha, tipo, pos_id) 
         VALUES (?, ?, ?, 'admin', 1)`,
        ['Teste Admin', 'teste_admin', senhaHash]
      );
      usuarioId = result.lastID;
      console.log('✅ Usuário admin criado:', usuarioId);
    }
    
    expect(usuarioId).toBeDefined();
  });

  // 2. Fazer login
  test('2. Fazer login como administrador', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'teste_admin',
        senha: 'teste123'
      });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    tokenAdmin = response.body.token;
    console.log('✅ Login realizado com sucesso');
  });

  // 3. Criar categoria de bebida
  test('3. Criar categoria de bebida', async () => {
    const response = await request(app)
      .post('/api/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: 'Bebidas Alcoólicas',
        descricao: 'Cervejas, chopp e drinks',
        requer_comanda: 0,
        ordem: 1
      });

    expect(response.status).toBe(201);
    expect(response.body.nome).toBe('Bebidas Alcoólicas');
    categoriaId = response.body.id;
    console.log('✅ Categoria criada:', categoriaId, '-', response.body.nome);
  });

  // 4. Criar produto (bebida)
  test('4. Criar produto - Cerveja', async () => {
    const response = await request(app)
      .post('/api/produtos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: 'Cerveja Brahma 350ml',
        descricao: 'Cerveja gelada',
        preco: 8.50,
        categoria_id: categoriaId,
        imagem: null
      });

    expect(response.status).toBe(201);
    expect(response.body.nome).toBe('Cerveja Brahma 350ml');
    expect(response.body.preco).toBe(8.50);
    produtoId = response.body.id;
    console.log('✅ Produto criado:', produtoId, '-', response.body.nome, '- R$', response.body.preco);
  });

  // 5. Criar mais produtos
  test('5. Criar mais produtos variados', async () => {
    const produtos = [
      { nome: 'Refrigerante Coca-Cola 350ml', preco: 5.00, categoria_id: categoriaId },
      { nome: 'Chopp Artesanal', preco: 12.00, categoria_id: categoriaId },
      { nome: 'Água Mineral 500ml', preco: 3.00, categoria_id: categoriaId }
    ];

    for (const produto of produtos) {
      const response = await request(app)
        .post('/api/produtos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(produto);

      expect(response.status).toBe(201);
      console.log('✅ Produto criado:', response.body.nome, '- R$', response.body.preco);
    }
  });

  // 6. Criar cartão para cliente
  test('6. Criar e ativar cartão para cliente', async () => {
    cartaoId = 'TESTE' + Date.now(); // ID único para evitar conflitos
    
    const response = await request(app)
      .post('/api/bilheteria/cartoes/ativar')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        cartao_id: cartaoId,
        nome_cliente: 'João Silva'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.cartao.nome_cliente).toBe('João Silva');
    console.log('✅ Cartão criado e ativado:', cartaoId, '- Cliente:', response.body.cartao.nome_cliente);
  });

  // 7. Recarregar saldo no cartão
  test('7. Recarregar saldo no cartão', async () => {
    const response = await request(app)
      .post(`/api/bilheteria/cartoes/${cartaoId}/recarregar`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        valor: 100.00
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.cartao.saldo).toBe(100.00);
    console.log('✅ Saldo recarregado: R$', response.body.cartao.saldo);
  });

  // 8. Criar pedido
  test('8. Criar pedido com itens', async () => {
    // Buscar produtos disponíveis
    const produtosResponse = await request(app)
      .get('/api/produtos')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    const produtos = produtosResponse.body;
    const primeiroProduto = produtos[0];

    const response = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        numero_mesa: 5,
        itens: [
          {
            produto_id: primeiroProduto.id,
            quantidade: 2,
            observacao: 'Bem gelado'
          }
        ]
      });

    expect(response.status).toBe(201);
    expect(response.body.itens).toBeDefined();
    expect(response.body.itens.length).toBeGreaterThan(0);
    pedidoId = response.body.id;
    console.log('✅ Pedido criado:', pedidoId, '- Mesa:', response.body.numero_mesa, '- Total: R$', response.body.valor_total);
  });

  // 9. Processar pagamento
  test('9. Processar pagamento do pedido', async () => {
    // Buscar pedido criado
    const pedidoResponse = await request(app)
      .get(`/api/pedidos/${pedidoId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    const valorPedido = pedidoResponse.body.valor_total;

    const response = await request(app)
      .post('/api/pagamentos/processar')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        pedido_id: pedidoId,
        cartao_id: cartaoId,
        valor: valorPedido
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.cartao.saldo).toBeLessThan(100.00);
    console.log('✅ Pagamento processado - Saldo restante: R$', response.body.cartao.saldo);
  });

  // 10. Verificar histórico de transações
  test('10. Verificar histórico de transações do cartão', async () => {
    const response = await request(app)
      .get(`/api/bilheteria/cartoes/${cartaoId}/transacoes`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    console.log('✅ Histórico de transações:', response.body.length, 'transações encontradas');
  });

  // 11. Criar categoria de comida
  test('11. Criar categoria de comida (requer comanda)', async () => {
    const response = await request(app)
      .post('/api/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: 'Lanches Teste E2E',
        descricao: 'Hambúrgueres e sanduíches',
        requer_comanda: 1,
        ordem: 5
      });

    // Pode retornar 201 (criado) ou 200 (já existe)
    expect([200, 201]).toContain(response.status);
    if (response.body.requer_comanda !== undefined) {
      expect(response.body.requer_comanda).toBe(1);
    }
    console.log('✅ Categoria de comida criada/verificada:', response.body.nome || 'Lanches Teste E2E');
  });

  // 12. Criar produto de comida
  test('12. Criar produto de comida', async () => {
    // Buscar categoria de lanches
    const categoriasResponse = await request(app)
      .get('/api/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    const categoriaLanches = categoriasResponse.body.find(c => c.nome === 'Lanches');

    const response = await request(app)
      .post('/api/produtos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: 'Hambúrguer Artesanal',
        descricao: 'Pão, carne, queijo, alface, tomate',
        preco: 25.00,
        categoria_id: categoriaLanches.id
      });

    expect(response.status).toBe(201);
    expect(response.body.nome).toBe('Hambúrguer Artesanal');
    console.log('✅ Produto de comida criado:', response.body.nome, '- R$', response.body.preco);
  });

  // 13. Criar mais um cartão e cliente
  test('13. Criar segundo cartão e cliente', async () => {
    const novoCartaoId = 'TESTE789012';
    
    const response = await request(app)
      .post('/api/bilheteria/cartoes/ativar')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        cartao_id: novoCartaoId,
        nome_cliente: 'Maria Santos'
      });

    expect(response.status).toBe(200);
    expect(response.body.cartao.nome_cliente).toBe('Maria Santos');
    console.log('✅ Segundo cartão criado:', novoCartaoId, '- Cliente:', response.body.cartao.nome_cliente);
  });

  // 14. Listar todos os cartões
  test('14. Listar todos os cartões', async () => {
    const response = await request(app)
      .get('/api/bilheteria/cartoes')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    console.log('✅ Total de cartões:', response.body.length);
  });

  // 15. Listar todos os produtos
  test('15. Listar todos os produtos', async () => {
    const response = await request(app)
      .get('/api/produtos')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    console.log('✅ Total de produtos:', response.body.length);
  });

  // 16. Listar todas as categorias
  test('16. Listar todas as categorias', async () => {
    const response = await request(app)
      .get('/api/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    console.log('✅ Total de categorias:', response.body.length);
  });

  // 17. Verificar relatório de cartões ativos
  test('17. Verificar relatório de cartões ativos', async () => {
    const response = await request(app)
      .get('/api/bilheteria/relatorios/cartoes-ativos')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(response.status).toBe(200);
    expect(response.body.total_cartoes).toBeGreaterThan(0);
    console.log('✅ Cartões ativos:', response.body.total_cartoes, '- Saldo total: R$', response.body.saldo_total);
  });
});

