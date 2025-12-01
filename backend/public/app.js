// Configuração da API
const API_URL = window.location.origin;

// Verificar se já está logado
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        verificarToken(token);
    }
});

// Formulário de login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    const pos_id = document.getElementById('pos_id').value || null;
    
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
    
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario, senha, pos_id: pos_id ? parseInt(pos_id) : null })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao fazer login');
        }
        
        // Salvar token
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        
        // Verificar tipo de usuário e redirecionar
        if (data.usuario.tipo === 'admin') {
            // Admin pode escolher entre vendas e bilheteria
            // Por padrão vai para vendas, mas pode acessar /bilheteria.html
            window.location.href = '/vendas.html';
        } else {
            window.location.href = '/vendas.html';
        }
        
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
    }
});

// Verificar token
async function verificarToken(token) {
    try {
        const response = await fetch(`${API_URL}/api/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            // Token válido, redirecionar
            window.location.href = '/vendas.html';
        } else {
            // Token inválido, remover
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
        }
    } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
    }
}

