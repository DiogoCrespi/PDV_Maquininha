// Configuração
const API_URL = window.location.origin;
let pedidoAtual = null;
let cartaoAtual = null;
let valorPedido = 0;

// Elementos DOM
const pedidoResumo = document.getElementById('pedidoResumo');
const valorTotal = document.getElementById('valorTotal');
const cartaoId = document.getElementById('cartaoId');
const btnBuscarCartao = document.getElementById('btnBuscarCartao');
const cartaoDados = document.getElementById('cartaoDados');
const nomeCliente = document.getElementById('nomeCliente');
const saldoCartao = document.getElementById('saldoCartao');
const valorPedidoEl = document.getElementById('valorPedido');
const saldoApos = document.getElementById('saldoApos');
const horarioAtual = document.getElementById('horarioAtual');
const btnPagar = document.getElementById('btnPagar');
const btnCancelar = document.getElementById('btnCancelar');
const btnLogout = document.getElementById('btnLogout');
const mensagemErro = document.getElementById('mensagemErro');
const mensagemSucesso = document.getElementById('mensagemSucesso');
const modalConfirmacao = document.getElementById('modalConfirmacao');

// Inicialização
window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    await verificarToken();
    carregarPedido();
    atualizarHorario();
    setInterval(atualizarHorario, 1000);

    // Focar no campo de cartão
    cartaoId.focus();

    // Enter no campo de cartão busca automaticamente
    cartaoId.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            buscarCartao();
        }
    });
});

// Verificar token
async function verificarToken() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Token inválido');
        }
    } catch (error) {
        localStorage.clear();
        window.location.href = '/index.html';
    }
}

// Carregar pedido
function carregarPedido() {
    const pedidoStr = localStorage.getItem('pedidoAtual');
    if (!pedidoStr) {
        alert('Nenhum pedido encontrado! Redirecionando...');
        window.location.href = '/vendas.html';
        return;
    }

    pedidoAtual = JSON.parse(pedidoStr);
    valorPedido = pedidoAtual.valor_total || 0;
    
    renderizarResumo();
    valorTotal.textContent = `R$ ${formatarPreco(valorPedido)}`;
    valorPedidoEl.textContent = `R$ ${formatarPreco(valorPedido)}`;
}

// Renderizar resumo do pedido
function renderizarResumo() {
    if (!pedidoAtual || !pedidoAtual.itens) {
        pedidoResumo.innerHTML = '<p>Nenhum item encontrado.</p>';
        return;
    }

    pedidoResumo.innerHTML = '';
    pedidoAtual.itens.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'resumo-item';
        const itemTotal = item.preco_unitario * item.quantidade;
        itemDiv.innerHTML = `
            <div class="resumo-item-nome">
                <div>${item.produto_nome}</div>
                <div class="resumo-item-detalhes">
                    Qtd: ${item.quantidade} × R$ ${formatarPreco(item.preco_unitario)}
                    ${item.observacao ? ` • ${item.observacao}` : ''}
                </div>
            </div>
            <div class="resumo-item-valor">R$ ${formatarPreco(itemTotal)}</div>
        `;
        pedidoResumo.appendChild(itemDiv);
    });
}

// Buscar cartão
async function buscarCartao() {
    const id = cartaoId.value.trim().toUpperCase();
    
    if (!id) {
        mostrarErro('Digite ou passe o ID do cartão');
        return;
    }

    btnBuscarCartao.disabled = true;
    btnBuscarCartao.innerHTML = '🔍 Buscando...';
    ocultarMensagens();

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/cartoes/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Cartão não encontrado');
        }

        cartaoAtual = data;
        exibirDadosCartao();

    } catch (error) {
        console.error('Erro ao buscar cartão:', error);
        mostrarErro(error.message || 'Erro ao buscar cartão. Verifique o ID e tente novamente.');
        cartaoAtual = null;
        ocultarDadosCartao();
    } finally {
        btnBuscarCartao.disabled = false;
        btnBuscarCartao.innerHTML = '🔍 Buscar';
    }
}

// Exibir dados do cartão
function exibirDadosCartao() {
    if (!cartaoAtual) return;

    nomeCliente.textContent = cartaoAtual.nome_cliente || '-';
    saldoCartao.textContent = `R$ ${formatarPreco(cartaoAtual.saldo || 0)}`;
    
    const saldo = parseFloat(cartaoAtual.saldo || 0);
    const saldoAposPagamento = saldo - valorPedido;

    saldoApos.textContent = `R$ ${formatarPreco(saldoAposPagamento)}`;
    
    // Verificar se saldo é suficiente
    if (saldoAposPagamento < 0) {
        saldoApos.classList.add('saldo-insuficiente');
        saldoApos.classList.remove('saldo-apos');
        mostrarErro('Saldo insuficiente! O cartão não possui saldo suficiente para este pedido.');
        btnPagar.disabled = true;
    } else {
        saldoApos.classList.remove('saldo-insuficiente');
        saldoApos.classList.add('saldo-apos');
        ocultarMensagens();
        btnPagar.disabled = false;
    }

    // Verificar se cartão está ativo
    if (cartaoAtual.status !== 'ativo') {
        mostrarErro('Cartão não está ativo. Entre em contato com a bilheteria.');
        btnPagar.disabled = true;
    }

    cartaoDados.style.display = 'block';
}

// Ocultar dados do cartão
function ocultarDadosCartao() {
    cartaoDados.style.display = 'none';
    btnPagar.disabled = true;
}

// Atualizar horário
function atualizarHorario() {
    const agora = new Date();
    const hora = agora.toLocaleTimeString('pt-BR');
    horarioAtual.textContent = hora;
}

// Processar pagamento
async function processarPagamento() {
    if (!cartaoAtual) {
        mostrarErro('Selecione um cartão primeiro');
        return;
    }

    if (!pedidoAtual) {
        mostrarErro('Pedido não encontrado');
        return;
    }

    // Validar saldo
    const saldo = parseFloat(cartaoAtual.saldo || 0);
    if (saldo < valorPedido) {
        mostrarErro('Saldo insuficiente!');
        return;
    }

    // Validar cartão ativo
    if (cartaoAtual.status !== 'ativo') {
        mostrarErro('Cartão não está ativo');
        return;
    }

    // Mostrar modal de confirmação
    document.getElementById('confirmNome').textContent = cartaoAtual.nome_cliente;
    document.getElementById('confirmValor').textContent = `R$ ${formatarPreco(valorPedido)}`;
    const saldoApos = saldo - valorPedido;
    document.getElementById('confirmSaldo').textContent = `R$ ${formatarPreco(saldoApos)}`;
    modalConfirmacao.classList.add('ativo');
}

// Confirmar pagamento
async function confirmarPagamento() {
    modalConfirmacao.classList.remove('ativo');
    btnPagar.disabled = true;
    btnPagar.innerHTML = '⏳ Processando...';

    try {
        const token = localStorage.getItem('token');
        
        // Processar pagamento
        const response = await fetch(`${API_URL}/api/pagamentos/processar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                pedido_id: pedidoAtual.id,
                cartao_id: cartaoAtual.id,
                valor: valorPedido
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao processar pagamento');
        }

        // Sucesso!
        mostrarSucesso('Pagamento processado com sucesso!');
        
        // Limpar dados
        localStorage.removeItem('pedidoAtual');
        
        // Aguardar um pouco e redirecionar
        setTimeout(() => {
            // Verificar se precisa imprimir comanda (FASE 5)
            // Por enquanto, apenas redirecionar para vendas
            window.location.href = '/vendas.html';
        }, 2000);

    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        mostrarErro(error.message || 'Erro ao processar pagamento. Tente novamente.');
        btnPagar.disabled = false;
        btnPagar.innerHTML = '💳 Processar Pagamento';
    }
}

// Mostrar erro
function mostrarErro(mensagem) {
    mensagemErro.textContent = mensagem;
    mensagemErro.style.display = 'block';
    mensagemSucesso.style.display = 'none';
}

// Mostrar sucesso
function mostrarSucesso(mensagem) {
    mensagemSucesso.textContent = mensagem;
    mensagemSucesso.style.display = 'block';
    mensagemErro.style.display = 'none';
}

// Ocultar mensagens
function ocultarMensagens() {
    mensagemErro.style.display = 'none';
    mensagemSucesso.style.display = 'none';
}

// Cancelar
function cancelar() {
    if (confirm('Deseja cancelar o pagamento? O pedido será mantido.')) {
        window.location.href = '/vendas.html';
    }
}

// Formatar preço
function formatarPreco(valor) {
    return parseFloat(valor).toFixed(2).replace('.', ',');
}

// Event Listeners
btnBuscarCartao.addEventListener('click', buscarCartao);
btnPagar.addEventListener('click', processarPagamento);
btnCancelar.addEventListener('click', cancelar);
btnLogout.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/index.html';
});

// Modal
document.getElementById('btnFecharModal').addEventListener('click', () => {
    modalConfirmacao.classList.remove('ativo');
});
document.getElementById('btnCancelarConfirmacao').addEventListener('click', () => {
    modalConfirmacao.classList.remove('ativo');
});
document.getElementById('btnConfirmarPagamento').addEventListener('click', confirmarPagamento);

// Fechar modal ao clicar fora
modalConfirmacao.addEventListener('click', (e) => {
    if (e.target === modalConfirmacao) {
        modalConfirmacao.classList.remove('ativo');
    }
});

