process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../../server');
const db = require('../../config/database');
const bcrypt = require('bcryptjs');

describe('Testes E2E - Fluxo de Venda Completo', () => {
  let tokenVendedor;
  let tokenAdmin;
  let categoriaId;
  let produtoId;
  let cartaoId;
  let pedidoId;

  beforeAll(async () => {
    // Criar usuário vendedor
    const senhaHash = await bcrypt.hash('vendedor123', 10);
    const vendedorExistente = await db.getAsync('SELECT id FROM usuarios WHERE usuario = ?', ['vendedor_teste']);
    if (!vendedorExistente) {
      await db.runAsync(
        `INSERT INTO usuarios (nome, usuario, senha, tipo, pos_id) 
         VALUES (?, ?, ?, 'operador', 1)`,
        ['Vendedor Teste', 'vendedor_teste', senhaHash]
      );
    }

    // Criar usuário admin
    const adminHash = await bcrypt.hash('admin123', 10);
    const adminExistente = await db.getAsync('SELECT id FROM usuarios WHERE usuario = ?', ['admin_teste']);
    if (!adminExistente) {
      await db.runAsync(
        `INSERT INTO usuarios (nome, usuario, senha, tipo, pos_id) 
         VALUES (?, ?, ?, 'admin', 1)`,
        ['Admin Teste', 'admin_teste', adminHash]
      );
    }
  });

  // 1. Login como vendedor
  test('1. Login como vendedor', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'vendedor_teste',
        senha: 'vendedor123'
      });

    expect(response.status).toBe(200);
    tokenVendedor = response.body.token;
    console.log('✅ Login vendedor realizado');
  });

  // 2. Login como admin
  test('2. Login como administrador', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'admin_teste',
        senha: 'admin123'
      });

    expect(response.status).toBe(200);
    tokenAdmin = response.body.token;
    console.log('✅ Login admin realizado');
  });

  // 3. Criar categoria
  test('3. Admin cria categoria', async () => {
    const response = await request(app)
      .post('/api/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: 'Bebidas Teste',
        ordem: 10
      });

    expect(response.status).toBe(201);
    categoriaId = response.body.id;
    console.log('✅ Categoria criada:', categoriaId);
  });

  // 4. Criar produto
  test('4. Admin cria produto', async () => {
    const response = await request(app)
      .post('/api/produtos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: 'Suco de Laranja',
        preco: 6.50,
        categoria_id: categoriaId
      });

    expect(response.status).toBe(201);
    produtoId = response.body.id;
    console.log('✅ Produto criado:', produtoId);
  });

  // 5. Vendedor lista categorias
  test('5. Vendedor lista categorias', async () => {
    const response = await request(app)
      .get('/api/categorias')
      .set('Authorization', `Bearer ${tokenVendedor}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    console.log('✅ Categorias listadas:', response.body.length);
  });

  // 6. Vendedor lista produtos da categoria
  test('6. Vendedor lista produtos da categoria', async () => {
    const response = await request(app)
      .get(`/api/produtos/categoria/${categoriaId}`)
      .set('Authorization', `Bearer ${tokenVendedor}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    console.log('✅ Produtos da categoria listados:', response.body.length);
  });

  // 7. Admin cria cartão
  test('7. Admin cria e ativa cartão', async () => {
    cartaoId = 'E2E' + Date.now();
    const response = await request(app)
      .post('/api/bilheteria/cartoes/ativar')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        cartao_id: cartaoId,
        nome_cliente: 'Cliente E2E Teste'
      });

    expect(response.status).toBe(200);
    console.log('✅ Cartão criado:', cartaoId);
  });

  // 8. Admin recarrega saldo
  test('8. Admin recarrega saldo no cartão', async () => {
    const response = await request(app)
      .post(`/api/bilheteria/cartoes/${cartaoId}/recarregar`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        valor: 50.00
      });

    expect(response.status).toBe(200);
    expect(response.body.cartao.saldo).toBe(50.00);
    console.log('✅ Saldo recarregado: R$', response.body.cartao.saldo);
  });

  // 9. Vendedor cria pedido
  test('9. Vendedor cria pedido', async () => {
    const response = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${tokenVendedor}`)
      .send({
        numero_mesa: 10,
        itens: [
          {
            produto_id: produtoId,
            quantidade: 3,
            observacao: 'Sem gelo'
          }
        ]
      });

    expect(response.status).toBe(201);
    expect(response.body.valor_total).toBeGreaterThan(0);
    pedidoId = response.body.id;
    console.log('✅ Pedido criado:', pedidoId, '- Total: R$', response.body.valor_total);
  });

  // 10. Vendedor processa pagamento
  test('10. Vendedor processa pagamento', async () => {
    const pedidoResponse = await request(app)
      .get(`/api/pedidos/${pedidoId}`)
      .set('Authorization', `Bearer ${tokenVendedor}`);

    const valorPedido = pedidoResponse.body.valor_total;

    const response = await request(app)
      .post('/api/pagamentos/processar')
      .set('Authorization', `Bearer ${tokenVendedor}`)
      .send({
        pedido_id: pedidoId,
        cartao_id: cartaoId,
        valor: valorPedido
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    console.log('✅ Pagamento processado - Saldo restante: R$', response.body.cartao.saldo);
  });

  // 11. Verificar pedido pago
  test('11. Verificar que pedido foi marcado como pago', async () => {
    const response = await request(app)
      .get(`/api/pedidos/${pedidoId}`)
      .set('Authorization', `Bearer ${tokenVendedor}`);

    expect(response.status).toBe(200);
    expect(response.body.pago).toBe(1);
    expect(response.body.status).toBe('pago');
    console.log('✅ Pedido confirmado como pago');
  });

  // 12. Verificar histórico
  test('12. Verificar histórico de transações', async () => {
    const response = await request(app)
      .get(`/api/bilheteria/cartoes/${cartaoId}/transacoes`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    
    const pagamento = response.body.find(t => t.tipo === 'pagamento');
    expect(pagamento).toBeDefined();
    console.log('✅ Histórico verificado -', response.body.length, 'transações');
  });
});

