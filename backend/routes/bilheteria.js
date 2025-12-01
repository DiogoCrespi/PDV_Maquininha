const express = require('express');
const db = require('../config/database');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Ativar cartão
router.post('/cartoes/ativar', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { cartao_id, nome_cliente } = req.body;

    if (!cartao_id || !nome_cliente) {
      return res.status(400).json({ error: 'ID do cartão e nome do cliente são obrigatórios' });
    }

    // Verificar se cartão já existe
    const cartaoExistente = await db.getAsync('SELECT * FROM cartoes WHERE id = ?', [cartao_id]);
    
    if (cartaoExistente) {
      if (cartaoExistente.status === 'ativo') {
        return res.status(400).json({ error: 'Cartão já está ativo' });
      }
      // Reativar cartão
      const dataExpiracao = new Date();
      dataExpiracao.setMonth(dataExpiracao.getMonth() + 12);
      
      await db.runAsync(
        `UPDATE cartoes 
         SET nome_cliente = ?, status = 'ativo', data_ativacao = CURRENT_TIMESTAMP, 
             data_expiracao = ?, saldo = 0.0, atualizado_em = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [nome_cliente, dataExpiracao.toISOString(), cartao_id]
      );
    } else {
      // Criar novo cartão
      const dataExpiracao = new Date();
      dataExpiracao.setMonth(dataExpiracao.getMonth() + 12);
      
      await db.runAsync(
        `INSERT INTO cartoes (id, nome_cliente, saldo, status, data_ativacao, data_expiracao)
         VALUES (?, ?, 0.0, 'ativo', CURRENT_TIMESTAMP, ?)`,
        [cartao_id, nome_cliente, dataExpiracao.toISOString()]
      );
    }

    // Registrar transação de ativação
    const cartao = await db.getAsync('SELECT * FROM cartoes WHERE id = ?', [cartao_id]);
    
    await db.runAsync(
      `INSERT INTO transacoes (cartao_id, tipo, valor, saldo_anterior, saldo_posterior, descricao)
       VALUES (?, 'ativacao', 0.0, 0.0, 0.0, ?)`,
      [cartao_id, `Ativação do cartão - Cliente: ${nome_cliente}`]
    );

    res.json({
      success: true,
      message: 'Cartão ativado com sucesso',
      cartao
    });

  } catch (error) {
    next(error);
  }
});

// Recarregar saldo
router.post('/cartoes/:id/recarregar', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { valor } = req.body;

    if (!valor || valor <= 0) {
      return res.status(400).json({ error: 'Valor da recarga deve ser maior que zero' });
    }

    // Buscar cartão
    const cartao = await db.getAsync('SELECT * FROM cartoes WHERE id = ?', [id]);
    
    if (!cartao) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    if (cartao.status !== 'ativo') {
      return res.status(400).json({ error: 'Cartão não está ativo' });
    }

    const saldoAnterior = parseFloat(cartao.saldo || 0);
    const valorRecarga = parseFloat(valor);
    const novoSaldo = saldoAnterior + valorRecarga;

    // Atualizar saldo
    await db.runAsync(
      'UPDATE cartoes SET saldo = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?',
      [novoSaldo, id]
    );

    // Registrar transação
    await db.runAsync(
      `INSERT INTO transacoes (cartao_id, tipo, valor, saldo_anterior, saldo_posterior, descricao)
       VALUES (?, 'recarga', ?, ?, ?, ?)`,
      [id, valorRecarga, saldoAnterior, novoSaldo, `Recarga de R$ ${valorRecarga.toFixed(2)}`]
    );

    const cartaoAtualizado = await db.getAsync('SELECT * FROM cartoes WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Saldo recarregado com sucesso',
      cartao: cartaoAtualizado,
      transacao: {
        valor: valorRecarga,
        saldo_anterior: saldoAnterior,
        saldo_posterior: novoSaldo
      }
    });

  } catch (error) {
    next(error);
  }
});

// Devolver saldo
router.post('/cartoes/:id/devolver', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { valor, cancelar_cartao } = req.body;

    // Validar horário (após 17h)
    const agora = new Date();
    const hora = agora.getHours();
    if (hora < 17) {
      return res.status(400).json({ 
        error: 'Devolução de saldo só é permitida após 17h',
        hora_atual: hora
      });
    }

    // Buscar cartão
    const cartao = await db.getAsync('SELECT * FROM cartoes WHERE id = ?', [id]);
    
    if (!cartao) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    if (cartao.status !== 'ativo') {
      return res.status(400).json({ error: 'Cartão não está ativo' });
    }

    const saldoAtual = parseFloat(cartao.saldo || 0);
    
    if (saldoAtual <= 0) {
      return res.status(400).json({ error: 'Cartão não possui saldo para devolução' });
    }

    // Calcular valor a devolver
    const valorDevolver = valor ? parseFloat(valor) : saldoAtual;
    
    if (valorDevolver > saldoAtual) {
      return res.status(400).json({ error: 'Valor a devolver é maior que o saldo disponível' });
    }

    if (valorDevolver <= 0) {
      return res.status(400).json({ error: 'Valor a devolver deve ser maior que zero' });
    }

    const novoSaldo = saldoAtual - valorDevolver;

    // Atualizar saldo
    await db.runAsync(
      'UPDATE cartoes SET saldo = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?',
      [novoSaldo, id]
    );

    // Cancelar cartão se solicitado ou se saldo ficou zero
    if (cancelar_cartao || novoSaldo === 0) {
      await db.runAsync(
        'UPDATE cartoes SET status = ? WHERE id = ?',
        ['cancelado', id]
      );
    }

    // Registrar transação
    await db.runAsync(
      `INSERT INTO transacoes (cartao_id, tipo, valor, saldo_anterior, saldo_posterior, descricao)
       VALUES (?, 'devolucao', ?, ?, ?, ?)`,
      [id, valorDevolver, saldoAtual, novoSaldo, `Devolução de R$ ${valorDevolver.toFixed(2)}`]
    );

    const cartaoAtualizado = await db.getAsync('SELECT * FROM cartoes WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Saldo devolvido com sucesso',
      cartao: cartaoAtualizado,
      transacao: {
        valor: valorDevolver,
        saldo_anterior: saldoAtual,
        saldo_posterior: novoSaldo,
        cartao_cancelado: cancelar_cartao || novoSaldo === 0
      }
    });

  } catch (error) {
    next(error);
  }
});

// Cancelar cartão
router.post('/cartoes/:id/cancelar', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const cartao = await db.getAsync('SELECT * FROM cartoes WHERE id = ?', [id]);
    
    if (!cartao) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    if (cartao.status === 'cancelado') {
      return res.status(400).json({ error: 'Cartão já está cancelado' });
    }

    // Cancelar cartão
    await db.runAsync(
      'UPDATE cartoes SET status = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?',
      ['cancelado', id]
    );

    // Registrar transação
    await db.runAsync(
      `INSERT INTO transacoes (cartao_id, tipo, valor, saldo_anterior, saldo_posterior, descricao)
       VALUES (?, 'cancelamento', 0.0, ?, ?, ?)`,
      [id, cartao.saldo, cartao.saldo, `Cancelamento do cartão${motivo ? ': ' + motivo : ''}`]
    );

    const cartaoAtualizado = await db.getAsync('SELECT * FROM cartoes WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Cartão cancelado com sucesso',
      cartao: cartaoAtualizado
    });

  } catch (error) {
    next(error);
  }
});

// Listar todos os cartões
router.get('/cartoes', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { status, busca } = req.query;
    
    let query = 'SELECT * FROM cartoes WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (busca) {
      query += ' AND (id LIKE ? OR nome_cliente LIKE ?)';
      const buscaTerm = `%${busca}%`;
      params.push(buscaTerm, buscaTerm);
    }

    query += ' ORDER BY criado_em DESC LIMIT 100';

    const cartoes = await db.allAsync(query, params);
    res.json(cartoes);

  } catch (error) {
    next(error);
  }
});

// Histórico de transações de um cartão
router.get('/cartoes/:id/transacoes', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tipo, limite = 50 } = req.query;

    let query = `SELECT t.*, p.numero_mesa, p.valor_total as pedido_valor
                 FROM transacoes t
                 LEFT JOIN pedidos p ON t.pedido_id = p.id
                 WHERE t.cartao_id = ?`;
    const params = [id];

    if (tipo) {
      query += ' AND t.tipo = ?';
      params.push(tipo);
    }

    query += ' ORDER BY t.criado_em DESC LIMIT ?';
    params.push(parseInt(limite));

    const transacoes = await db.allAsync(query, params);
    res.json(transacoes);

  } catch (error) {
    next(error);
  }
});

// Relatórios
router.get('/relatorios/recargas', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { data } = req.query;
    const dataFiltro = data || new Date().toISOString().split('T')[0];

    const recargas = await db.allAsync(
      `SELECT t.*, c.nome_cliente, c.id as cartao_id
       FROM transacoes t
       JOIN cartoes c ON t.cartao_id = c.id
       WHERE t.tipo = 'recarga' AND DATE(t.criado_em) = ?
       ORDER BY t.criado_em DESC`,
      [dataFiltro]
    );

    const total = recargas.reduce((sum, r) => sum + parseFloat(r.valor || 0), 0);

    res.json({
      data: dataFiltro,
      total_recargas: recargas.length,
      valor_total: total,
      recargas
    });

  } catch (error) {
    next(error);
  }
});

router.get('/relatorios/devolucoes', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { data } = req.query;
    const dataFiltro = data || new Date().toISOString().split('T')[0];

    const devolucoes = await db.allAsync(
      `SELECT t.*, c.nome_cliente, c.id as cartao_id
       FROM transacoes t
       JOIN cartoes c ON t.cartao_id = c.id
       WHERE t.tipo = 'devolucao' AND DATE(t.criado_em) = ?
       ORDER BY t.criado_em DESC`,
      [dataFiltro]
    );

    const total = devolucoes.reduce((sum, d) => sum + parseFloat(d.valor || 0), 0);

    res.json({
      data: dataFiltro,
      total_devolucoes: devolucoes.length,
      valor_total: total,
      devolucoes
    });

  } catch (error) {
    next(error);
  }
});

router.get('/relatorios/cartoes-ativos', authenticate, isAdmin, async (req, res, next) => {
  try {
    const cartoes = await db.allAsync(
      `SELECT id, nome_cliente, saldo, data_ativacao, data_expiracao
       FROM cartoes
       WHERE status = 'ativo'
       ORDER BY nome_cliente`
    );

    const totalSaldo = cartoes.reduce((sum, c) => sum + parseFloat(c.saldo || 0), 0);

    res.json({
      total_cartoes: cartoes.length,
      saldo_total: totalSaldo,
      cartoes
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;

