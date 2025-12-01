# Visão Geral do Projeto - Sistema PDV Máquininha

## 📋 Descrição do Projeto

Sistema de Ponto de Venda (PDV) desenvolvido para máquininha (POS), focado em simplicidade e funcionalidade. O sistema permite vendas através de um aplicativo instalado na máquininha, utilizando cartões recarregáveis próprios do estabelecimento.

## 🎯 Objetivo

Criar um sistema funcional, simples e fácil de usar para gerenciar vendas em um parque/estabelecimento, com sistema de pagamento via cartão recarregável próprio.

## 🏢 Contexto de Uso

- **Local**: Parque RozAdeVinEdu
- **Dispositivo**: Máquininha POS (aplicativo instalado)
- **Usuários**: Vendedores operando em diferentes pontos de venda
- **Cartão**: Sistema próprio de cartão recarregável físico

## 🔑 Funcionalidades Principais

### 1. Aplicativo PDV (Máquininha)
- Navegação por categorias de produtos
- Seleção de produtos e quantidade
- Carrinho de compras
- Finalização de pedidos
- Gestão de mesas
- Observações por produto
- Pagamento via cartão recarregável
- Impressão de comanda para cozinha

### 2. Sistema de Cartão Recarregável
- Cartões físicos próprios do sistema
- Ativação na bilheteria
- Recarga de saldo
- Desconto automático no pagamento
- Devolução de saldo ao final do dia (após 17h)
- Validade de saldo: 12 meses
- Gestão de perda/furto/extravio

### 3. Sistema PDV Desktop (Bilheteria)
- Ativação de cartões
- Recarga de saldo
- Devolução de saldo
- Gestão de cartões
- Login por operador/POS

## 📱 Categorias de Produtos

- Refrigerante
- Cerveja
- Chopp
- Porções
- Lanches
- Picolés

## 🔄 Fluxo de Venda

1. **Seleção de Produtos**
   - Vendedor navega pelas categorias
   - Seleciona produto e quantidade
   - Adiciona ao carrinho

2. **Finalização do Pedido**
   - Visualização dos itens
   - Adição de observações por produto
   - Inserção do número da mesa
   - Confirmação e avanço para pagamento

3. **Pagamento**
   - Cliente entrega cartão recarregável
   - Sistema lê dados do cartão (nome, saldo)
   - Exibição de valor do pedido e horário
   - Confirmação de pagamento
   - Desconto automático do saldo

4. **Comanda**
   - Se for comida, impressão automática na cozinha
   - Comanda contém: pedido, número da mesa e nome do cliente

## 🛠️ Tecnologias e Requisitos

- **Plataforma**: Aplicativo (instalado na máquininha)
- **Leitura de Cartão**: Sistema de leitura de cartão físico próprio
- **Impressão**: Integração com impressora de notas da cozinha
- **Autenticação**: Login por operador/POS
- **Sincronização**: Sistema centralizado para gestão de cartões e saldos

## 📊 Componentes do Sistema

1. **Aplicativo PDV (Máquininha)**
   - Interface de vendas
   - Leitura de cartão
   - Processamento de pagamento

2. **Sistema PDV Desktop (Bilheteria)**
   - Gestão de cartões
   - Recarga e ativação
   - Devolução de saldo

3. **Backend/Servidor**
   - API para sincronização
   - Banco de dados
   - Gestão de cartões e saldos

## ⚠️ Desafios Identificados

- Leitura e reconhecimento de cartões físicos
- Sincronização entre múltiplos pontos de venda
- Gestão de saldo em tempo real
- Integração com impressora de comanda

## 📅 Status do Projeto

- **Fase Atual**: Planejamento e Estruturação
- **Próximos Passos**: Ver arquivos de fases individuais

---

**Última Atualização**: 01/12/2025

