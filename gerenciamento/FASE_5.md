# FASE 5 - Impressão de Comandas

## 🎯 Objetivo da Fase

Implementar o sistema de impressão de comandas para a cozinha quando o pedido contiver comida.

## 📋 Tarefas

### 5.1 Identificação de Produtos de Comida
- [ ] Marcar categorias/produtos que são comida
- [ ] Campo "requer_comanda" na tabela de produtos/categorias
- [ ] Lógica para verificar se pedido tem comida
- [ ] Lista de categorias que geram comanda: Porções, Lanches

### 5.2 Preparação de Dados da Comanda
- [ ] Estruturar dados para impressão
- [ ] Incluir: itens do pedido, quantidade, observações
- [ ] Incluir: número da mesa
- [ ] Incluir: nome do cliente
- [ ] Incluir: horário do pedido
- [ ] Formatar dados para impressora

### 5.3 Integração com Impressora
- [ ] Pesquisar modelo de impressora de notas
- [ ] Escolher biblioteca de impressão (ex: node-thermal-printer, escpos)
- [ ] Configurar conexão com impressora
- [ ] Testar comunicação
- [ ] Implementar driver de impressão

### 5.4 Template de Comanda
- [ ] Criar layout da comanda
- [ ] Cabeçalho (nome do estabelecimento, data/hora)
- [ ] Informações do pedido (mesa, cliente)
- [ ] Lista de itens com observações
- [ ] Rodapé (instruções, etc.)
- [ ] Formatação adequada para impressora térmica

### 5.5 Fluxo de Impressão
- [ ] Após pagamento bem-sucedido
- [ ] Verificar se pedido tem comida
- [ ] Se sim, enviar para impressão
- [ ] Aguardar confirmação de impressão
- [ ] Tratamento de erros (impressora offline, etc.)
- [ ] Log de impressões

### 5.6 Configurações
- [ ] Configuração de IP/porta da impressora
- [ ] Configuração de modelo de impressora
- [ ] Testes de impressão
- [ ] Opção de reimprimir comanda

## 🔧 Funcionalidades

### Comanda Deve Conter
- **Cabeçalho**:
  - Nome do estabelecimento
  - Data e hora do pedido
  
- **Informações**:
  - Número da mesa
  - Nome do cliente
  
- **Itens**:
  - Nome do produto
  - Quantidade
  - Observações (se houver)
  
- **Rodapé**:
  - Instruções ou informações adicionais

### Categorias que Geram Comanda
- Porções
- Lanches
- (Outras categorias de comida conforme necessário)

## 📝 Entregáveis

- Sistema de impressão funcional
- Template de comanda formatado
- Integração com impressora de notas
- Fluxo automático após pagamento
- Sistema de reimpressão

## ⏱️ Estimativa

- **Tempo**: 1-2 semanas
- **Prioridade**: Média-Alta

## 🔗 Dependências

- FASE 4 (Sistema de Pagamento)

## 📌 Notas

- Depende do modelo de impressora disponível
- Testar com diferentes modelos
- Considerar impressão em modo offline
- Implementar fila de impressão se necessário
- Garantir que comanda seja legível e organizada

---

**Status**: ⏳ Pendente

