// Configuração
const API_URL = window.location.origin;
let categorias = [];
let produtos = [];
let carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
let produtoSelecionado = null;

// Elementos DOM
const telaCategorias = document.getElementById('telaCategorias');
const telaProdutos = document.getElementById('telaProdutos');
const telaCarrinho = document.getElementById('telaCarrinho');
const categoriasGrid = document.getElementById('categoriasGrid');
const produtosGrid = document.getElementById('produtosGrid');
const carrinhoItens = document.getElementById('carrinhoItens');
const carrinhoTotal = document.getElementById('carrinhoTotal');
const carrinhoBadge = document.getElementById('carrinhoBadge');
const carrinhoCount = document.getElementById('carrinhoCount');
const modalQuantidade = document.getElementById('modalQuantidade');
const btnCarrinho = document.getElementById('btnCarrinho');
const btnLogout = document.getElementById('btnLogout');
const btnVoltarCategorias = document.getElementById('btnVoltarCategorias');
const btnVoltarProdutos = document.getElementById('btnVoltarProdutos');
const btnFinalizarCompra = document.getElementById('btnFinalizarCompra');

// Verificar autenticação
window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    await verificarToken();
    await carregarCategorias();
    atualizarCarrinho();
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
        window.location.href = '/index.html';
    }
}

// Carregar categorias
async function carregarCategorias() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/categorias`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Erro ao carregar categorias');

        categorias = await response.json();
        renderizarCategorias();
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        alert('Erro ao carregar categorias. Tente novamente.');
    }
}

// Renderizar categorias
function renderizarCategorias() {
    categoriasGrid.innerHTML = '';

    const icons = {
        'Refrigerante': '🥤',
        'Cerveja': '🍺',
        'Chopp': '🍻',
        'Porções': '🍽️',
        'Lanches': '🍔',
        'Picolés': '🍦'
    };

    categorias.forEach(categoria => {
        const card = document.createElement('div');
        card.className = 'categoria-card';
        card.innerHTML = `
            <div class="categoria-icon">${icons[categoria.nome] || '📦'}</div>
            <h3>${categoria.nome}</h3>
        `;
        card.addEventListener('click', () => abrirCategoria(categoria.id));
        categoriasGrid.appendChild(card);
    });
}

// Abrir categoria
async function abrirCategoria(categoriaId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/produtos/categoria/${categoriaId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Erro ao carregar produtos');

        produtos = await response.json();
        const categoria = categorias.find(c => c.id === categoriaId);
        
        document.getElementById('tituloCategoria').textContent = categoria.nome;
        renderizarProdutos();
        mostrarTela('produtos');
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        alert('Erro ao carregar produtos. Tente novamente.');
    }
}

// Renderizar produtos
function renderizarProdutos() {
    produtosGrid.innerHTML = '';

    if (produtos.length === 0) {
        produtosGrid.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Nenhum produto encontrado nesta categoria.</p>';
        return;
    }

    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'produto-card';
        card.innerHTML = `
            <div class="produto-nome">${produto.nome}</div>
            <div class="produto-preco">R$ ${formatarPreco(produto.preco)}</div>
            ${produto.descricao ? `<div class="produto-descricao">${produto.descricao}</div>` : ''}
        `;
        card.addEventListener('click', () => abrirModalProduto(produto));
        produtosGrid.appendChild(card);
    });
}

// Abrir modal de produto
function abrirModalProduto(produto) {
    produtoSelecionado = produto;
    document.getElementById('modalProdutoNome').textContent = produto.nome;
    document.getElementById('modalProdutoPreco').textContent = `R$ ${formatarPreco(produto.preco)}`;
    document.getElementById('modalProdutoDescricao').textContent = produto.descricao || '';
    document.getElementById('quantidade').value = 1;
    modalQuantidade.classList.add('ativo');
}

// Fechar modal
function fecharModal() {
    modalQuantidade.classList.remove('ativo');
    produtoSelecionado = null;
}

// Adicionar ao carrinho
function adicionarAoCarrinho() {
    if (!produtoSelecionado) return;

    const quantidade = parseInt(document.getElementById('quantidade').value);
    const itemExistente = carrinho.find(item => item.produto_id === produtoSelecionado.id);

    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        carrinho.push({
            produto_id: produtoSelecionado.id,
            nome: produtoSelecionado.nome,
            preco: produtoSelecionado.preco,
            quantidade: quantidade
        });
    }

    salvarCarrinho();
    atualizarCarrinho();
    fecharModal();
}

// Remover do carrinho
function removerDoCarrinho(produtoId) {
    carrinho = carrinho.filter(item => item.produto_id !== produtoId);
    salvarCarrinho();
    atualizarCarrinho();
}

// Atualizar quantidade no carrinho
function atualizarQuantidadeCarrinho(produtoId, novaQuantidade) {
    const item = carrinho.find(item => item.produto_id === produtoId);
    if (item) {
        if (novaQuantidade <= 0) {
            removerDoCarrinho(produtoId);
        } else {
            item.quantidade = novaQuantidade;
            salvarCarrinho();
            atualizarCarrinho();
        }
    }
}

// Salvar carrinho
function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

// Atualizar carrinho
function atualizarCarrinho() {
    const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    
    if (totalItens > 0) {
        carrinhoBadge.style.display = 'flex';
        carrinhoCount.textContent = totalItens;
    } else {
        carrinhoBadge.style.display = 'none';
    }

    const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    carrinhoTotal.textContent = `R$ ${formatarPreco(total)}`;
    btnFinalizarCompra.disabled = carrinho.length === 0;

    renderizarCarrinho();
}

// Renderizar carrinho
function renderizarCarrinho() {
    if (carrinho.length === 0) {
        carrinhoItens.innerHTML = '<div class="carrinho-vazio">Carrinho vazio</div>';
        return;
    }

    carrinhoItens.innerHTML = '';
    carrinho.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carrinho-item';
        itemDiv.innerHTML = `
            <div class="item-info">
                <div class="item-nome">${item.nome}</div>
                <div class="item-detalhes">Qtd: ${item.quantidade} × R$ ${formatarPreco(item.preco)}</div>
            </div>
            <div class="item-controles">
                <div class="item-quantidade">
                    <button class="btn-quantidade" onclick="atualizarQuantidadeCarrinho(${item.produto_id}, ${item.quantidade - 1})">-</button>
                    <span style="min-width: 30px; text-align: center;">${item.quantidade}</span>
                    <button class="btn-quantidade" onclick="atualizarQuantidadeCarrinho(${item.produto_id}, ${item.quantidade + 1})">+</button>
                </div>
                <div class="item-preco">R$ ${formatarPreco(item.preco * item.quantidade)}</div>
                <button class="btn-remover" onclick="removerDoCarrinho(${item.produto_id})">Remover</button>
            </div>
        `;
        carrinhoItens.appendChild(itemDiv);
    });
}

// Finalizar compra
function finalizarCompra() {
    if (carrinho.length === 0) return;
    window.location.href = '/revisao.html';
}

// Mostrar tela
function mostrarTela(tela) {
    telaCategorias.classList.remove('ativa');
    telaProdutos.classList.remove('ativa');
    telaCarrinho.classList.remove('ativa');

    if (tela === 'categorias') {
        telaCategorias.classList.add('ativa');
    } else if (tela === 'produtos') {
        telaProdutos.classList.add('ativa');
    } else if (tela === 'carrinho') {
        telaCarrinho.classList.add('ativa');
        atualizarCarrinho();
    }
}

// Formatar preço
function formatarPreco(valor) {
    return parseFloat(valor).toFixed(2).replace('.', ',');
}

// Event Listeners
btnCarrinho.addEventListener('click', () => mostrarTela('carrinho'));
btnLogout.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('carrinho');
    window.location.href = '/index.html';
});
btnVoltarCategorias.addEventListener('click', () => mostrarTela('categorias'));
btnVoltarProdutos.addEventListener('click', () => mostrarTela('produtos'));
btnFinalizarCompra.addEventListener('click', finalizarCompra);

// Modal
document.getElementById('btnFecharModal').addEventListener('click', fecharModal);
document.getElementById('btnCancelarModal').addEventListener('click', fecharModal);
document.getElementById('btnAdicionarCarrinho').addEventListener('click', adicionarAoCarrinho);

// Controles de quantidade no modal
document.getElementById('btnDiminuir').addEventListener('click', () => {
    const input = document.getElementById('quantidade');
    const valor = parseInt(input.value);
    if (valor > 1) {
        input.value = valor - 1;
    }
});

document.getElementById('btnAumentar').addEventListener('click', () => {
    const input = document.getElementById('quantidade');
    input.value = parseInt(input.value) + 1;
});

// Fechar modal ao clicar fora
modalQuantidade.addEventListener('click', (e) => {
    if (e.target === modalQuantidade) {
        fecharModal();
    }
});

// Exportar funções para uso global
window.atualizarQuantidadeCarrinho = atualizarQuantidadeCarrinho;
window.removerDoCarrinho = removerDoCarrinho;

