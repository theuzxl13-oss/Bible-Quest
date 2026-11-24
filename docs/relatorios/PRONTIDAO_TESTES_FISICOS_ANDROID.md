# Bible Quest — Prontidão dos testes físicos do Android (0.17.9)

**Data:** 24/11/2026, 22h30 (UTC)
**Branch consultada:** `claude/bible-quest-android` (commit `8ceebef`).
**Situação:** verificação de prontidão. **Nada foi alterado:** nem o jogo, nem a configuração Android, nem os documentos existentes. Nenhum APK novo foi gerado.
**Material verificado:**
- APK de diagnóstico;
- `docs/relatorios/ANDROID_TESTE_APARELHOS_FISICOS.md` e `.pdf` (o "roteiro");
- analisador `tools/android/diagnostico/analisar-logcat.cjs`;
- grupos complementares A a D (`PLANEJAMENTO_1_0_TESTES_FISICOS.md`, seção 3.2).

## 1. Resumo

- **O material está pronto para uso, com uma correção obrigatória nas instruções do Windows:**
  - se o registro for gravado pelo **PowerShell**, que é o terminal padrão do Windows 11, o arquivo sai em outra codificação (UTF-16) e **a análise não lê nada**. Testei com um registro real: **0 aberturas** encontradas;
  - pelo **Prompt de Comando (cmd)**, o arquivo sai correto.
- **Outras 9 correções recomendadas nas instruções** (seção 3). Por exemplo:
  - os comandos com `grep` e `head` não existem no Windows;
  - a captura de tela pelo `adb` estraga a imagem no PowerShell;
  - faltam drivers USB e o caminho das "Opções do desenvolvedor" em Samsung e Xiaomi;
  - o nome do arquivo do APK no roteiro não é o mesmo que vem no download.
- **APK de diagnóstico disponível até 01/12/2026, 15h39 (UTC), 12h39 em Brasília.** Depois de **baixado**, o arquivo continua funcionando no computador mesmo após essa data. Recomendação: **baixar já**.
- **Proposta:** um **guia passo a passo simplificado** (seção 5), separando o que se faz no celular e o que se faz no computador, para substituir as partes técnicas do roteiro **depois da aprovação de vocês**.

## 2. Verificação do material

| Item | Situação | Observação |
|---|---|---|
| APK de diagnóstico `0.17.9-diagnostico` | **Correto e disponível** | Artefato `bible-quest-0.17.9-diagnostico-NAO-DISTRIBUIR`, 17,5 MB, conferido agora. O download é um `.zip`; dentro dele está **`app-diagnostico.apk`** |
| Roteiro em Markdown e PDF | **Correto no conteúdo**, com ajustes de redação para Windows (seção 3) | O PDF é igual ao Markdown (gerado a partir dele) |
| Instalação (`adb uninstall` e `adb install`) | **Correto** | O APK de diagnóstico tem outra assinatura: desinstalar antes é necessário. Faltam avisos sobre o Play Protect e o Xiaomi (seção 3) |
| Coleta do registro (`adb logcat -v epoch … > arquivo`) | **Correto no Prompt de Comando; problema no PowerShell** | Testado: arquivo em UTF-8 com quebras de linha do Windows (CRLF) é lido normalmente; arquivo em UTF-16 (PowerShell) dá 0 aberturas |
| Rótulos de cenário (`adb shell log -t BQDiag "cenario: …"`) | **Correto** | Funcionam no Prompt de Comando; as aspas duplas estão certas |
| Abertura medida (`am start -W` com `TotalTime`) | **Correto** | — |
| Comandos com `grep` e `head` | **Problema no Windows** | O roteiro manda trocar por `findstr`, mas `head` não tem equivalente direto (seção 3) |
| Captura de tela pelo `adb` (`adb exec-out screencap -p > anr.png`) | **Problema no PowerShell** | A imagem sai corrompida; no Prompt de Comando funciona. Mais simples: captura pelo próprio celular |
| Os 10 cenários | **Completos e compreensíveis**, com pequenos esclarecimentos (seção 3) | Cobrem abertura, Central 3D, 2D, internet e modo avião, segundo plano, toques e ANR |
| Grupos complementares A a D | **Não estão no roteiro** | Estão só no planejamento (seção 3.2). Para quem executa, a proposta é reuni-los no guia (seção 5, cenários 11 a 14) |
| Analisador | **Correto** para arquivos em UTF-8 (com ou sem CRLF) | Não lê UTF-16. Correção proposta no próprio analisador, que é uma ferramenta e não código do jogo (P-ANL, seção 3) |
| Registro do jogo | **Correto** | `BQDiag` (Android) e `Capacitor/Console` (jogo) aparecem no logcat sem nenhuma ferramenta conectada. Isso foi validado no emulador (15 aberturas lidas) |

## 3. O que precisa ser corrigido nas instruções (para aprovação)

| # | Gravidade | Problema | Correção proposta |
|---|---|---|---|
| 1 | **Crítica** | No **PowerShell**, `> registro.txt` grava em UTF-16, e a análise lê 0 aberturas | Instruir a usar **sempre o Prompt de Comando (cmd)**, inclusive no Windows 11, e explicar como abri-lo dentro da pasta do `adb` (seção 5.2) |
| 2 | Alta | `adb` não é reconhecido se o comando for dado fora da pasta do Platform-Tools | Abrir o Prompt de Comando **dentro da pasta `platform-tools`**: digitar `cmd` na barra de endereço do Explorador de Arquivos |
| 3 | Alta | `adb devices` vazio no Windows em celulares que não são Pixel | Instalar o **driver USB do fabricante** (Samsung, Motorola, Xiaomi, LG); usar um cabo de **dados**, não só de carga |
| 4 | Média | `| grep` e `| head` não existem no Windows | Rodar o filtro **dentro do celular**: `adb shell "dumpsys package com.kzanntech.biblequest | grep versionName"` e `adb shell "head -n 1 /proc/meminfo"`. Assim funciona igual em qualquer computador |
| 5 | Média | A captura pelo `adb` corrompe no PowerShell | Usar a **captura do próprio celular** (botões **ligar + diminuir volume**) e enviar as imagens junto |
| 6 | Média | O caminho das Opções do desenvolvedor varia por marca | Incluir os caminhos de Samsung, Motorola e Xiaomi; no Xiaomi, ligar também **"Instalar via USB"** (pode pedir conta Mi e chip) |
| 7 | Média | O Play Protect pode avisar ao instalar um APK de teste | Explicar que é esperado e tocar em **"Instalar mesmo assim"** ou "Mais detalhes → Instalar". Não desligar o Play Protect |
| 8 | Média | O nome do arquivo no roteiro (`bible-quest-0.17.9-diagnostico.apk`) não é o mesmo do download (`app-diagnostico.apk`) | Usar o nome real nos comandos |
| 9 | Baixa | A tela do celular apaga durante o teste | Em Opções do desenvolvedor, ligar **"Manter tela ativa"** (enquanto carrega); deixar o **modo de economia de bateria desligado** |
| 10 | Baixa | O caminho para a qualidade 2D é vago ("Configurações → Qualidade gráfica") | Na Central: **engrenagem no canto superior direito → "Qualidade gráfica do personagem" → "2D"** |
| 11 | Baixa | No cenário 1, o nome do perfil não é indicado | Usar um **nome fictício** (por exemplo, "Teste"), nunca o nome real da pessoa |
| 12 | Baixa | Em Android 7 a 9, o formato `-v epoch` pode não existir | Se aparecer erro de formato, usar `-v time` no lugar e avisar. A análise funciona, só sem o horário exato dos ANR |
| P-ANL | Média (ferramenta) | O analisador não lê UTF-16 | **Proposta:** fazer o analisador reconhecer UTF-16 automaticamente. Muda só `tools/android/diagnostico/analisar-logcat.cjs`, não o jogo nem o APK. Só com autorização. Enquanto isso, a correção 1 resolve |

**Para aplicar as correções de 1 a 12** é preciso atualizar o roteiro (`ANDROID_TESTE_APARELHOS_FISICOS.md` e `.pdf`). Não fiz a atualização, que depende da aprovação de vocês. A seção 5 traz o texto pronto.

## 4. Dificuldades previstas

| Dificuldade | Como contornar |
|---|---|
| A pessoa não conhece o `adb` | Guia da seção 5, com os comandos prontos para copiar e colar. A sessão leva cerca de 60 a 75 minutos por aparelho |
| Driver USB ou autorização ("unauthorized") | Instalar o driver do fabricante; aceitar "Permitir depuração USB" no celular, marcando "Sempre permitir neste computador" |
| O cabo desconecta no meio do teste | O registro **para de gravar**. Reconectar e iniciar um **novo arquivo** (por exemplo, `registro-entrada-2.txt`), repetindo o cenário interrompido. Os dois arquivos são enviados |
| O APK vence antes do teste | Baixar **já**; o arquivo baixado continua valendo. Se o download não for feito a tempo, gero o mesmo APK de novo, com autorização |
| Aparelho com Android 7 a 9 | Pode não abrir (tela branca) por causa de um WebView antigo. **Esse é justamente o resultado que precisamos registrar**, com a versão do WebView |
| Xiaomi e Redmi | Exigem "Instalar via USB" (conta Mi e chip) além da depuração USB |
| Toques durante a abertura (cenários 4, 7 e 10) | Combinar o ritmo: cerca de 30 toques em 10 segundos, em áreas **vazias** (céu), para não abrir outras telas |

## 5. Guia simplificado proposto (para substituir as partes técnicas do roteiro depois da aprovação)

### 5.1 No CELULAR: preparar (uma vez)

1. **Carregue** o celular acima de 50% e deixe-o **ligado ao carregador** durante o teste.
2. **Desligue a economia de bateria.**
3. **Ative as Opções do desenvolvedor:**
   - **Pixel e Android "puro":** Configurações → Sobre o telefone → toque 7 vezes em **Número da versão**;
   - **Samsung:** Configurações → Sobre o telefone → Informações do software → toque 7 vezes em **Número de compilação**;
   - **Motorola:** Configurações → Sobre o telefone → toque 7 vezes em **Número da versão**;
   - **Xiaomi e Redmi:** Configurações → Sobre o telefone → toque 7 vezes em **Versão do MIUI / HyperOS**.
4. **Entre em Opções do desenvolvedor:**
   - em geral fica em Configurações → Sistema; no Xiaomi, em Configurações adicionais;
   - ligue **Depuração USB** e **Manter tela ativa**;
   - no Xiaomi, ligue também **Instalar via USB**.
5. **Anote** se as **animações do sistema** estão ligadas: em Opções do desenvolvedor, "Escala de animação da janela" (1x = ligadas). Não mude.

### 5.2 No COMPUTADOR Windows: preparar (uma vez)

1. **Baixe o Android SDK Platform-Tools para Windows** (site oficial do Android para desenvolvedores) e **extraia** o `.zip`, por exemplo em `C:\platform-tools`.
2. **Baixe o APK de diagnóstico** pelo link do artefato, conectado ao GitHub:
   - extraia o `.zip`;
   - copie o **`app-diagnostico.apk`** para dentro de `C:\platform-tools`.
3. **Abra o Prompt de Comando dentro dessa pasta:**
   - abra a pasta no Explorador de Arquivos;
   - clique na barra de endereço;
   - digite **`cmd`** e aperte Enter.

   **Não use o PowerShell nem o Terminal do Windows**, porque o registro sai num formato que não conseguimos ler.
4. **Ligue o celular** com o cabo USB de dados. No celular, aceite **"Permitir depuração USB?"**, marcando "Sempre permitir".
5. **No Prompt de Comando, confira a conexão** com o comando abaixo. Deve aparecer uma linha terminando em `device`:

   ```bash
   adb devices
   ```

   Se aparecer vazio ou `unauthorized`, veja a seção 4.

### 5.3 Instalar (no computador, com o celular ligado ao cabo)

```bash
adb uninstall com.kzanntech.biblequest
```

(Se disser que não está instalado, tudo bem.)

```bash
adb install app-diagnostico.apk
```

Se o celular mostrar um aviso do Play Protect, toque em **"Instalar mesmo assim"**.

Confira a versão. Deve aparecer `versionName=0.17.9-diagnostico`:

```bash
adb shell "dumpsys package com.kzanntech.biblequest | grep versionName"
```

Anote os dados do aparelho (copie o resultado para o relatório):

```bash
adb shell getprop ro.product.model
```

```bash
adb shell getprop ro.build.version.release
```

```bash
adb shell "head -n 1 /proc/meminfo"
```

```bash
adb shell "dumpsys package com.google.android.webview | grep versionName"
```

No Android 7 a 9, se o último comando não mostrar nada, troque `com.google.android.webview` por `com.android.chrome`.

### 5.4 Gravar o registro (no computador)

**Janela 1 do Prompt de Comando:** fica gravando durante todo o teste.

```bash
adb logcat -c
```

```bash
adb logcat -v epoch BQDiag:V Capacitor/Console:V ActivityManager:V ActivityTaskManager:V *:S > registro-entrada.txt
```

(No aparelho intermediário, use `registro-intermediario.txt`; no antigo, `registro-antigo.txt`.)

A janela fica "parada": é normal, ela está gravando. **Não feche** essa janela.

**Janela 2 do Prompt de Comando:** abra outra, do mesmo jeito (barra de endereço → `cmd`), para os comandos dos cenários.

### 5.5 Cenários

**Em cada cenário,** na **janela 2**:
1. grave o rótulo;
2. feche o aplicativo;
3. abra o aplicativo.

Depois, faça **no celular** o que a tabela indica.

```bash
adb shell log -t BQDiag "cenario: NOME"
```

```bash
adb shell am force-stop com.kzanntech.biblequest
```

```bash
adb shell am start -W -n com.kzanntech.biblequest/.MainActivity
```

**Anote o número `TotalTime`** que aparece depois do último comando. É o tempo de abertura em milissegundos.

| # | NOME (rótulo) | No CELULAR | Anotar |
|---|---|---|---|
| 1 | `primeira-abertura` | espere a tela de boas-vindas; crie um perfil com **nome fictício** ("Teste"), escolha o personagem e chegue à Central; espere o acampamento 3D aparecer completo | TotalTime; tempo aproximado até as boas-vindas e até o acampamento |
| 2 | `central-internet-1` | Wi-Fi ligado. **Não toque** em nada até o acampamento aparecer completo. Depois: toque em **Missões**, feche; toque em **Biblioteca** (barra de baixo) e volte | TotalTime; o acampamento apareceu completo? houve tela vazia? |
| 3 | `central-internet-2` | igual ao 2 | igual |
| 4 | `central-internet-toques` | logo depois do comando de abrir, **toque no céu** (área vazia) cerca de 30 vezes em 10 segundos | apareceu "não está respondendo"? |
| 5 | `central-aviao-1` | **ligue o modo avião** (o cabo continua funcionando). Espere o acampamento; toque em **Missões** e feche | algo diferente com o modo avião? |
| 6 | `central-aviao-2` | igual ao 5 | igual |
| 7 | `central-aviao-toques` | em modo avião, igual ao 4 | apareceu o aviso? |
| 8 | `segundo-plano` | **desligue o modo avião**. Com a Central aberta, vá para a tela inicial do celular, espere 30 s e volte pelo botão de **apps recentes**; toque em **Missões** | a Central voltou normal? travou? |
| 9 | `qualidade-2d` | na Central: **engrenagem (canto superior direito) → "Qualidade gráfica do personagem" → "2D"**. Depois, na janela 2, grave o rótulo e feche e abra de novo. Espere a Central; toque em **Missões** e feche | TotalTime; a Central 2D abriu mais rápido? |
| 10 | `qualidade-2d-toques` | ainda em 2D, igual ao 4 | apareceu o aviso? |
| — | — | **volte a qualidade gráfica para "Automática"** | — |
| 11 (grupo D) | `persistencia` | reinicie o celular; depois de ligar, rode de novo o `adb logcat` (janela 1, **arquivo novo**: `registro-entrada-2.txt`) e abra o jogo | o progresso continuou? |
| 12 (grupo B) | `acessibilidade` | **TalkBack:** ligue (Configurações → Acessibilidade → TalkBack), tente chegar à Central e abrir uma fase; desligue. **Fonte grande:** Configurações → Tela → Tamanho da fonte e Tamanho da exibição no máximo; percorra boas-vindas, Central, uma fase, Biblioteca e Perfil; volte ao normal | onde o TalkBack não lê; textos cortados (com captura) |
| 13 (grupo C) | `telas` | se o aparelho permitir, troque a navegação entre **gestos** e **3 botões** (Configurações → Sistema → Gestos ou Navegação) e repita o 2 | algum botão encoberto? |
| 14 (grupo D) | `exportar` | Perfil → **Exportar meus dados** | o arquivo foi salvo? onde (pasta Downloads)? |

**Grupo A (compatibilidade):** repetir os cenários 1, 2, 5 e 9 num **aparelho com Android 7, 8 ou 9**, se houver. Anotar se abre, se fica em **tela branca** e qual é a versão do WebView.

**Se aparecer "Bible Quest isn't responding" / "não está respondendo":**
- toque em **"Aguardar"**, não em "Fechar";
- anote o cenário e quantos segundos o aviso ficou;
- tire uma **captura pelo celular** (**ligar + diminuir volume**).

**Tela branca, lentidão ou problema visual:** anote o cenário, o que apareceu e quanto tempo durou, e tire uma captura.

### 5.6 Terminar e enviar

1. Na **janela 1**, aperte **Ctrl + C** para parar a gravação.
2. Os arquivos ficam em `C:\platform-tools`:
   - `registro-entrada.txt` (e `registro-entrada-2.txt`, se houver);
   - os mesmos de cada aparelho.
3. Copie as **capturas** do celular: pasta **DCIM/Screenshots** ou **Imagens/Capturas de tela**, pelo cabo ou pelo Google Fotos.
4. Desinstale o build de diagnóstico:

   ```bash
   adb uninstall com.kzanntech.biblequest
   ```

5. Envie:
   - os arquivos `.txt`;
   - as capturas;
   - o **relatório da seção 7** preenchido.

## 6. Como os registros cobrem cada comparação pedida

| Comparação | Cenários | Medida no registro |
|---|---|---|
| Abertura inicial | 1 (e o `TotalTime` de todos) | `onCreate`; página iniciada; boas-vindas visível |
| Central 3D | 2 a 8 | Central visível; **cena pronta**; bloqueios entre esses dois momentos |
| Modo 2D | 9 e 10 | Central visível **sem 3D**; bloqueios só do WebView |
| Online × offline | 2 e 3 × 5 e 6 (e 4 × 7) | os mesmos tempos e bloqueios, com e sem internet |
| Primeiro × segundo plano | 2 × 8 | `onPause` e `onResume`; bloqueios depois da volta |
| Toques durante a inicialização | 4, 7 e 10 | eventos de toque (atraso e duração); ANR |
| ANR e bloqueios da thread principal | todos | `ANR in com.kzanntech.biblequest`; "thread principal bloqueada por N ms" (duração de cada bloqueio) |
| **WebView × cena 3D** | 2 a 7 (3D) × 9 e 10 (2D) | se os bloqueios aparecem também no 2D (WebView) ou só no 3D (cena) |

## 7. Modelo de relatório (preencher depois dos testes, um por aparelho)

```text
BIBLE QUEST — RELATÓRIO DE TESTE FÍSICO (0.17.9-diagnostico)

Aparelho: [entrada / intermediário / antigo]
Modelo:                         Android (versão):
Memória (MemTotal):             WebView (versão):
Animações do sistema: [ligadas / desligadas]     Bateria no início: ___%
Data e hora do teste:           Quem executou:
Arquivos enviados: registro-____.txt  (+ ____-2.txt?)   Capturas: ___

| # | Cenário                  | TotalTime (ms) | Acampamento completo? | Aviso "não está respondendo"? (seg.) | Observações |
|---|--------------------------|----------------|-----------------------|--------------------------------------|-------------|
| 1 | primeira-abertura        |                |                       |                                      |             |
| 2 | central-internet-1       |                |                       |                                      |             |
| 3 | central-internet-2       |                |                       |                                      |             |
| 4 | central-internet-toques  |                |                       |                                      |             |
| 5 | central-aviao-1          |                |                       |                                      |             |
| 6 | central-aviao-2          |                |                       |                                      |             |
| 7 | central-aviao-toques     |                |                       |                                      |             |
| 8 | segundo-plano            |                |                       |                                      |             |
| 9 | qualidade-2d             |                |      (2D)             |                                      |             |
|10 | qualidade-2d-toques      |                |      (2D)             |                                      |             |
|11 | persistencia             |  —             | progresso mantido? [sim/não]                                 |             |
|12 | acessibilidade           |  —             | TalkBack: ____  Fonte grande: ____                           |             |
|13 | telas                    |  —             | gestos/3 botões: ____                                        |             |
|14 | exportar                 |  —             | arquivo salvo em: ____                                       |             |

Tela branca? [não / sim: cenário __, duração __ s]
Lentidão perceptível? [onde]
Problemas visuais (com captura): 
Outras observações:
```

## 8. Checklist final por aparelho

**Antes de começar:**
- [ ] APK de diagnóstico **baixado** e copiado para `C:\platform-tools` (prazo de download: 01/12/2026, 12h39 em Brasília)
- [ ] Platform-Tools extraído; **Prompt de Comando** aberto na pasta (não o PowerShell)
- [ ] Celular carregado, no carregador, economia de bateria **desligada**
- [ ] Opções do desenvolvedor: **Depuração USB** e **Manter tela ativa** ligadas (no Xiaomi, também **Instalar via USB**)
- [ ] `adb devices` mostra `device`
- [ ] Bible Quest anterior **desinstalado**; `app-diagnostico.apk` instalado; versão `0.17.9-diagnostico` conferida
- [ ] Dados do aparelho anotados (modelo, Android, memória, WebView, animações)
- [ ] Janela 1 gravando o `registro-<aparelho>.txt`

**Durante:**
- [ ] Cenários 1 a 10 na ordem, **cada um com o rótulo**, e o `TotalTime` anotado
- [ ] Qualidade gráfica de volta para **Automática** depois do 10
- [ ] Cenários 11 a 14 (grupos B, C e D), quando possível
- [ ] Capturas de qualquer aviso, tela branca ou problema visual

**No fim:**
- [ ] **Ctrl + C** na janela 1
- [ ] Arquivos `.txt` e capturas separados
- [ ] Relatório da seção 7 preenchido
- [ ] Build de diagnóstico desinstalado
- [ ] Tudo enviado

| Aparelho | Perfil | Obrigatório? |
|---|---|---|
| Entrada | 2 a 3 GB de memória, Android 10 ou mais novo | **sim**: cenários 1 a 14 |
| Intermediário | 4 a 6 GB de memória, Android 12 ou mais novo | **sim**: cenários 1 a 14 |
| Antigo (grupo A) | Android 7, 8 ou 9 | **se houver**: cenários 1, 2, 5 e 9 e a versão do WebView |

## 9. Decisões para vocês

1. **Aprovar as correções de 1 a 12** e a **substituição das partes técnicas do roteiro** pelo guia simplificado (seção 5). Isso atualiza `ANDROID_TESTE_APARELHOS_FISICOS.md` e `.pdf`.
2. **Aprovar a correção P-ANL:** o analisador passa a ler UTF-16. Muda só a ferramenta, não o jogo nem o APK.
3. **Confirmar os grupos B, C e D** como cenários 11 a 14 do guia, e o grupo A num aparelho antigo, se houver.
4. **Confirmar se o APK será baixado antes de 01/12/2026, 12h39 (Brasília).** Se não for, autorizar que eu gere de novo o mesmo APK de diagnóstico.

Enquanto as correções não forem aprovadas, o roteiro atual **pode ser usado**, desde que se use o **Prompt de Comando** e não o PowerShell (correção 1).
