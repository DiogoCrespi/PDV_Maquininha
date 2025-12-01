# 🔗 Comunicação Backend ↔ Frontend

## 📋 Configuração Atual

### Backend (Porta 3000)
- **URL**: `http://localhost:3000`
- **API Base**: `http://localhost:3000/api`
- **Arquivos estáticos**: `backend/public/` (HTML/CSS/JS puro)

### Frontend Next.js (Porta 3001)
- **URL**: `http://localhost:3001`
- **API Base**: `http://localhost:3000/api` (configurado via `NEXT_PUBLIC_API_URL`)

## ✅ Verificação de Comunicação

### 1. CORS Configurado
O backend está configurado para aceitar requisições de:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`

### 2. Configuração do Frontend
- **Arquivo**: `frontend/src/lib/api.ts`
- **Base URL**: `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'`
- **Interceptors**: Configurados para adicionar token JWT automaticamente

### 3. APIs Implementadas no Frontend

✅ **Autenticação**
- `authApi.login()` → `POST /api/auth/login`
- `authApi.verify()` → `GET /api/auth/verify`

✅ **Categorias**
- `categoriasApi.listar()` → `GET /api/categorias`
- `categoriasApi.buscarPorId()` → `GET /api/categorias/:id`

✅ **Produtos**
- `produtosApi.listar()` → `GET /api/produtos`
- `produtosApi.listarPorCategoria()` → `GET /api/produtos/categoria/:id`
- `produtosApi.buscarPorId()` → `GET /api/produtos/:id`

✅ **Pedidos**
- `pedidosApi.criar()` → `POST /api/pedidos`
- `pedidosApi.buscarPorId()` → `GET /api/pedidos/:id`
- `pedidosApi.listar()` → `GET /api/pedidos`

✅ **Pagamentos**
- `pagamentosApi.processar()` → `POST /api/pagamentos/processar`

✅ **Cartões**
- `cartoesApi.buscarPorId()` → `GET /api/cartoes/:id`

✅ **Comandas**
- `comandasApi.reimprimir()` → `POST /api/comandas/:id/reimprimir`

✅ **Bilheteria** (NOVO)
- `bilheteriaApi.ativarCartao()` → `POST /api/bilheteria/cartoes/ativar`
- `bilheteriaApi.recarregarSaldo()` → `POST /api/bilheteria/cartoes/:id/recarregar`
- `bilheteriaApi.devolverSaldo()` → `POST /api/bilheteria/cartoes/:id/devolver`
- `bilheteriaApi.cancelarCartao()` → `POST /api/bilheteria/cartoes/:id/cancelar`
- `bilheteriaApi.listarCartoes()` → `GET /api/bilheteria/cartoes`
- `bilheteriaApi.historicoTransacoes()` → `GET /api/bilheteria/cartoes/:id/transacoes`
- `bilheteriaApi.relatorioRecargas()` → `GET /api/bilheteria/relatorios/recargas`
- `bilheteriaApi.relatorioDevolucoes()` → `GET /api/bilheteria/relatorios/devolucoes`
- `bilheteriaApi.relatorioCartoesAtivos()` → `GET /api/bilheteria/relatorios/cartoes-ativos`

## 🔧 Como Testar a Comunicação

### 1. Verificar se ambos estão rodando:
```bash
# Backend (porta 3000)
cd backend
npm start

# Frontend Next.js (porta 3001)
cd frontend
npm run dev
```

### 2. Testar no navegador:
- Backend HTML: `http://localhost:3000`
- Frontend Next.js: `http://localhost:3001`

### 3. Verificar no Console do Navegador:
- Abrir DevTools (F12)
- Aba Network
- Fazer uma requisição no frontend
- Verificar se a requisição vai para `http://localhost:3000/api/...`

## ⚠️ Possíveis Problemas

### CORS Error
Se aparecer erro de CORS:
- Verificar se o backend está rodando na porta 3000
- Verificar se o CORS está configurado corretamente no `backend/server.js`

### 401 Unauthorized
- Verificar se o token está sendo salvo no localStorage
- Verificar se o token está sendo enviado no header Authorization

### 404 Not Found
- Verificar se a rota existe no backend
- Verificar se a URL está correta (deve incluir `/api`)

## 📝 Variáveis de Ambiente

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Backend (.env)
```env
PORT=3000
JWT_SECRET=seu-secret-key
# ... outras configurações
```

## ✅ Status

- ✅ CORS configurado corretamente
- ✅ Frontend apontando para backend correto
- ✅ Todas as APIs implementadas
- ✅ Interceptors configurados
- ✅ Tratamento de erros implementado

**Comunicação entre backend e frontend está funcionando corretamente!** 🎉

