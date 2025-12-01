// Configuração
const API_URL = window.location.origin;
let cartaoAtual = null;

// Elementos DOM
const navBtns = document.querySelectorAll('.nav-btn');
const telas = document.querySelectorAll('.tela');
const btnLogout = document.getElementById('btnLogout');
const usuarioNome = document.getElementById('usuarioNome');

// Inicialização
window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    await verificarToken();
    carregarUsuario();
    configurarNavegacao();
    configurarFormularios();
    configurarRelatorios();
});

// Verificar token e permissões
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

        const data = await response.json();
        
        // Verificar se é admin
        if (data.usuario.tipo !== 'admin') {
            alert('Acesso negado. Apenas administradores podem acessar a bilheteria.');
            window.location.href = '/vendas.html';
            return;
        }
    } catch (error) {
        localStorage.clear();
        window.location.href = '/index.html';
    }
}

// Carregar nome do usuário
function carregarUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    usuarioNome.textContent = usuario.nome || 'Usuário';
}

// Configurar navegação
function configurarNavegacao() {
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tela = btn.dataset.tela;
            mostrarTela(tela);
        });
    });
}

function mostrarTela(nomeTela) {
    // Atualizar botões
    navBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tela === nomeTela) {
            btn.classList.add('active');
        }
    });

    // Mostrar tela
    telas.forEach(tela => {
        tela.classList.remove('ativa');
        if (tela.id === `tela${nomeTela.charAt(0).toUpperCase() + nomeTela.slice(1)}`) {
            tela.classList.add('ativa');
        }
    });

    // Limpar resultados
    document.querySelectorAll('.resultado').forEach(r => {
        r.className = 'resultado';
        r.textContent = '';
    });
}

// Configurar formulários
function configurarFormularios() {
    // Ativar cartão
    document.getElementById('formAtivar').addEventListener('submit', async (e) => {
        e.preventDefault();
        const cartaoId = document.getElementById('ativarCartaoId').value.trim().toUpperCase();
        const nomeCliente = document.getElementById('ativarNomeCliente').value.trim();
        const resultado = document.getElementById('resultadoAtivar');

        try {
            const response = await fetch(`${API_URL}/api/bilheteria/cartoes/ativar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ cartao_id: cartaoId, nome_cliente: nomeCliente })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao ativar cartão');
            }

            resultado.className = 'resultado sucesso';
            resultado.textContent = `✅ Cartão ${cartaoId} ativado com sucesso para ${nomeCliente}!`;
            document.getElementById('formAtivar').reset();

        } catch (error) {
            resultado.className = 'resultado erro';
            resultado.textContent = `❌ ${error.message}`;
        }
    });

    // Recarregar saldo
    document.getElementById('btnBuscarRecarregar').addEventListener('click', buscarCartaoRecarregar);
    document.getElementById('formRecarregar').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!cartaoAtual) {
            alert('Busque o cartão primeiro');
            return;
        }

        const valor = parseFloat(document.getElementById('recarregarValor').value);
        const resultado = document.getElementById('resultadoRecarregar');

        try {
            const response = await fetch(`${API_URL}/api/bilheteria/cartoes/${cartaoAtual.id}/recarregar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ valor })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao recarregar saldo');
            }

            resultado.className = 'resultado sucesso';
            resultado.textContent = `✅ Saldo recarregado com sucesso! Novo saldo: R$ ${formatarPreco(data.cartao.saldo)}`;
            cartaoAtual = data.cartao;
            atualizarDadosCartaoRecarregar();
            document.getElementById('recarregarValor').value = '';

        } catch (error) {
            resultado.className = 'resultado erro';
            resultado.textContent = `❌ ${error.message}`;
        }
    });

    // Devolver saldo
    document.getElementById('btnBuscarDevolver').addEventListener('click', buscarCartaoDevolver);
    document.getElementById('formDevolver').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!cartaoAtual) {
            alert('Busque o cartão primeiro');
            return;
        }

        const valorInput = document.getElementById('devolverValor').value;
        const valor = valorInput ? parseFloat(valorInput) : null;
        const cancelarCartao = document.getElementById('devolverCancelarCartao').checked;
        const resultado = document.getElementById('resultadoDevolver');

        try {
            const response = await fetch(`${API_URL}/api/bilheteria/cartoes/${cartaoAtual.id}/devolver`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ valor, cancelar_cartao: cancelarCartao })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao devolver saldo');
            }

            resultado.className = 'resultado sucesso';
            let mensagem = `✅ Saldo devolvido com sucesso! Valor: R$ ${formatarPreco(data.transacao.valor)}`;
            if (data.transacao.cartao_cancelado) {
                mensagem += '\n⚠️ Cartão foi cancelado.';
            }
            resultado.textContent = mensagem;
            cartaoAtual = data.cartao;
            atualizarDadosCartaoDevolver();

        } catch (error) {
            resultado.className = 'resultado erro';
            resultado.textContent = `❌ ${error.message}`;
        }
    });

    // Consultar cartão
    document.getElementById('formConsultar').addEventListener('submit', async (e) => {
        e.preventDefault();
        const cartaoId = document.getElementById('consultarCartaoId').value.trim().toUpperCase();
        const resultado = document.getElementById('resultadoConsultar');
        const historico = document.getElementById('historicoTransacoes');

        try {
            // Buscar cartão
            const response = await fetch(`${API_URL}/api/cartoes/${cartaoId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const cartao = await response.json();

            if (!response.ok) {
                throw new Error(cartao.error || 'Cartão não encontrado');
            }

            // Exibir dados do cartão
            resultado.className = 'resultado sucesso';
            resultado.innerHTML = `
                <h3>Dados do Cartão</h3>
                <p><strong>ID:</strong> ${cartao.id}</p>
                <p><strong>Cliente:</strong> ${cartao.nome_cliente}</p>
                <p><strong>Saldo:</strong> <span class="saldo">R$ ${formatarPreco(cartao.saldo)}</span></p>
                <p><strong>Status:</strong> ${cartao.status}</p>
                <p><strong>Ativado em:</strong> ${new Date(cartao.data_ativacao).toLocaleString('pt-BR')}</p>
                ${cartao.data_expiracao ? `<p><strong>Expira em:</strong> ${new Date(cartao.data_expiracao).toLocaleString('pt-BR')}</p>` : ''}
            `;

            // Buscar histórico
            const histResponse = await fetch(`${API_URL}/api/bilheteria/cartoes/${cartaoId}/transacoes`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const transacoes = await histResponse.json();
            exibirHistorico(transacoes);
            historico.style.display = 'block';

        } catch (error) {
            resultado.className = 'resultado erro';
            resultado.textContent = `❌ ${error.message}`;
            historico.style.display = 'none';
        }
    });
}

// Buscar cartão para recarga
async function buscarCartaoRecarregar() {
    const cartaoId = document.getElementById('recarregarCartaoId').value.trim().toUpperCase();
    if (!cartaoId) {
        alert('Digite o ID do cartão');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/cartoes/${cartaoId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Cartão não encontrado');
        }

        cartaoAtual = data;
        atualizarDadosCartaoRecarregar();
        document.getElementById('dadosCartaoRecarregar').style.display = 'block';

    } catch (error) {
        alert(error.message);
    }
}

// Buscar cartão para devolução
async function buscarCartaoDevolver() {
    const cartaoId = document.getElementById('devolverCartaoId').value.trim().toUpperCase();
    if (!cartaoId) {
        alert('Digite o ID do cartão');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/cartoes/${cartaoId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Cartão não encontrado');
        }

        cartaoAtual = data;
        atualizarDadosCartaoDevolver();
        document.getElementById('dadosCartaoDevolver').style.display = 'block';

    } catch (error) {
        alert(error.message);
    }
}

// Atualizar dados do cartão (recarga)
function atualizarDadosCartaoRecarregar() {
    if (!cartaoAtual) return;
    document.getElementById('recarregarNomeCliente').textContent = cartaoAtual.nome_cliente;
    document.getElementById('recarregarSaldoAtual').textContent = `R$ ${formatarPreco(cartaoAtual.saldo)}`;
}

// Atualizar dados do cartão (devolução)
function atualizarDadosCartaoDevolver() {
    if (!cartaoAtual) return;
    document.getElementById('devolverNomeCliente').textContent = cartaoAtual.nome_cliente;
    document.getElementById('devolverSaldoAtual').textContent = `R$ ${formatarPreco(cartaoAtual.saldo)}`;
}

// Exibir histórico
function exibirHistorico(transacoes) {
    const lista = document.getElementById('listaTransacoes');
    
    if (transacoes.length === 0) {
        lista.innerHTML = '<p>Nenhuma transação encontrada.</p>';
        return;
    }

    lista.innerHTML = '';
    transacoes.forEach(trans => {
        const div = document.createElement('div');
        div.className = 'transacao-item';
        
        const tipo = trans.tipo.charAt(0).toUpperCase() + trans.tipo.slice(1);
        const valor = parseFloat(trans.valor || 0);
        const data = new Date(trans.criado_em).toLocaleString('pt-BR');
        
        div.innerHTML = `
            <div class="transacao-tipo">${tipo}</div>
            <div class="transacao-detalhes">
                <p>Valor: R$ ${formatarPreco(valor)}</p>
                <p>Data: ${data}</p>
                ${trans.descricao ? `<p>${trans.descricao}</p>` : ''}
            </div>
        `;
        lista.appendChild(div);
    });
}

// Configurar relatórios
function configurarRelatorios() {
    document.querySelectorAll('.btn-relatorio').forEach(btn => {
        btn.addEventListener('click', async () => {
            const tipo = btn.dataset.relatorio;
            await carregarRelatorio(tipo);
        });
    });
}

async function carregarRelatorio(tipo) {
    const resultado = document.getElementById('resultadoRelatorios');
    resultado.className = 'resultado';
    resultado.innerHTML = '<p>Carregando...</p>';

    try {
        let response;
        if (tipo === 'recargas') {
            response = await fetch(`${API_URL}/api/bilheteria/relatorios/recargas`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } else if (tipo === 'devolucoes') {
            response = await fetch(`${API_URL}/api/bilheteria/relatorios/devolucoes`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } else if (tipo === 'cartoes-ativos') {
            response = await fetch(`${API_URL}/api/bilheteria/relatorios/cartoes-ativos`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao carregar relatório');
        }

        resultado.className = 'resultado sucesso';
        resultado.innerHTML = formatarRelatorio(tipo, data);

    } catch (error) {
        resultado.className = 'resultado erro';
        resultado.textContent = `❌ ${error.message}`;
    }
}

function formatarRelatorio(tipo, data) {
    if (tipo === 'recargas') {
        return `
            <div class="relatorio-conteudo">
                <div class="relatorio-resumo">
                    <div class="resumo-item">
                        <div class="resumo-label">Total de Recargas</div>
                        <div class="resumo-valor">${data.total_recargas}</div>
                    </div>
                    <div class="resumo-item">
                        <div class="resumo-label">Valor Total</div>
                        <div class="resumo-valor">R$ ${formatarPreco(data.valor_total)}</div>
                    </div>
                </div>
                <table class="tabela-relatorio">
                    <thead>
                        <tr>
                            <th>Data/Hora</th>
                            <th>Cliente</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.recargas.map(r => `
                            <tr>
                                <td>${new Date(r.criado_em).toLocaleString('pt-BR')}</td>
                                <td>${r.nome_cliente}</td>
                                <td>R$ ${formatarPreco(r.valor)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (tipo === 'devolucoes') {
        return `
            <div class="relatorio-conteudo">
                <div class="relatorio-resumo">
                    <div class="resumo-item">
                        <div class="resumo-label">Total de Devoluções</div>
                        <div class="resumo-valor">${data.total_devolucoes}</div>
                    </div>
                    <div class="resumo-item">
                        <div class="resumo-label">Valor Total</div>
                        <div class="resumo-valor">R$ ${formatarPreco(data.valor_total)}</div>
                    </div>
                </div>
                <table class="tabela-relatorio">
                    <thead>
                        <tr>
                            <th>Data/Hora</th>
                            <th>Cliente</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.devolucoes.map(d => `
                            <tr>
                                <td>${new Date(d.criado_em).toLocaleString('pt-BR')}</td>
                                <td>${d.nome_cliente}</td>
                                <td>R$ ${formatarPreco(d.valor)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (tipo === 'cartoes-ativos') {
        return `
            <div class="relatorio-conteudo">
                <div class="relatorio-resumo">
                    <div class="resumo-item">
                        <div class="resumo-label">Total de Cartões</div>
                        <div class="resumo-valor">${data.total_cartoes}</div>
                    </div>
                    <div class="resumo-item">
                        <div class="resumo-label">Saldo Total</div>
                        <div class="resumo-valor">R$ ${formatarPreco(data.saldo_total)}</div>
                    </div>
                </div>
                <table class="tabela-relatorio">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Saldo</th>
                            <th>Ativado em</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.cartoes.map(c => `
                            <tr>
                                <td>${c.id}</td>
                                <td>${c.nome_cliente}</td>
                                <td>R$ ${formatarPreco(c.saldo)}</td>
                                <td>${new Date(c.data_ativacao).toLocaleDateString('pt-BR')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

// Formatar preço
function formatarPreco(valor) {
    return parseFloat(valor).toFixed(2).replace('.', ',');
}

// Logout
btnLogout.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/index.html';
});

