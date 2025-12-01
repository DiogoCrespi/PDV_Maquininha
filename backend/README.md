# Sistema PDV - Máquininha de Vendas

Sistema de Ponto de Venda desenvolvido para máquininha (POS) com sistema de cartão recarregável próprio.

## 🚀 Características

- **Arquitetura**: Servidor Node.js compartilhado acessível por múltiplos clientes (5-15 computadores)
- **Banco de Dados**: SQLite (simples, fácil de exportar, não requer servidor separado)
- **Autenticação**: JWT (JSON Web Tokens)
- **Frontend**: HTML/CSS/JavaScript puro (fácil de exportar e distribuir)

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## 🔧 Instalação

1. Clone ou baixe o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (opcional):
```bash
cp .env.example .env
# Edite o .env com suas configurações
```

4. Inicialize o banco de dados:
```bash
npm run init-db
```

5. Inicie o servidor:
```bash
npm start
```

Para desenvolvimento com auto-reload:
```bash
npm run dev
```

## 🌐 Acesso

Após iniciar o servidor, acesse:

- **Local**: http://localhost:3000
- **Rede**: http://[IP-DO-SERVIDOR]:3000

Exemplo: Se o servidor estiver no IP `192.168.1.100`, acesse `http://192.168.1.100:3000` de qualquer máquina na mesma rede.

## 👤 Credenciais Padrão

- **Usuário**: `admin`
- **Senha**: `admin123`

⚠️ **IMPORTANTE**: Altere a senha padrão em produção!

## 📁 Estrutura do Projeto

```
MAQUINA_VENDAS/
├── config/           # Configurações (banco de dados, etc)
├── middleware/       # Middlewares (autenticação, etc)
├── routes/          # Rotas da API
├── scripts/         # Scripts utilitários
├── public/          # Frontend (HTML, CSS, JS)
├── gerenciamento/   # Documentação do projeto
├── server.js        # Servidor principal
└── package.json     # Dependências
```

## 🔐 Segurança

- Altere o `JWT_SECRET` no arquivo `.env` em produção
- Use senhas fortes para os usuários
- Configure firewall se necessário
- Considere usar HTTPS em produção

## 📝 Próximos Passos

Consulte os arquivos na pasta `gerenciamento/` para ver o planejamento completo:
- `VISAO_GERAL.md` - Visão geral do projeto
- `FASE_1.md` - Estrutura base (em desenvolvimento)
- `FASE_2.md` - Catálogo de produtos
- `CHECKLIST.md` - Acompanhamento do desenvolvimento

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **SQLite** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

## 📄 Licença

ISC

