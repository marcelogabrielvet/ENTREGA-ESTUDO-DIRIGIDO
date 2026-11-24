# Entrega de Estudos Dirigidos – Medicina Veterinária

Página onde os alunos enviam as fotos dos estudos dirigidos respondidos à mão.
As fotos vão para uma pasta do Google Drive do professor e cada entrega vira uma linha numa Planilha Google.

## Configuração (uma única vez, cerca de 10 minutos)

### 1. Criar o recebimento no Google
1. Acesse https://script.google.com com a sua conta Google e clique em **Novo projeto**.
2. Apague o conteúdo do arquivo `Código.gs` e cole todo o conteúdo de [`Codigo.gs`](Codigo.gs).
3. Clique em **Salvar**. No menu de funções, escolha `configurar` e clique em **Executar**.
   O Google vai pedir autorização (escolha sua conta → Avançado → Acessar o projeto → Permitir).
   Isso cria a planilha **"Entregas - Estudos Dirigidos"** e a pasta **"Entregas - Estudos Dirigidos (fotos)"** no seu Drive.
4. Clique em **Implantar → Nova implantação** → tipo **App da Web**.
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
5. Clique em **Implantar** e copie a **URL do app da web** (começa com `https://script.google.com/macros/s/...`).

### 2. Ligar a página ao Google
1. No GitHub, abra o arquivo `index.html` e clique no lápis (editar).
2. Procure a linha `const SCRIPT_URL = "__SCRIPT_URL__";` e troque `__SCRIPT_URL__` pela URL copiada.
3. Clique em **Commit changes**. Em cerca de 1 minuto a página estará atualizada.

### 3. Testar
Abra a página, faça uma entrega de teste com uma foto e confira se a linha apareceu na planilha e a foto na pasta do Drive.

## Correção
Na planilha, aba **Entregas**:
- **Coluna H – Categoria:** `A` (manuscrito e coerente), `B` (manuscrito, mas aleatório) ou `C` (não manuscrito / sem relação).
- **Coluna I – Uso de IA:** `S` aplica desconto de 30%.
- **Coluna J – Nota:** calculada automaticamente. Notas máximas (aba **Configuração**): Semiologia Veterinária = 1,0; Diagnóstico por Imagem = 2,0.

As colunas H, I e K podem ser preenchidas pelo professor ou pelo Claude (com o Google Drive conectado).

## Se mudar o código do Apps Script
Use **Implantar → Gerenciar implantações → Editar → Nova versão**, para manter a mesma URL.
