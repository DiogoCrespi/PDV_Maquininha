const db = require('../config/database');

async function listarCartoes() {
  try {
    const cartoes = await db.allAsync(
      "SELECT id, nome_cliente, saldo, status FROM cartoes WHERE status = 'ativo' ORDER BY id LIMIT 10"
    );

    console.log('\n📋 Cartões Ativos no Banco:');
    console.log('='.repeat(50));
    
    if (cartoes.length === 0) {
      console.log('Nenhum cartão ativo encontrado.');
    } else {
      cartoes.forEach((c, index) => {
        console.log(`${index + 1}. ID: ${c.id}`);
        console.log(`   Cliente: ${c.nome_cliente}`);
        console.log(`   Saldo: R$ ${parseFloat(c.saldo).toFixed(2)}`);
        console.log(`   Status: ${c.status}`);
        console.log('');
      });
    }

    console.log('='.repeat(50));
    console.log(`\n✅ Total: ${cartoes.length} cartão(ões) ativo(s)\n`);

    // Sugerir um cartão com saldo
    const cartaoComSaldo = cartoes.find(c => parseFloat(c.saldo) > 0);
    if (cartaoComSaldo) {
      console.log('💡 Cartão sugerido para teste:');
      console.log(`   ID: ${cartaoComSaldo.id}`);
      console.log(`   Cliente: ${cartaoComSaldo.nome_cliente}`);
      console.log(`   Saldo disponível: R$ ${parseFloat(cartaoComSaldo.saldo).toFixed(2)}\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Erro ao listar cartões:', error);
    process.exit(1);
  }
}

listarCartoes();

