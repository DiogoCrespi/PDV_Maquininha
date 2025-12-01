# 🚀 Guia de Instalação Rápida

## Passo a Passo

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente (Opcional)

Crie um arquivo `.env` na raiz do projeto com:

```
PORT=3000
JWT_SECRET=seu-secret-key-super-seguro-aqui
```

⚠️ **IMPORTANTE**: Altere o `JWT_SECRET` para um valor seguro em produção!

### 3. Inicializar Banco de Dados

```bash
npm run init-db
```

Este comando irá:
- Criar todas as tabelas necessárias
- Inserir categorias iniciais (Refrigerante, Cerveja, Chopp, Porções, Lanches, Picolés)
- Criar usuário admin padrão (usuário: `admin`, senha: `admin123`)

### 4. Iniciar o Servidor

```bash
npm start
```

Para desenvolvimento com auto-reload:
```bash
npm run dev
```

### 5. Acessar o Sistema

Abra seu navegador e acesse:

- **Local**: http://localhost:3000
- **Rede Local**: http://[IP-DO-SERVIDOR]:3000

Exemplo: Se o servidor estiver no IP `192.168.1.100`, acesse de qualquer máquina na mesma rede: `http://192.168.1.100:3000`

## 🔍 Descobrir o IP do Servidor

### Windows:
```bash
ipconfig
```
Procure por "IPv4 Address" na interface de rede ativa.

### Linux/Mac:
```bash
ifconfig
```
ou
```bash
ip addr show
```

## 📝 Primeiro Acesso

1. Acesse a URL do servidor no navegador
2. Faça login com:
   - **Usuário**: `admin`
   - **Senha**: `admin123`
3. ⚠️ **IMPORTANTE**: Altere a senha do admin após o primeiro acesso!

## 🛠️ Solução de Problemas

### Porta já em uso
Se a porta 3000 estiver em uso, altere no arquivo `.env`:
```
PORT=3001
```

### Erro ao conectar no banco
Certifique-se de que o script `init-db` foi executado com sucesso.

### Não consigo acessar de outra máquina
1. Verifique se o firewall do Windows não está bloqueando a porta
2. Certifique-se de que todas as máquinas estão na mesma rede
3. Verifique se o IP está correto

## 📦 Distribuição

Para distribuir o sistema para outras máquinas:

1. Copie toda a pasta do projeto
2. Na máquina destino, execute `npm install`
3. Execute `npm run init-db` (apenas na primeira vez)
4. Execute `npm start`

**Nota**: O banco de dados SQLite (`database.sqlite`) será criado automaticamente. Para compartilhar dados entre máquinas, coloque o arquivo `database.sqlite` em um local compartilhado na rede e configure o caminho no `config/database.js`.

