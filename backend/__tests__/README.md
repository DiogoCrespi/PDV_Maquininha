# 🧪 Testes E2E (End-to-End)

Este diretório contém testes E2E que testam o sistema completo, desde a criação de dados até o fluxo completo de vendas.

## 📋 Testes Disponíveis

### 1. `dados-completos.test.js`
Teste completo que cria:
- ✅ Usuário administrador
- ✅ Categoria de bebida
- ✅ Produtos (bebidas)
- ✅ Cartão e cliente
- ✅ Recarga de saldo
- ✅ Pedido
- ✅ Pagamento
- ✅ Histórico de transações

### 2. `fluxo-venda-completo.test.js`
Testa o fluxo completo de uma venda:
- ✅ Login de vendedor e admin
- ✅ Criação de categoria e produto
- ✅ Listagem de produtos
- ✅ Criação e ativação de cartão
- ✅ Recarga de saldo
- ✅ Criação de pedido
- ✅ Processamento de pagamento
- ✅ Verificação de pedido pago

### 3. `popular-banco.test.js`
Popular o banco com dados de teste:
- ✅ 10 categorias (Refrigerantes, Cervejas, Chopp, Águas, Sucos, Porções, Lanches, Pizzas, Picolés, Doces)
- ✅ 30+ produtos variados
- ✅ 5 cartões com clientes
- ✅ 3 usuários operadores
- ✅ Resumo final dos dados criados

## 🚀 Como Executar

### Instalar dependências
```bash
cd backend
npm install
```

### Executar todos os testes E2E
```bash
npm run test:e2e
```

### Executar um teste específico
```bash
npm test dados-completos
npm test fluxo-venda-completo
npm test popular-banco
```

### Executar com cobertura
```bash
npm run test:coverage
```

### Modo watch (desenvolvimento)
```bash
npm run test:watch
```

## 📊 O que os testes fazem

### Teste de Dados Completos
1. Cria usuário admin
2. Faz login
3. Cria categoria
4. Cria produtos
5. Cria cartão
6. Recarrega saldo
7. Cria pedido
8. Processa pagamento
9. Verifica histórico

### Teste de Fluxo Completo
1. Login vendedor e admin
2. Admin cria categoria e produto
3. Vendedor lista produtos
4. Admin cria e recarrega cartão
5. Vendedor cria pedido
6. Vendedor processa pagamento
7. Verifica que pedido foi pago

### Teste Popular Banco
1. Cria 10 categorias
2. Cria 30+ produtos variados
3. Cria 5 cartões com saldo
4. Cria 3 operadores
5. Gera resumo

## ⚠️ Importante

- Os testes usam o banco de dados real (database.sqlite)
- Os dados criados permanecem no banco após os testes
- Use `npm run init-db` para resetar o banco se necessário
- Os testes criam dados com IDs específicos para evitar conflitos

## 📝 Estrutura

```
__tests__/
  e2e/
    dados-completos.test.js      # Teste completo de criação de dados
    fluxo-venda-completo.test.js  # Teste do fluxo de venda
    popular-banco.test.js         # Popular banco com dados de teste
```

## 🎯 Objetivo

Estes testes servem para:
- ✅ Validar que todas as APIs estão funcionando
- ✅ Popular o banco com dados de teste
- ✅ Validar o fluxo completo de vendas
- ✅ Garantir que o sistema está funcionando end-to-end

