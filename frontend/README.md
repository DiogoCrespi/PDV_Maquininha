# Frontend - PDV Máquina de Vendas

Frontend desenvolvido com Next.js 16, TypeScript e Tailwind CSS.

## 🚀 Configuração

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e configure a URL do backend:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

O aplicativo estará disponível em [http://localhost:3001](http://localhost:3001)

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/              # Rotas e páginas (App Router)
│   ├── components/        # Componentes reutilizáveis
│   ├── context/          # Contextos React (Auth, Cart)
│   ├── lib/              # Utilitários e API client
│   │   └── api/          # Serviços de API
│   └── types/            # Tipos TypeScript
├── public/               # Arquivos estáticos
└── .env.local            # Variáveis de ambiente
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa o linter

## 📋 Status do Desenvolvimento

Consulte o arquivo `gerenciamento/CHECKLIST_FRONTEND.md` para acompanhar o progresso.

## 🔗 Integração com Backend

O frontend se comunica com o backend através de APIs REST. O cliente HTTP (axios) está configurado em `src/lib/api.ts` e inclui:

- Interceptor para adicionar token de autenticação
- Tratamento global de erros
- Redirecionamento automático em caso de token expirado

## 🎨 Tecnologias

- **Next.js 16** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Axios** - Cliente HTTP
- **React Context** - Gerenciamento de estado

## 📝 Notas

- O frontend trabalha em paralelo com o backend
- Respeite as APIs disponíveis no backend
- Mantenha o checklist atualizado conforme o desenvolvimento avança
