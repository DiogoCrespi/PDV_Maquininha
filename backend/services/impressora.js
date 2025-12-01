const db = require('../config/database');
const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer');

// Configuração da impressora (pode ser ajustada via .env)
const IMPRESSORA_CONFIG = {
  tipo: process.env.IMPRESSORA_TIPO || 'network', // 'network', 'usb', 'serial'
  ip: process.env.IMPRESSORA_IP || '192.168.1.100',
  porta: parseInt(process.env.IMPRESSORA_PORTA) || 9100,
  modelo: process.env.IMPRESSORA_MODELO || 'epson', // 'epson', 'star', 'bematech'
  nomeEstabelecimento: process.env.NOME_ESTABELECIMENTO || 'RozAdeVinEdu',
  caracteres: parseInt(process.env.IMPRESSORA_CARACTERES) || 48 // Largura padrão
};

/**
 * Inicializa a impressora térmica
 */
function inicializarImpressora() {
  let printer;

  // Mapear modelo para tipo de impressora
  const tiposImpressora = {
    'epson': PrinterTypes.EPSON,
    'star': PrinterTypes.STAR,
    'bematech': PrinterTypes.BEMATECH
  };

  const tipoImpressora = tiposImpressora[IMPRESSORA_CONFIG.modelo.toLowerCase()] || PrinterTypes.EPSON;

  if (IMPRESSORA_CONFIG.tipo === 'network') {
    printer = new ThermalPrinter({
      type: tipoImpressora,
      interface: `tcp://${IMPRESSORA_CONFIG.ip}:${IMPRESSORA_CONFIG.porta}`,
      characterSet: CharacterSet.PC852_LATIN2,
      breakLine: BreakLine.WORD,
      options: {
        timeout: 3000
      }
    });
  } else if (IMPRESSORA_CONFIG.tipo === 'usb') {
    printer = new ThermalPrinter({
      type: tipoImpressora,
      interface: process.env.IMPRESSORA_USB_PATH || '/dev/usb/lp0',
      characterSet: CharacterSet.PC852_LATIN2,
      breakLine: BreakLine.WORD
    });
  } else if (IMPRESSORA_CONFIG.tipo === 'serial') {
    printer = new ThermalPrinter({
      type: tipoImpressora,
      interface: process.env.IMPRESSORA_SERIAL_PATH || '/dev/ttyUSB0',
      characterSet: CharacterSet.PC852_LAT2,
      breakLine: BreakLine.WORD
    });
  } else {
    // Modo simulação (para desenvolvimento sem impressora)
    printer = null;
  }

  return printer;
}

/**
 * Verifica se o pedido contém itens que requerem comanda
 */
async function pedidoRequerComanda(pedidoId) {
  try {
    const itens = await db.allAsync(
      `SELECT c.requer_comanda
       FROM itens_pedido ip
       JOIN produtos p ON ip.produto_id = p.id
       JOIN categorias c ON p.categoria_id = c.id
       WHERE ip.pedido_id = ? AND c.requer_comanda = 1
       LIMIT 1`,
      [pedidoId]
    );

    return itens.length > 0;
  } catch (error) {
    console.error('Erro ao verificar se pedido requer comanda:', error);
    return false;
  }
}

/**
 * Busca dados completos do pedido para impressão
 */
async function buscarDadosComanda(pedidoId) {
  try {
    const pedido = await db.getAsync(
      `SELECT p.*, u.nome as usuario_nome
       FROM pedidos p
       LEFT JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.id = ?`,
      [pedidoId]
    );

    // Buscar nome do cliente através da transação
    const transacao = await db.getAsync(
      `SELECT c.nome_cliente, c.id as cartao_id
       FROM transacoes t
       JOIN cartoes c ON t.cartao_id = c.id
       WHERE t.pedido_id = ? AND t.tipo = 'pagamento'
       ORDER BY t.criado_em DESC
       LIMIT 1`,
      [pedidoId]
    );

    if (transacao) {
      pedido.nome_cliente = transacao.nome_cliente;
      pedido.cartao_id = transacao.cartao_id;
    }

    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    const itens = await db.allAsync(
      `SELECT ip.*, pr.nome as produto_nome, c.nome as categoria_nome, c.requer_comanda
       FROM itens_pedido ip
       JOIN produtos pr ON ip.produto_id = pr.id
       JOIN categorias c ON pr.categoria_id = c.id
       WHERE ip.pedido_id = ? AND c.requer_comanda = 1
       ORDER BY ip.id`,
      [pedidoId]
    );

    return {
      pedido,
      itens
    };
  } catch (error) {
    console.error('Erro ao buscar dados da comanda:', error);
    throw error;
  }
}

/**
 * Formata comanda para impressão térmica
 */
function formatarComanda(dados) {
  const { pedido, itens } = dados;
  const agora = new Date();
  const dataHora = agora.toLocaleString('pt-BR');

  let comanda = '';

  // Cabeçalho
  comanda += '='.repeat(32) + '\n';
  comanda += `${IMPRESSORA_CONFIG.nomeEstabelecimento}\n`.padStart((32 + IMPRESSORA_CONFIG.nomeEstabelecimento.length) / 2);
  comanda += '='.repeat(32) + '\n';
  comanda += `Data: ${dataHora}\n`;
  comanda += `Pedido: #${pedido.id}\n`;
  comanda += '-'.repeat(32) + '\n';

  // Informações
  if (pedido.numero_mesa) {
    comanda += `MESA: ${pedido.numero_mesa}\n`;
  } else {
    comanda += 'MESA: BALCÃO/VIAGEM\n';
  }

  if (pedido.nome_cliente) {
    comanda += `Cliente: ${pedido.nome_cliente}\n`;
  }

  comanda += '-'.repeat(32) + '\n';
  comanda += 'ITENS:\n';
  comanda += '-'.repeat(32) + '\n';

  // Itens
  itens.forEach((item, index) => {
    comanda += `${index + 1}. ${item.produto_nome}\n`;
    comanda += `   Qtd: ${item.quantidade} × R$ ${parseFloat(item.preco_unitario).toFixed(2).replace('.', ',')}\n`;
    if (item.observacao) {
      comanda += `   Obs: ${item.observacao}\n`;
    }
    comanda += '\n';
  });

  comanda += '-'.repeat(32) + '\n';
  comanda += `TOTAL: R$ ${parseFloat(pedido.valor_total).toFixed(2).replace('.', ',')}\n`;
  comanda += '='.repeat(32) + '\n';
  comanda += '\n';
  comanda += '\n';
  comanda += '\n';

  return comanda;
}

/**
 * Imprime comanda usando impressora térmica
 */
async function imprimirComanda(pedidoId) {
  try {
    // Verificar se pedido requer comanda
    const requerComanda = await pedidoRequerComanda(pedidoId);
    if (!requerComanda) {
      return { success: true, message: 'Pedido não requer comanda' };
    }

    // Buscar dados
    const dados = await buscarDadosComanda(pedidoId);
    
    // Inicializar impressora
    const printer = inicializarImpressora();

    if (!printer) {
      // Modo simulação (sem impressora configurada)
      const comandaFormatada = formatarComanda(dados);
      console.log('='.repeat(50));
      console.log('COMANDA PARA IMPRESSÃO (SIMULAÇÃO):');
      console.log('='.repeat(50));
      console.log(comandaFormatada);
      console.log('='.repeat(50));

      await db.runAsync(
        'UPDATE pedidos SET comanda_impressa = 1 WHERE id = ?',
        [pedidoId]
      );

      return {
        success: true,
        message: 'Comanda preparada (modo simulação - impressora não configurada)',
        comanda: comandaFormatada
      };
    }

    // Verificar se impressora está conectada
    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      throw new Error('Impressora não está conectada. Verifique a conexão.');
    }

    // Preparar comanda para impressão
    const { pedido, itens } = dados;
    const agora = new Date();
    const dataHora = agora.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Limpar buffer da impressora
    printer.clear();

    // Cabeçalho
    printer.alignCenter();
    printer.setTextSize(1, 1);
    printer.bold(true);
    printer.println(IMPRESSORA_CONFIG.nomeEstabelecimento);
    printer.bold(false);
    printer.drawLine();
    
    printer.alignLeft();
    printer.println(`Data: ${dataHora}`);
    printer.println(`Pedido: #${pedido.id}`);
    printer.drawLine();

    // Informações
    if (pedido.numero_mesa) {
      printer.bold(true);
      printer.println(`MESA: ${pedido.numero_mesa}`);
      printer.bold(false);
    } else {
      printer.bold(true);
      printer.println('MESA: BALCÃO/VIAGEM');
      printer.bold(false);
    }

    if (pedido.nome_cliente) {
      printer.println(`Cliente: ${pedido.nome_cliente}`);
    }

    printer.drawLine();
    printer.bold(true);
    printer.println('ITENS:');
    printer.bold(false);
    printer.drawLine();

    // Itens
    itens.forEach((item, index) => {
      printer.println(`${index + 1}. ${item.produto_nome}`);
      printer.println(`   Qtd: ${item.quantidade} × R$ ${parseFloat(item.preco_unitario).toFixed(2).replace('.', ',')}`);
      if (item.observacao) {
        printer.println(`   Obs: ${item.observacao}`);
      }
      printer.newLine();
    });

    printer.drawLine();
    printer.bold(true);
    printer.println(`TOTAL: R$ ${parseFloat(pedido.valor_total).toFixed(2).replace('.', ',')}`);
    printer.bold(false);
    printer.drawLine();
    
    // Espaços finais
    printer.newLine();
    printer.newLine();
    printer.newLine();

    // Cortar papel (se suportado)
    printer.cut();

    // Imprimir
    await printer.execute();

    // Marcar comanda como impressa
    await db.runAsync(
      'UPDATE pedidos SET comanda_impressa = 1 WHERE id = ?',
      [pedidoId]
    );

    console.log(`✅ Comanda do pedido #${pedidoId} impressa com sucesso`);

    return {
      success: true,
      message: 'Comanda impressa com sucesso'
    };

  } catch (error) {
    console.error('❌ Erro ao imprimir comanda:', error);
    
    // Em caso de erro, ainda marca como tentada (para permitir reimpressão)
    return {
      success: false,
      error: error.message || 'Erro ao conectar com a impressora',
      details: error.toString()
    };
  }
}

/**
 * Reimprime comanda
 */
async function reimprimirComanda(pedidoId) {
  return await imprimirComanda(pedidoId);
}

module.exports = {
  pedidoRequerComanda,
  buscarDadosComanda,
  formatarComanda,
  imprimirComanda,
  reimprimirComanda,
  IMPRESSORA_CONFIG
};

