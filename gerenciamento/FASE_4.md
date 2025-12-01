# FASE 4 - Sistema de Pagamento e Cartões

## 🎯 Objetivo da Fase

Implementar o sistema de pagamento via cartão recarregável, leitura de cartão e processamento de transações.

## 📋 Tarefas

### 4.1 Tela de Pagamento
- [ ] Exibir dados do pedido (valor total)
- [ ] Campos: nome, saldo do cartão, valor do pedido, horário
- [ ] Interface para leitura do cartão
- [ ] Validação de saldo suficiente
- [ ] Botão de pagamento
- [ ] Feedback visual do processo

### 4.2 Sistema de Leitura de Cartão
- [ ] Integração com leitor de cartão
- [ ] Leitura do ID do cartão
- [ ] Buscar dados do cartão no banco
- [ ] Preencher campos automaticamente (nome, saldo)
- [ ] Tratamento de cartão inválido
- [ ] Tratamento de cartão não encontrado

### 4.3 Gestão de Cartões no Banco
- [ ] Tabela de cartões com ID único
- [ ] Campos: ID, nome do cliente, saldo, status (ativo/inativo)
- [ ] API para buscar cartão por ID
- [ ] API para atualizar saldo
- [ ] Validação de cartão ativo
- [ ] Histórico de transações

### 4.4 Processamento de Pagamento
- [ ] Validar saldo suficiente
- [ ] Descontar valor do saldo do cartão
- [ ] Criar registro de transação
- [ ] Atualizar status do pedido (pago)
- [ ] Retornar confirmação de pagamento
- [ ] Tratamento de erros (saldo insuficiente, etc.)

### 4.5 Regras de Negócio
- [ ] Validação de saldo mínimo
- [ ] Validação de cartão ativo
- [ ] Validação de validade do saldo (12 meses)
- [ ] Registro de horário da transação
- [ ] Log de todas as transações

### 4.6 Integração com Impressão
- [ ] Verificar se pedido contém comida
- [ ] Preparar dados da comanda
- [ ] Chamar sistema de impressão (FASE 5)

## 🔧 Funcionalidades

### Tela de Pagamento
- **Campos Exibidos**:
  - Nome do cliente (preenchido automaticamente)
  - Saldo do cartão (preenchido automaticamente)
  - Valor do pedido
  - Horário atual
- **Ações**:
  - Passar cartão → Preencher dados
  - Conferir informações
  - Clicar em "Pagar"
  - Processar pagamento

### Fluxo de Pagamento
1. Tela de pagamento → Exibir valor do pedido
2. Cliente entrega cartão → Passar na máquina
3. Sistema lê cartão → Busca dados no banco
4. Preenche campos → Nome e saldo
5. Vendedor confere → Clica em "Pagar"
6. Sistema valida → Desconta saldo
7. Confirma pagamento → Próxima ação (impressão se comida)

## 📝 Entregáveis

- Tela de pagamento completa
- Sistema de leitura de cartão funcional
- Processamento de pagamento implementado
- APIs de cartões e transações
- Validações e regras de negócio

## ⏱️ Estimativa

- **Tempo**: 2-3 semanas
- **Prioridade**: Crítica

## 🔗 Dependências

- FASE 3 (Finalização de Pedido)
- FASE 1 (Estrutura Base - para banco de dados)

## 📌 Notas

- **Desafio Principal**: Integração com leitor de cartão físico
- Testar diferentes tipos de leitores
- Implementar fallback manual (digitação do ID) se necessário
- Garantir segurança nas transações
- Considerar transações offline com sincronização

---

**Status**: ⏳ Pendente

