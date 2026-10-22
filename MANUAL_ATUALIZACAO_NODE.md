# 📘 Manual de Atualização do AMZX Node & Validadores (Sem Perda de Dados)

> **Guia Oficial de Atualização de Versão** para operadores de nós, mineradores validadores (PoS), exchanges e desenvolvedores da rede AMZX Blockchain.  
> Compatível com instalações em **Linux (VPS/Servidor), Windows (PC/Notebook), macOS e Docker**.

---

## 🔒 Princípio de Preservação Absoluta dos Dados

Ao atualizar o software do AMZX Node para uma nova versão (ex: da `v1.6.4` para a `v1.6.5` ou superior), **nenhum dado da blockchain é apagado**.

Toda a persistência do AMZX é dividida com total isolamento:
1. **Binários do Software (Substituíveis):** Os arquivos `.jar`, executáveis e scripts de inicialização.
2. **Dados da Blockchain (Intocáveis):** O banco de dados LevelDB / RocksDB armazenado na pasta `data` (configurado pela diretiva `waves.directory` no seu `blockchain.conf`). Nele estão todos os blocos desde o Gênesis, contas, saldos, histórico de transações e estado do consenso.
3. **Configuração e Chaves (Intocáveis):** O seu arquivo `blockchain.conf` e a carteira criptografada `wallet.dat`.

Quando o nó é encerrado de forma correta e reiniciado com o novo executável, ele **lê o banco existente, detecta o último bloco minerado e continua sincronizando ou forjando blocos imediatamente**.

---

## 🎯 Escolha o Seu Cenário de Instalação

- [Cenário 1: Nó rodando via Script / Nohup (VPS ou Linux)](#-cenário-1-nó-rodando-via-script--nohup-linux--vps)
- [Cenário 2: Nó instalado via Pacote Debian / Ubuntu (.deb / APT)](#-cenário-2-nó-instalado-via-pacote-debian--ubuntu-deb--apt)
- [Cenário 3: Nó rodando em Contêiner Docker](#-cenário-3-nó-rodando-em-contêiner-docker)
- [Cenário 4: Nó rodando no Windows (PC ou Notebook)](#-cenário-4-nó-rodando-no-windows-pc--notebook)
- [Cenário 5: Nó rodando no macOS](#-cenário-5-nó-rodando-no-macos)
- [Estratégia Rolling Update para Validadores (Multi-Nós)](#-estratégia-rolling-update-para-redes-com-vários-nós)
- [Diagnóstico e Verificação Pós-Atualização](#-checklist-de-verificação-pós-atualização)

---

## 🚀 Cenário 1: Nó rodando via Script / Nohup (Linux / VPS)

Este é o padrão criado pelo assistente interativo (`amz-network-wizard/init-network.sh` ou `join-network.sh`).

### Passo 1: Parar o Nó Graciosa e Seguramente
Acesse o diretório onde o nó está executando:
```bash
cd ~/amzx-network-pro/node # (ou o seu diretório de execução)

# Se existir o script de parada:
./stop-node.sh

# OU envie o sinal SIGTERM para salvar os dados da memória no disco:
pkill -TERM -f "com.wavesplatform.Application"
```
> ⚠️ **Atenção:** Evite usar `kill -9` (SIGKILL). O sinal `-TERM` permite que o nó feche os índices do LevelDB de forma 100% limpa. Aguarde 3 a 5 segundos e confirme que o processo encerrou com `ps aux | grep Application`.

### Passo 2: Obter a Nova Versão

**Opção A — Baixar o Fat JAR compilado diretamente do GitHub (Recomendado / Mais Rápido):**
```bash
# Baixar o JAR da nova release (exemplo v1.6.5):
wget https://github.com/D-H-O-R-A/amzx/releases/download/v1.6.5/waves-all-1.6.5.jar -O waves-all-1.6.5.jar
```

**Opção B — Compilar a partir do código-fonte:**
```bash
cd ~/amzx
git fetch --all --tags
git checkout v1.6.5   # ou a versão desejada
sbt node/assembly
# O JAR compilado estará em: ~/amzx/node/target/waves-all-1.6.5.jar
```

### Passo 3: Atualizar o Caminho no Script `start-node.sh`
No diretório onde fica o seu `start-node.sh`:
```bash
# Atualizar a referência do JAR antigo para o novo no start-node.sh:
sed -i 's/waves-all-[0-9.]*\.jar/waves-all-1.6.5.jar/g' start-node.sh
```

### Passo 4: Reiniciar o Nó
```bash
nohup ./start-node.sh < /dev/null > node.log 2>&1 &
```

### Passo 5: Confirmar Continuidade
```bash
# Acompanhar os logs:
tail -f node.log

# Consultar a altura atual da blockchain via REST API:
curl http://127.0.0.1:6869/blocks/height
```

---

## 📦 Cenário 2: Nó instalado via Pacote Debian / Ubuntu (.deb / APT)

Se o seu nó foi instalado como serviço do sistema operacional através do pacote `.deb`:

### Passo 1: Parar o Serviço
```bash
sudo systemctl stop waves
```

### Passo 2: Baixar e Instalar a Nova Versão
Os arquivos de dados em `/var/lib/waves/data` e a configuração em `/etc/waves/waves.conf` são marcados como arquivos de configuração e dados persistentes, portanto **o gerenciador de pacotes APT/DPKG NÃO sobrescreve nem apaga seus dados**.

```bash
# Baixar o pacote .deb da release:
wget https://github.com/D-H-O-R-A/amzx/releases/download/v1.6.5/waves_1.6.5_all.deb

# Instalar a nova versão:
sudo dpkg -i waves_1.6.5_all.deb
# ou
sudo apt-get install --only-upgrade ./waves_1.6.5_all.deb
```

### Passo 3: Reiniciar o Serviço
```bash
sudo systemctl daemon-reload
sudo systemctl start waves
sudo systemctl status waves
```

---

## 🐳 Cenário 3: Nó rodando em Contêiner Docker

Ao utilizar Docker, a garantia de persistência reside no uso de volumes mapeados para o host (`-v`).

### Passo 1: Parar o Contêiner Atual
```bash
docker stop amzx-node
```

### Passo 2: Atualizar a Imagem Docker
```bash
# Puxar a nova versão do registro:
docker pull ghcr.io/d-h-o-r-a/amzx:v1.6.5
# ou
docker pull ghcr.io/d-h-o-r-a/amzx:latest
```

### Passo 3: Subir o Contêiner Mantendo os Volumes Persistentes
Certifique-se de reapontar para os mesmos diretórios de configuração e dados no seu disco:
```bash
docker rm amzx-node

docker run -d \
  --name amzx-node \
  --restart unless-stopped \
  -p 6869:6869 \
  -p 6868:6868 \
  -v /caminho/no/host/blockchain.conf:/etc/waves/waves.conf:ro \
  -v /caminho/no/host/data:/var/lib/waves/data \
  ghcr.io/d-h-o-r-a/amzx:v1.6.5
```
> Como o volume `/caminho/no/host/data` é reutilizado, o banco de dados LevelDB continua no bloco exato onde parou.

---

## 🪟 Cenário 4: Nó rodando no Windows (PC / Notebook)

Se você roda um validador ou nó local no Windows:

### Passo 1: Encerrar o Nó
- Se estiver rodando no **Prompt de Comando (CMD)** ou **PowerShell**, pressione `Ctrl + C` e aguarde a finalização limpa.
- **Não encerre abruptamente pelo Gerenciador de Tarefas sem salvar.**

### Passo 2: Baixar a Nova Versão
Acesse [https://github.com/D-H-O-R-A/amzx/releases](https://github.com/D-H-O-R-A/amzx/releases) e baixe:
- O novo arquivo `waves-all-1.6.5.jar` ou o pacote ZIP Universal `waves-1.6.5.zip`.

### Passo 3: Substituir o Executável
- Coloque o novo `waves-all-1.6.5.jar` na pasta do seu nó.
- **NÃO apague nem altere** a pasta `data/` existente nem o seu arquivo `.conf`.

### Passo 4: Iniciar o Nó Novamente
No PowerShell ou CMD, dentro da pasta do nó:
```powershell
java --add-opens=java.base/sun.nio.ch=ALL-UNNAMED --add-opens=java.base/java.util.concurrent.atomic=ALL-UNNAMED -cp "waves-all-1.6.5.jar;lib/*" com.wavesplatform.Application blockchain.conf
```
*(Ou se você utiliza um arquivo `.bat`, apenas atualize o nome do arquivo JAR dentro do script batch).*

---

## 🍎 Cenário 5: Nó rodando no macOS

### Passo 1: Parar o Processo
No Terminal:
```bash
pkill -TERM -f "com.wavesplatform.Application"
```

### Passo 2: Baixar a Nova Versão
Baixe o arquivo `waves-all-1.6.5.jar` da release oficial para a pasta do seu nó:
```bash
curl -LO https://github.com/D-H-O-R-A/amzx/releases/download/v1.6.5/waves-all-1.6.5.jar
```

### Passo 3: Iniciar
Execute mantendo o mesmo arquivo `blockchain.conf`:
```bash
java \
  --add-opens=java.base/sun.nio.ch=ALL-UNNAMED \
  --add-opens=java.base/java.util.concurrent.atomic=ALL-UNNAMED \
  -cp "waves-all-1.6.5.jar:lib/*" \
  com.wavesplatform.Application blockchain.conf
```

---

## 🔄 Estratégia Rolling Update para Redes com Vários Nós

Se você administra uma rede privada ou consórcio com **vários nós validadores (ex: 4 nós mineradores)**:

```
[Nó 1: Atualizando...] ➔ [Nó 2: Online 🟢] ➔ [Nó 3: Online 🟢] ➔ [Nó 4: Online 🟢]
               (Rede continua minerando sem interrupção!)
```

1. **Nunca desligue todos os nós ao mesmo tempo.**
2. Atualize o **Nó 1**, aguarde iniciar, consulte a altura e verifique se ele voltou a receber blocos.
3. Repita o processo no **Nó 2**, depois no **Nó 3** e por fim no **Nó 4**.
4. Dessa forma, a rede opera com **zero downtime** e sem risco de forks ou interrupção na produção de blocos.

---

## 🩺 Checklist de Verificação Pós-Atualização

Após reiniciar o seu nó, execute as seguintes checagens para garantir conformidade:

1. **Verificar a versão ativa no nó:**
   ```bash
   curl http://127.0.0.1:6869/node/version
   ```
   *Deve retornar `v1.6.5` ou a versão instalada.*

2. **Verificar a altura da blockchain:**
   ```bash
   curl http://127.0.0.1:6869/blocks/height
   ```
   *A altura deve ser igual ou superior à altura de antes da atualização.*

3. **Verificar a conexão P2P com outros nós:**
   ```bash
   curl http://127.0.0.1:6869/peers/connected
   ```

4. **Executar o auto-diagnóstico do AMZX Doctor:**
   ```bash
   ./amzx-doctor.sh
   ```
   *O AMZX Doctor validará portas (6869, 6868), proxy reverso Nginx, certificados SSL e consistência do banco de dados.*

---

## 🆘 Suporte e Ajuda

Em caso de dúvidas durante a atualização:
- **Repositório Oficial:** [https://github.com/D-H-O-R-A/amzx](https://github.com/D-H-O-R-A/amzx)
- **Releases e Binários:** [https://github.com/D-H-O-R-A/amzx/releases](https://github.com/D-H-O-R-A/amzx/releases)
- **Contato Técnico:** Diego Antunes ([diegoantunes2301@gmail.com](mailto:diegoantunes2301@gmail.com) | WhatsApp: +55 11 97428-9097)
