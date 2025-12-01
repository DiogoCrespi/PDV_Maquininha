# Checklist de Desenvolvimento

Este arquivo acompanha o progresso do desenvolvimento do projeto. Marque as tarefas conforme forem sendo concluídas.

## 📊 Status Geral

- **Fase Atual**: FASE 1 - Em Desenvolvimento
- **Última Atualização**: 01/12/2025
- **Progresso Geral**: 15%

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

**Status**: ⏳ Pendente (0%)

### Gestão de Categorias
- [ ] API para listar categorias
- [ ] API para criar/editar/excluir categorias (admin)
- [ ] Tela de categorias no aplicativo
- [ ] Navegação entre categorias
- [ ] Interface visual das categorias

### Gestão de Produtos
- [ ] API para listar produtos por categoria
- [ ] API para criar/editar/excluir produtos (admin)
- [ ] Campos: nome, descrição, preço, categoria, imagem
- [ ] Tela de produtos por categoria
- [ ] Visualização de detalhes do produto

### Sistema de Carrinho
- [ ] Estado do carrinho (local ou servidor)
- [ ] Adicionar produto ao carrinho
- [ ] Remover produto do carrinho
- [ ] Alterar quantidade de itens
- [ ] Calcular total do carrinho
- [ ] Tela de carrinho
- [ ] Indicador de itens no carrinho

### Interface de Navegação
- [ ] Tela inicial com categorias
- [ ] Tela de produtos da categoria
- [ ] Modal/popup para seleção de quantidade
- [ ] Botão de adicionar ao carrinho
- [ ] Botão de finalizar compra
- [ ] Navegação entre telas

---

## ✅ FASE 3 - Finalização de Pedido e Gestão de Mesas

**Status**: ⏳ Pendente (0%)

### Tela de Revisão do Pedido
- [ ] Exibir todos os itens do carrinho
- [ ] Mostrar quantidade de cada item
- [ ] Exibir valor unitário de cada produto
- [ ] Calcular e exibir valor total
- [ ] Layout responsivo e claro

### Sistema de Observações
- [ ] Campo de observação por produto
- [ ] Salvar observações junto com o item
- [ ] Exibir observações na tela de revisão
- [ ] Editar observações antes de finalizar
- [ ] Limitar tamanho das observações

### Gestão de Mesas
- [ ] Campo para número da mesa
- [ ] Validação de número de mesa
- [ ] Salvar número da mesa no pedido
- [ ] Opção de pedido sem mesa (balcão/viagem)
- [ ] Interface para inserir número da mesa

### Finalização do Pedido
- [ ] Botão "Avançar" na tela de revisão
- [ ] Validação antes de avançar (mesa, itens)
- [ ] Criar registro de pedido no banco
- [ ] Salvar itens do pedido
- [ ] Transição para tela de pagamento
- [ ] Manter dados do pedido em sessão

### API de Pedidos
- [ ] Endpoint para criar pedido
- [ ] Endpoint para listar pedidos
- [ ] Endpoint para atualizar pedido
- [ ] Endpoint para cancelar pedido
- [ ] Validações de negócio

---

## ✅ FASE 4 - Sistema de Pagamento e Cartões

**Status**: ⏳ Pendente (0%)

### Tela de Pagamento
- [ ] Exibir dados do pedido (valor total)
- [ ] Campos: nome, saldo do cartão, valor do pedido, horário
- [ ] Interface para leitura do cartão
- [ ] Validação de saldo suficiente
- [ ] Botão de pagamento
- [ ] Feedback visual do processo

### Sistema de Leitura de Cartão
- [ ] Integração com leitor de cartão
- [ ] Leitura do ID do cartão
- [ ] Buscar dados do cartão no banco
- [ ] Preencher campos automaticamente (nome, saldo)
- [ ] Tratamento de cartão inválido
- [ ] Tratamento de cartão não encontrado

### Gestão de Cartões no Banco
- [ ] Tabela de cartões com ID único
- [ ] Campos: ID, nome do cliente, saldo, status (ativo/inativo)
- [ ] API para buscar cartão por ID
- [ ] API para atualizar saldo
- [ ] Validação de cartão ativo
- [ ] Histórico de transações

### Processamento de Pagamento
- [ ] Validar saldo suficiente
- [ ] Descontar valor do saldo do cartão
- [ ] Criar registro de transação
- [ ] Atualizar status do pedido (pago)
- [ ] Retornar confirmação de pagamento
- [ ] Tratamento de erros (saldo insuficiente, etc.)

### Regras de Negócio
- [ ] Validação de saldo mínimo
- [ ] Validação de cartão ativo
- [ ] Validação de validade do saldo (12 meses)
- [ ] Registro de horário da transação
- [ ] Log de todas as transações

### Integração com Impressão
- [ ] Verificar se pedido contém comida
- [ ] Preparar dados da comanda
- [ ] Chamar sistema de impressão (FASE 5)

---

## ✅ FASE 5 - Impressão de Comandas

**Status**: ⏳ Pendente (0%)

### Identificação de Produtos de Comida
- [ ] Marcar categorias/produtos que são comida
- [ ] Campo "requer_comanda" na tabela de produtos/categorias
- [ ] Lógica para verificar se pedido tem comida
- [ ] Lista de categorias que geram comanda: Porções, Lanches

### Preparação de Dados da Comanda
- [ ] Estruturar dados para impressão
- [ ] Incluir: itens do pedido, quantidade, observações
- [ ] Incluir: número da mesa
- [ ] Incluir: nome do cliente
- [ ] Incluir: horário do pedido
- [ ] Formatar dados para impressora

### Integração com Impressora
- [ ] Pesquisar modelo de impressora de notas
- [ ] Escolher biblioteca de impressão
- [ ] Configurar conexão com impressora
- [ ] Testar comunicação
- [ ] Implementar driver de impressão

### Template de Comanda
- [ ] Criar layout da comanda
- [ ] Cabeçalho (nome do estabelecimento, data/hora)
- [ ] Informações do pedido (mesa, cliente)
- [ ] Lista de itens com observações
- [ ] Rodapé (instruções, etc.)
- [ ] Formatação adequada para impressora térmica

### Fluxo de Impressão
- [ ] Após pagamento bem-sucedido
- [ ] Verificar se pedido tem comida
- [ ] Se sim, enviar para impressão
- [ ] Aguardar confirmação de impressão
- [ ] Tratamento de erros (impressora offline, etc.)
- [ ] Log de impressões

### Configurações
- [ ] Configuração de IP/porta da impressora
- [ ] Configuração de modelo de impressora
- [ ] Testes de impressão
- [ ] Opção de reimprimir comanda

---

## ✅ FASE 6 - Sistema PDV Desktop (Bilheteria)

**Status**: ⏳ Pendente (0%)

### Estrutura do Sistema Desktop
- [ ] Escolher tecnologia (Electron, Tauri, ou aplicação web)
- [ ] Configurar projeto desktop
- [ ] Interface de login (operador)
- [ ] Dashboard principal
- [ ] Navegação entre módulos

### Gestão de Cartões
- [ ] Tela de cadastro de cartões
- [ ] Inserir ID do cartão manualmente
- [ ] Ativar cartão
- [ ] Desativar/cancelar cartão
- [ ] Buscar cartão por ID
- [ ] Listar todos os cartões
- [ ] Status do cartão (ativo, inativo, cancelado)

### Ativação de Cartões
- [ ] Tela de ativação
- [ ] Inserir ID do cartão
- [ ] Inserir nome do cliente
- [ ] Ativar cartão no sistema
- [ ] Saldo inicial (geralmente R$ 0,00)
- [ ] Confirmação de ativação
- [ ] Impressão de comprovante (opcional)

### Recarga de Saldo
- [ ] Tela de recarga
- [ ] Buscar cartão por ID
- [ ] Exibir dados do cartão (nome, saldo atual)
- [ ] Campo para valor da recarga
- [ ] Processar recarga
- [ ] Atualizar saldo no banco
- [ ] Registrar transação de recarga
- [ ] Comprovante de recarga
- [ ] Histórico de recargas

### Devolução de Saldo
- [ ] Tela de devolução
- [ ] Buscar cartão por ID
- [ ] Exibir saldo disponível
- [ ] Validar horário (após 17h)
- [ ] Campo para valor a devolver (ou devolver tudo)
- [ ] Processar devolução
- [ ] Atualizar saldo do cartão
- [ ] Registrar transação de devolução
- [ ] Comprovante de devolução
- [ ] Opção de cancelar cartão após devolução

### Consultas e Relatórios
- [ ] Consultar saldo de cartão
- [ ] Histórico de transações do cartão
- [ ] Relatório de recargas do dia
- [ ] Relatório de devoluções do dia
- [ ] Relatório de cartões ativos
- [ ] Exportar relatórios

### APIs Necessárias
- [ ] Endpoint para ativar cartão
- [ ] Endpoint para recarregar saldo
- [ ] Endpoint para devolver saldo
- [ ] Endpoint para buscar cartão
- [ ] Endpoint para listar cartões
- [ ] Endpoint para cancelar cartão
- [ ] Endpoint para histórico de transações

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

