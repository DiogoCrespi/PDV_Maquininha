# FASE 3 - Finalização de Pedido e Gestão de Mesas

## 🎯 Objetivo da Fase

Implementar a tela de revisão do pedido, sistema de observações, gestão de mesas e preparação para pagamento.

## 📋 Tarefas

### 3.1 Tela de Revisão do Pedido
- [ ] Exibir todos os itens do carrinho
- [ ] Mostrar quantidade de cada item
- [ ] Exibir valor unitário de cada produto
- [ ] Calcular e exibir valor total
- [ ] Layout responsivo e claro

### 3.2 Sistema de Observações
- [ ] Campo de observação por produto
- [ ] Salvar observações junto com o item
- [ ] Exibir observações na tela de revisão
- [ ] Editar observações antes de finalizar
- [ ] Limitar tamanho das observações

### 3.3 Gestão de Mesas
- [ ] Campo para número da mesa
- [ ] Validação de número de mesa
- [ ] Salvar número da mesa no pedido
- [ ] Opção de pedido sem mesa (balcão/viagem)
- [ ] Interface para inserir número da mesa

### 3.4 Finalização do Pedido
- [ ] Botão "Avançar" na tela de revisão
- [ ] Validação antes de avançar (mesa, itens)
- [ ] Criar registro de pedido no banco
- [ ] Salvar itens do pedido
- [ ] Transição para tela de pagamento
- [ ] Manter dados do pedido em sessão

### 3.5 API de Pedidos
- [ ] Endpoint para criar pedido
- [ ] Endpoint para listar pedidos
- [ ] Endpoint para atualizar pedido
- [ ] Endpoint para cancelar pedido
- [ ] Validações de negócio

## 🔧 Funcionalidades

### Tela de Revisão
- Lista de produtos com:
  - Nome do produto
  - Quantidade
  - Valor unitário
  - Valor total do item
  - Campo de observação
- Total geral do pedido
- Campo para número da mesa
- Botão "Avançar"

### Fluxo
1. Carrinho → Finalizar compra
2. Tela de revisão → Conferir itens
3. Adicionar observações (opcional)
4. Inserir número da mesa
5. Clicar em "Avançar"
6. Ir para tela de pagamento

## 📝 Entregáveis

- Tela de revisão completa
- Sistema de observações funcional
- Gestão de mesas implementada
- API de pedidos criada
- Fluxo de finalização completo

## ⏱️ Estimativa

- **Tempo**: 1 semana
- **Prioridade**: Alta

## 🔗 Dependências

- FASE 2 (Catálogo de Produtos e Carrinho)

## 📌 Notas

- Interface deve ser clara para conferência rápida
- Validar todos os dados antes de avançar
- Considerar edição de pedido antes do pagamento

---

**Status**: ⏳ Pendente

