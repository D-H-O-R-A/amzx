# 🚀 AMZX Blockchain - CLI Toolkit

Bem-vindo ao **AMZX Blockchain CLI Toolkit**! Este conjunto de ferramentas foi desenvolvido especialmente para facilitar as interações administrativas e operacionais com a rede privada AMZX (baseada em Waves) de forma rápida, robusta e direta pelo terminal.

Com este toolkit, você pode realizar operações complexas de criptografia offline (assinatura de transações) e transmissão para qualquer nó da rede sem precisar de interfaces gráficas pesadas ou programações em Java/Scala.

---

## 🛠️ Requisitos e Instalação

As dependências já estão configuradas no ambiente. Mas, caso queira clonar ou executar estas ferramentas em outra máquina, os únicos requisitos são:
1. **Node.js** (Versão 18 ou superior)
2. **NPM** (Gerenciador de pacotes do Node.js)

Para instalar as dependências em uma nova instalação, navegue até a pasta `tools/` e execute:
```bash
npm install
```

---

## 📁 Estrutura das Ferramentas

O toolkit é composto de um motor principal em JavaScript (`index.js`) que usa a biblioteca criptográfica oficial `@waves/waves-transactions`, acompanhado de quatro scripts de atalho em Bash (`.sh`) para simplificar as chamadas de comando:

*   `create-address.sh` ➡️ Geração e derivação de contas (Seed, Address e Chaves).
*   `create-token.sh` ➡️ Emissão de novos ativos/tokens customizados na blockchain.
*   `transfer.sh` ➡️ Transferência de ativos (AMZ nativo ou tokens customizados).
*   `sponsor.sh` ➡️ Ativação e gerenciamento de patrocínio de taxas (Sponsorship).

---

## 📖 Guia de Uso Completo

### 1. Criar ou Derivar um Endereço (`create-address.sh`)
Gera uma nova conta aleatória (Seed Phrase de 15 palavras, Chaves Pública/Privada e Endereço) ou deriva o par de chaves e o endereço de uma Seed Phrase existente.

#### Como usar:
*   **Gerar uma conta nova aleatória:**
    ```bash
    ./create-address.sh
    ```
*   **Derivar o endereço de uma Seed existente:**
    ```bash
    ./create-address.sh "sua frase seed secreta aqui"
    ```
*   **Derivar o endereço especificando outro Chain ID (Ex: 'B'):**
    ```bash
    ./create-address.sh "sua frase seed secreta aqui" B
    ```

---

### 2. Criar um Novo Token (`create-token.sh`)
Emite um novo token customizado na blockchain AMZX. A quantidade total (Total Supply) é convertida automaticamente usando os decimais especificados para garantir precisão exata.

> [!NOTE]
> A taxa padrão para criação de tokens na rede AMZX é de **1.0 AMZ** nativo. Certifique-se de que o endereço emissor (Seed) possua saldo suficiente.

#### Parâmetros requeridos:
```bash
./create-token.sh <nodeUrl> <chainId> <nome> <totalSupply> <decimais> <descricao> "<seed>"
```

#### Exemplo prático:
```bash
./create-token.sh http://localhost:6869 A "DiegoCoin" 1000000 8 "Moeda oficial do ecossistema" "entire fat change ice arena biology pumpkin gym mix warrior tourist theme crack entry draft"
```

---

### 3. Transferir Valores (`transfer.sh`)
Transfere ativos nativos (AMZ) ou tokens customizados para outro endereço. 

> [!TIP]
> **Inteligência de Decimais:** Ao transferir tokens customizados, o script consulta dinamicamente o nó para detectar automaticamente a quantidade de decimais do token. Você pode digitar o valor real (Ex: `150.5` ou `10.25`) e o script fará as contas de conversão para unidades mínimas de forma transparente!

#### Parâmetros requeridos:
```bash
./transfer.sh <nodeUrl> <chainId> <destinatario> <valor> [tokenId_ou_null] [taxa_ou_null] "<seed>"
```

#### Exemplos práticos:
*   **Enviar AMZ Nativo (Padrão):**
    ```bash
    ./transfer.sh http://localhost:6869 A 3EZPNrrkLaFe9YuW2ndyqMWK45Kx1btMbT6 150.5 null null "sua seed aqui"
    ```
    *(Nota: Se o ID do token e a taxa forem passados como `null`, o script assume o token AMZ com taxa padrão de `0.001` AMZ).*

*   **Enviar Token Customizado:**
    ```bash
    ./transfer.sh http://localhost:6869 A 3EZPNrrkLaFe9YuW2ndyqMWK45Kx1btMbT6 1000 5rxiLQ3Vnpkdgj9jN1GFp2NY6T8PoA5V2wFD1rPXWAth 0.001 "sua seed aqui"
    ```

---

### 4. Iniciar Patrocínio de Taxas - Sponsorship (`sponsor.sh`)
Permite que o seu token seja utilizado para pagar taxas de transação na rede. Ao ativar isso, os usuários pagam as taxas usando o seu token, e o custo nativo de 0.001 AMZ correspondente à transação é debitado automaticamente da conta do patrocinador.

> [!IMPORTANT]
> A transação de ativação do Sponsorship custa **1.0 AMZ**. A conta do patrocinador (Seed) precisa ter saldo em AMZ nativo para cobrir o custo de ativação e para servir de fundo para as taxas patrocinadas que forem consumidas pelos usuários.

#### Parâmetros requeridos:
```bash
./sponsor.sh <nodeUrl> <chainId> <tokenId> <valorSponsorshipToken> [taxaTransacao] [descricao] "<seed>"
```
*   `valorSponsorshipToken`: Quantidade de tokens que equivale a 1 transação padrão de taxa (0.001 AMZ). Por exemplo, se você quer que cada transação custe exatamente `1.0` do seu token, passe `1.0`.

#### Exemplos práticos:
*   **Ativar Sponsorship (taxa de 1.0 do seu token por transação):**
    ```bash
    ./sponsor.sh http://localhost:6869 A 5rxiLQ3Vnpkdgj9jN1GFp2NY6T8PoA5V2wFD1rPXWAth 1.0 1.0 "Ativando taxas em DiegoCoin" "sua seed aqui"
    ```
*   **Desativar Sponsorship (Sponsorship cancelado):**
    ```bash
    ./sponsor.sh http://localhost:6869 A 5rxiLQ3Vnpkdgj9jN1GFp2NY6T8PoA5V2wFD1rPXWAth 0 1.0 "Cancelando patrocínio" "sua seed aqui"
    ```

---

## 🎨 Design e Tratamento de Erros

As ferramentas possuem um sistema de resposta visual premium com cores ANSI para facilitar o acompanhamento e diagnóstico diretamente do seu terminal.

*   **Validação Matemática:** Todos os cálculos numéricos são processados em `BigInt` com funções de parser de string exatas. Isso elimina falhas comuns de arredondamento de float do JavaScript.
*   **Resolução de Erros da Blockchain:** Caso ocorra um erro de rede, de saldo insuficiente, de assinatura ou de parâmetros inválidos da blockchain, o toolkit interceptará o erro e exibirá os detalhes decodificados vindos do nó de forma organizada.
