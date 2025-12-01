# FASE 6 - Sistema PDV Desktop (Bilheteria)

## 🎯 Objetivo da Fase

Desenvolver o sistema desktop para bilheteria, permitindo ativação de cartões, recarga de saldo e devolução de saldo.

## 📋 Tarefas

### 6.1 Estrutura do Sistema Desktop
- [ ] Escolher tecnologia (Electron, Tauri, ou aplicação web)
- [ ] Configurar projeto desktop
- [ ] Interface de login (operador)
- [ ] Dashboard principal
- [ ] Navegação entre módulos

### 6.2 Gestão de Cartões
- [ ] Tela de cadastro de cartões
- [ ] Inserir ID do cartão manualmente
- [ ] Ativar cartão
- [ ] Desativar/cancelar cartão
- [ ] Buscar cartão por ID
- [ ] Listar todos os cartões
- [ ] Status do cartão (ativo, inativo, cancelado)

### 6.3 Ativação de Cartões
- [ ] Tela de ativação
- [ ] Inserir ID do cartão
- [ ] Inserir nome do cliente
- [ ] Ativar cartão no sistema
- [ ] Saldo inicial (geralmente R$ 0,00)
- [ ] Confirmação de ativação
- [ ] Impressão de comprovante (opcional)

### 6.4 Recarga de Saldo
- [ ] Tela de recarga
- [ ] Buscar cartão por ID
- [ ] Exibir dados do cartão (nome, saldo atual)
- [ ] Campo para valor da recarga
- [ ] Processar recarga
- [ ] Atualizar saldo no banco
- [ ] Registrar transação de recarga
- [ ] Comprovante de recarga
- [ ] Histórico de recargas

### 6.5 Devolução de Saldo
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

### 6.6 Consultas e Relatórios
- [ ] Consultar saldo de cartão
- [ ] Histórico de transações do cartão
- [ ] Relatório de recargas do dia
- [ ] Relatório de devoluções do dia
- [ ] Relatório de cartões ativos
- [ ] Exportar relatórios

### 6.7 APIs Necessárias
- [ ] Endpoint para ativar cartão
- [ ] Endpoint para recarregar saldo
- [ ] Endpoint para devolver saldo
- [ ] Endpoint para buscar cartão
- [ ] Endpoint para listar cartões
- [ ] Endpoint para cancelar cartão
- [ ] Endpoint para histórico de transações

## 🔧 Funcionalidades

### Módulos do Sistema
1. **Ativação de Cartões**
   - Cadastrar novo cartão
   - Associar nome do cliente
   - Ativar no sistema

2. **Recarga de Saldo**
   - Buscar cartão
   - Adicionar saldo
   - Comprovante

3. **Devolução de Saldo**
   - Buscar cartão
   - Verificar saldo
   - Devolver saldo (após 17h)
   - Comprovante

4. **Consultas**
   - Saldo de cartão
   - Histórico de transações
   - Relatórios

### Regras de Negócio
- Saldo válido por 12 meses
- Devolução apenas após 17h
- Cartão pode ser cancelado em caso de perda/furto
- Todas as transações devem ser registradas

## 📝 Entregáveis

- Sistema desktop funcional
- Módulo de ativação de cartões
- Módulo de recarga de saldo
- Módulo de devolução de saldo
- Sistema de consultas e relatórios
- APIs de gestão de cartões

## ⏱️ Estimativa

- **Tempo**: 2-3 semanas
- **Prioridade**: Alta

## 🔗 Dependências

- FASE 1 (Estrutura Base - banco de dados e APIs)
- FASE 4 (Sistema de Cartões - estrutura de dados)

## 📌 Notas

- Sistema deve ser simples e rápido de usar
- Interface deve ser clara para operadores
- Validar todas as operações financeiras
- Implementar logs detalhados
- Considerar impressão de comprovantes

---

**Status**: ⏳ Pendente

