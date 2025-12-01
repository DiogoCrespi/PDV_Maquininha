# printer Configuração da Impressora Térmica

## 📋 Requisitos

- Impressora térmica compatível (Epson, Star, Bematéch)
- Conexão via rede (TCP/IP), USB ou Serial
- Biblioteca `node-thermal-printer` instalada

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env`:

```env
# Tipo de conexão: network, usb, serial
IMPRESSORA_TIPO=network

# Para conexão via rede (TCP/IP)
IMPRESSORA_IP=192.168.1.100
IMPRESSORA_PORTA=9100

# Para conexão USB (Linux/Mac)
# IMPRESSORA_USB_PATH=/dev/usb/lp0

# Para conexão Serial
# IMPRESSORA_SERIAL_PATH=/dev/ttyUSB0

# Modelo da impressora: epson, star, bematech
IMPRESSORA_MODELO=epson

# Largura da impressora (caracteres por linha)
IMPRESSORA_CARACTERES=48

# Nome do estabelecimento (aparece no cabeçalho)
NOME_ESTABELECIMENTO=RozAdeVinEdu
```

### 2. Tipos de Conexão

#### Rede (Network) - Recomendado
```env
IMPRESSORA_TIPO=network
IMPRESSORA_IP=192.168.1.100
IMPRESSORA_PORTA=9100
```

#### USB (Linux/Mac)
```env
IMPRESSORA_TIPO=usb
IMPRESSORA_USB_PATH=/dev/usb/lp0
```

#### Serial
```env
IMPRESSORA_TIPO=serial
IMPRESSORA_SERIAL_PATH=/dev/ttyUSB0
```

### 3. Modelos Suportados

- **epson**: Impressoras Epson (TM-T20, TM-T82, etc.)
- **star**: Impressoras Star (TSP100, TSP650, etc.)
- **bematech**: Impressoras Bematéch

## 🔧 Teste de Impressão

Para testar a impressora, você pode usar a API de reimpressão:

```bash
# Reimprimir comanda de um pedido
POST /api/comandas/:pedidoId/reimprimir
```

## 🐛 Solução de Problemas

### Impressora não conecta

1. Verifique se o IP está correto:
   ```bash
   ping 192.168.1.100
   ```

2. Verifique se a porta está aberta:
   ```bash
   telnet 192.168.1.100 9100
   ```

3. Verifique se a impressora está ligada e na mesma rede

### Erro de timeout

- Aumente o timeout na configuração
- Verifique firewall/antivírus
- Verifique se a impressora aceita conexões TCP/IP

### Caracteres especiais não aparecem

- Ajuste o `CharacterSet` no código se necessário
- Verifique se a impressora suporta o charset configurado

## 📝 Notas

- A impressão é automática após pagamento bem-sucedido
- Apenas pedidos com comida (Porções, Lanches) geram comanda
- Comandas podem ser reimpressas via API
- Em modo de desenvolvimento (sem impressora), a comanda é exibida no console

## 🔄 Modo Simulação

Se não houver impressora configurada ou conectada, o sistema funciona em modo simulação, exibindo a comanda no console do servidor.

