// Configuração
const API_URL = window.location.origin;
let carrinho = [];
let pedidoData = {
    itens: [],
    observacoes: {},
    numero_mesa: null,
    total: 0
};
let itemObservacaoAtual = null;

// Elementos DOM
const pedidoItens = document.getElementById('pedidoItens');
const subtotal = document.getElementById('subtotal');
const totalPedido = document.getElementById('totalPedido');
const numeroMesa = document.getElementById('numeroMesa');
const btnAvancar = document.getElementById('btnAvancar');
const btnVoltar = document.getElementById('btnVoltar');
const modalObservacao = document.getElementById('modalObservacao');
const observacaoTexto = document.getElementById('observacaoTexto');
const charCount = document.getElementById('charCount');
const btnLogout = document.getElementById('btnLogout');

// Inicialização
window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    await verificarToken();
    carregarCarrinho();
    renderizarPedido();
    atualizarTotal();
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
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('carrinho');
        window.location.href = '/index.html';
    }
}

// Carregar carrinho
function carregarCarrinho() {
    const carrinhoStr = localStorage.getItem('carrinho');
    if (!carrinhoStr) {
        alert('Carrinho vazio! Redirecionando...');
        window.location.href = '/vendas.html';
        return;
    }

    carrinho = JSON.parse(carrinhoStr);
    
    // Carregar observações salvas
    const observacoesStr = localStorage.getItem('observacoes');
    if (observacoesStr) {
        pedidoData.observacoes = JSON.parse(observacoesStr);
    }

    // Carregar número da mesa
    const mesaStr = localStorage.getItem('numeroMesa');
    if (mesaStr) {
        numeroMesa.value = mesaStr;
        pedidoData.numero_mesa = mesaStr || null;
    }
}

// Renderizar pedido
function renderizarPedido() {
    pedidoItens.innerHTML = '';

    if (carrinho.length === 0) {
        pedidoItens.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Nenhum item no pedido.</p>';
        return;
    }

    carrinho.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'pedido-item';
        
        const observacao = pedidoData.observacoes[item.produto_id] || '';
        const itemTotal = item.preco * item.quantidade;

        itemDiv.innerHTML = `
            <div class="item-header">
                <div class="item-nome-quantidade">
                    <div class="item-nome">${item.nome}</div>
                    <div class="item-quantidade-preco">
                        <span>Qtd: ${item.quantidade}</span>
                        <span>×</span>
                        <span>R$ ${formatarPreco(item.preco)}</span>
                    </div>
                </div>
                <div class="item-total">R$ ${formatarPreco(itemTotal)}</div>
            </div>
            <div class="item-observacao">
                ${observacao ? 
                    `<div class="observacao-texto">📝 ${observacao}</div>` : 
                    `<div class="observacao-vazia">Sem observação</div>`
                }
                <button class="btn-observacao" onclick="abrirModalObservacao(${item.produto_id}, ${index})">
                    ${observacao ? '✏️ Editar Observação' : '➕ Adicionar Observação'}
                </button>
            </div>
        `;

        pedidoItens.appendChild(itemDiv);
    });
}

// Abrir modal de observação
window.abrirModalObservacao = function(produtoId, index) {
    itemObservacaoAtual = { produtoId, index };
    const observacao = pedidoData.observacoes[produtoId] || '';
    observacaoTexto.value = observacao;
    charCount.textContent = observacao.length;
    
    const produto = carrinho[index];
    document.getElementById('modalObservacaoTitulo').textContent = `Observação - ${produto.nome}`;
    modalObservacao.classList.add('ativo');
    observacaoTexto.focus();
};

// Fechar modal de observação
function fecharModalObservacao() {
    modalObservacao.classList.remove('ativo');
    itemObservacaoAtual = null;
    observacaoTexto.value = '';
    charCount.textContent = '0';
}

// Salvar observação
function salvarObservacao() {
    if (!itemObservacaoAtual) return;

    const texto = observacaoTexto.value.trim();
    const produtoId = itemObservacaoAtual.produtoId;

    if (texto) {
        pedidoData.observacoes[produtoId] = texto;
    } else {
        delete pedidoData.observacoes[produtoId];
    }

    localStorage.setItem('observacoes', JSON.stringify(pedidoData.observacoes));
    renderizarPedido();
    fecharModalObservacao();
}

// Atualizar contador de caracteres
observacaoTexto.addEventListener('input', () => {
    const length = observacaoTexto.value.length;
    charCount.textContent = length;
    
    if (length > 200) {
        observacaoTexto.value = observacaoTexto.value.substring(0, 200);
        charCount.textContent = '200';
    }
});

// Atualizar total
function atualizarTotal() {
    const total = carrinho.reduce((sum, item) => {
        return sum + (item.preco * item.quantidade);
    }, 0);

    subtotal.textContent = `R$ ${formatarPreco(total)}`;
    totalPedido.textContent = `R$ ${formatarPreco(total)}`;
    pedidoData.total = total;

    // Validar se pode avançar
    btnAvancar.disabled = carrinho.length === 0;
}

// Salvar número da mesa
numeroMesa.addEventListener('input', () => {
    const mesa = numeroMesa.value.trim();
    pedidoData.numero_mesa = mesa || null;
    localStorage.setItem('numeroMesa', mesa);
});

// Avançar para pagamento
async function avancarParaPagamento() {
    if (carrinho.length === 0) {
        alert('Adicione itens ao pedido antes de continuar.');
        return;
    }

    // Preparar dados do pedido
    const itens = carrinho.map(item => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco,
        observacao: pedidoData.observacoes[item.produto_id] || null
    }));

    const pedido = {
        numero_mesa: pedidoData.numero_mesa || null,
        itens: itens
    };

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(pedido)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao criar pedido');
        }

        // Salvar ID do pedido para a tela de pagamento
        localStorage.setItem('pedidoAtual', JSON.stringify(data));
        
        // Limpar carrinho e observações
        localStorage.removeItem('carrinho');
        localStorage.removeItem('observacoes');
        localStorage.removeItem('numeroMesa');

        // Redirecionar para pagamento
        window.location.href = '/pagamento.html';

    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        alert('Erro ao criar pedido: ' + error.message);
    }
}

// Voltar ao carrinho
function voltarAoCarrinho() {
    window.location.href = '/vendas.html';
}

// Formatar preço
function formatarPreco(valor) {
    return parseFloat(valor).toFixed(2).replace('.', ',');
}

// Event Listeners
btnAvancar.addEventListener('click', avancarParaPagamento);
btnVoltar.addEventListener('click', voltarAoCarrinho);
btnLogout.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/index.html';
});

// Modal
document.getElementById('btnFecharModalObs').addEventListener('click', fecharModalObservacao);
document.getElementById('btnCancelarObs').addEventListener('click', fecharModalObservacao);
document.getElementById('btnSalvarObs').addEventListener('click', salvarObservacao);

// Fechar modal ao clicar fora
modalObservacao.addEventListener('click', (e) => {
    if (e.target === modalObservacao) {
        fecharModalObservacao();
    }
});

// Enter no textarea salva a observação
observacaoTexto.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        salvarObservacao();
    }
});

