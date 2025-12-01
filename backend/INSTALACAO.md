# 🚀 Guia de Instalação Rápida

## Passo a Passo

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente (OBRIGATÓRIO)

Copie o arquivo de exemplo e configure:

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

**Linux/Mac:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

```
PORT=3000
JWT_SECRET=seu-secret-key-super-seguro-aqui-mude-em-producao
ADMIN_USUARIO=admin
ADMIN_SENHA=admin123
ADMIN_NOME=Administrador
```

⚠️ **IMPORTANTE**: 
- Altere o `JWT_SECRET` para um valor seguro e único em produção!
- Altere as credenciais do administrador (`ADMIN_USUARIO` e `ADMIN_SENHA`)!

### 3. Inicializar Banco de Dados

```bash
npm run init-db
```

Este comando irá:
- Criar todas as tabelas necessárias
- Inserir categorias iniciais (Refrigerante, Cerveja, Chopp, Porções, Lanches, Picolés)
- Criar usuário admin padrão usando as credenciais definidas no arquivo `.env`

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
2. Faça login com as credenciais definidas no arquivo `.env`:
   - **Usuário**: Valor de `ADMIN_USUARIO` (padrão: `admin`)
   - **Senha**: Valor de `ADMIN_SENHA` (padrão: `admin123`)
3. ⚠️ **IMPORTANTE**: 
   - Altere as credenciais no arquivo `.env` antes de usar em produção!
   - Altere o `JWT_SECRET` para um valor seguro!

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

