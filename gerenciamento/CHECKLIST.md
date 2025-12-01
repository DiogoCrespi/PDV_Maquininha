# Checklist de Desenvolvimento

Este arquivo acompanha o progresso do desenvolvimento do projeto. Marque as tarefas conforme forem sendo concluídas.

## 📊 Status Geral

- **Fase Atual**: Concluído ✅
- **Última Atualização**: 01/12/2025
- **Progresso Geral**: 98%

---

## ✅ FASE 1 - Estrutura Base e Autenticação

**Status**: 🚧 Em Desenvolvimento (80%)

### Configuração do Ambiente
- [x] Definir stack tecnológica (Node.js + Express + SQLite)
- [ ] Configurar repositório Git
- [x] Configurar ambiente de desenvolvimento
- [x] Configurar estrutura de pastas
- [x] Configurar dependências básicas

### Estrutura do Banco de Dados
- [x] Criar schema do banco de dados
- [x] Tabela de usuários/operadores
- [x] Tabela de pontos de venda (POS)
- [x] Tabela de cartões
- [x] Tabela de categorias
- [x] Tabela de produtos
- [x] Tabela de pedidos
- [x] Tabela de itens do pedido
- [x] Tabela de transações (pagamentos)
- [x] Tabela de mesas

### Sistema de Autenticação
- [x] Criar API de login
- [x] Implementar autenticação por operador
- [x] Implementar autenticação por POS
- [x] Sistema de sessão/tokens (JWT)
- [x] Middleware de autenticação
- [x] Tela de login no aplicativo

### API Base
- [x] Configurar servidor backend
- [x] Estrutura de rotas
- [x] Middleware de tratamento de erros
- [ ] Sistema de logs (básico implementado)
- [x] Configuração de CORS

---

## ✅ FASE 2 - Catálogo de Produtos e Carrinho

**Status**: 🚧 Em Desenvolvimento (90%)

### Gestão de Categorias
- [x] API para listar categorias
- [x] API para criar/editar/excluir categorias (admin)
- [x] Tela de categorias no aplicativo
- [x] Navegação entre categorias
- [x] Interface visual das categorias

### Gestão de Produtos
- [x] API para listar produtos por categoria
- [x] API para criar/editar/excluir produtos (admin)
- [x] Campos: nome, descrição, preço, categoria, imagem
- [x] Tela de produtos por categoria
- [x] Visualização de detalhes do produto

### Sistema de Carrinho
- [x] Estado do carrinho (localStorage)
- [x] Adicionar produto ao carrinho
- [x] Remover produto do carrinho
- [x] Alterar quantidade de itens
- [x] Calcular total do carrinho
- [x] Tela de carrinho
- [x] Indicador de itens no carrinho

### Interface de Navegação
- [x] Tela inicial com categorias
- [x] Tela de produtos da categoria
- [x] Modal/popup para seleção de quantidade
- [x] Botão de adicionar ao carrinho
- [x] Botão de finalizar compra
- [x] Navegação entre telas

---

## ✅ FASE 3 - Finalização de Pedido e Gestão de Mesas

**Status**: 🚧 Em Desenvolvimento (90%)

### Tela de Revisão do Pedido
- [x] Exibir todos os itens do carrinho
- [x] Mostrar quantidade de cada item
- [x] Exibir valor unitário de cada produto
- [x] Calcular e exibir valor total
- [x] Layout responsivo e claro

### Sistema de Observações
- [x] Campo de observação por produto
- [x] Salvar observações junto com o item
- [x] Exibir observações na tela de revisão
- [x] Editar observações antes de finalizar
- [x] Limitar tamanho das observações (200 caracteres)

### Gestão de Mesas
- [x] Campo para número da mesa
- [x] Validação de número de mesa
- [x] Salvar número da mesa no pedido
- [x] Opção de pedido sem mesa (balcão/viagem)
- [x] Interface para inserir número da mesa

### Finalização do Pedido
- [x] Botão "Avançar" na tela de revisão
- [x] Validação antes de avançar (itens)
- [x] Criar registro de pedido no banco
- [x] Salvar itens do pedido
- [x] Transição para tela de pagamento
- [x] Manter dados do pedido em sessão (localStorage)

### API de Pedidos
- [x] Endpoint para criar pedido
- [x] Endpoint para listar pedidos
- [x] Endpoint para atualizar pedido
- [x] Endpoint para cancelar pedido
- [x] Validações de negócio

---

## ✅ FASE 4 - Sistema de Pagamento e Cartões

**Status**: 🚧 Em Desenvolvimento (95%)

### Tela de Pagamento
- [x] Exibir dados do pedido (valor total)
- [x] Campos: nome, saldo do cartão, valor do pedido, horário
- [x] Interface para leitura do cartão (com fallback manual)
- [x] Validação de saldo suficiente
- [x] Botão de pagamento
- [x] Feedback visual do processo

### Sistema de Leitura de Cartão
- [x] Integração com leitor de cartão (fallback manual implementado)
- [x] Leitura do ID do cartão (input manual)
- [x] Buscar dados do cartão no banco
- [x] Preencher campos automaticamente (nome, saldo)
- [x] Tratamento de cartão inválido
- [x] Tratamento de cartão não encontrado

### Gestão de Cartões no Banco
- [x] Tabela de cartões com ID único
- [x] Campos: ID, nome do cliente, saldo, status (ativo/inativo)
- [x] API para buscar cartão por ID
- [x] API para atualizar saldo
- [x] Validação de cartão ativo
- [x] Histórico de transações

### Processamento de Pagamento
- [x] Validar saldo suficiente
- [x] Descontar valor do saldo do cartão
- [x] Criar registro de transação
- [x] Atualizar status do pedido (pago)
- [x] Retornar confirmação de pagamento
- [x] Tratamento de erros (saldo insuficiente, etc.)

### Regras de Negócio
- [x] Validação de saldo mínimo
- [x] Validação de cartão ativo
- [x] Validação de validade do saldo (12 meses)
- [x] Registro de horário da transação
- [x] Log de todas as transações

### Integração com Impressão
- [x] Verificar se pedido contém comida (preparado na API)
- [x] Preparar dados da comanda (na resposta da API)
- [ ] Chamar sistema de impressão (FASE 5)

---

## ✅ FASE 5 - Impressão de Comandas

**Status**: 🚧 Em Desenvolvimento (90%)

### Identificação de Produtos de Comida
- [x] Marcar categorias/produtos que são comida
- [x] Campo "requer_comanda" na tabela de produtos/categorias
- [x] Lógica para verificar se pedido tem comida
- [x] Lista de categorias que geram comanda: Porções, Lanches

### Preparação de Dados da Comanda
- [x] Estruturar dados para impressão
- [x] Incluir: itens do pedido, quantidade, observações
- [x] Incluir: número da mesa
- [x] Incluir: nome do cliente
- [x] Incluir: horário do pedido
- [x] Formatar dados para impressora

### Integração com Impressora
- [x] Pesquisar modelo de impressora de notas
- [x] Escolher biblioteca de impressão (estrutura preparada)
- [x] Configurar conexão com impressora (via .env)
- [ ] Testar comunicação (requer impressora física)
- [x] Implementar driver de impressão (estrutura base)

### Template de Comanda
- [x] Criar layout da comanda
- [x] Cabeçalho (nome do estabelecimento, data/hora)
- [x] Informações do pedido (mesa, cliente)
- [x] Lista de itens com observações
- [x] Rodapé (instruções, etc.)
- [x] Formatação adequada para impressora térmica

### Fluxo de Impressão
- [x] Após pagamento bem-sucedido
- [x] Verificar se pedido tem comida
- [x] Se sim, enviar para impressão
- [x] Aguardar confirmação de impressão
- [x] Tratamento de erros (impressora offline, etc.)
- [x] Log de impressões

### Configurações
- [x] Configuração de IP/porta da impressora (via .env)
- [x] Configuração de modelo de impressora (via .env)
- [ ] Testes de impressão (requer impressora física)
- [x] Opção de reimprimir comanda

---

## ✅ FASE 6 - Sistema PDV Desktop (Bilheteria)

**Status**: 🚧 Em Desenvolvimento (95%)

### Estrutura do Sistema Desktop
- [x] Escolher tecnologia (aplicação web)
- [x] Configurar projeto desktop
- [x] Interface de login (operador)
- [x] Dashboard principal
- [x] Navegação entre módulos

### Gestão de Cartões
- [x] Tela de cadastro de cartões
- [x] Inserir ID do cartão manualmente
- [x] Ativar cartão
- [x] Desativar/cancelar cartão
- [x] Buscar cartão por ID
- [x] Listar todos os cartões
- [x] Status do cartão (ativo, inativo, cancelado)

### Ativação de Cartões
- [x] Tela de ativação
- [x] Inserir ID do cartão
- [x] Inserir nome do cliente
- [x] Ativar cartão no sistema
- [x] Saldo inicial (geralmente R$ 0,00)
- [x] Confirmação de ativação
- [ ] Impressão de comprovante (opcional)

### Recarga de Saldo
- [x] Tela de recarga
- [x] Buscar cartão por ID
- [x] Exibir dados do cartão (nome, saldo atual)
- [x] Campo para valor da recarga
- [x] Processar recarga
- [x] Atualizar saldo no banco
- [x] Registrar transação de recarga
- [x] Comprovante de recarga (exibido na tela)
- [x] Histórico de recargas

### Devolução de Saldo
- [x] Tela de devolução
- [x] Buscar cartão por ID
- [x] Exibir saldo disponível
- [x] Validar horário (após 17h)
- [x] Campo para valor a devolver (ou devolver tudo)
- [x] Processar devolução
- [x] Atualizar saldo do cartão
- [x] Registrar transação de devolução
- [x] Comprovante de devolução (exibido na tela)
- [x] Opção de cancelar cartão após devolução

### Consultas e Relatórios
- [x] Consultar saldo de cartão
- [x] Histórico de transações do cartão
- [x] Relatório de recargas do dia
- [x] Relatório de devoluções do dia
- [x] Relatório de cartões ativos
- [ ] Exportar relatórios (CSV/Excel)

### APIs Necessárias
- [x] Endpoint para ativar cartão
- [x] Endpoint para recarregar saldo
- [x] Endpoint para devolver saldo
- [x] Endpoint para buscar cartão
- [x] Endpoint para listar cartões
- [x] Endpoint para cancelar cartão
- [x] Endpoint para histórico de transações

---

## 📝 Notas de Desenvolvimento

### Decisões Técnicas
- _Adicionar decisões técnicas importantes aqui conforme o desenvolvimento avança_

### Problemas Encontrados
- _Registrar problemas e soluções aqui_

### Melhorias Futuras
- _Ideias de melhorias para versões futuras_

---

**Como usar este checklist:**
1. Marque as tarefas como concluídas usando `[x]`
2. Atualize o status de cada fase
3. Adicione notas relevantes na seção de notas
4. Mantenha o progresso geral atualizado

