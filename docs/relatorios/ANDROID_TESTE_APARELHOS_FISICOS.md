# Bible Quest — Roteiro de teste em aparelhos físicos (Android)

**Data:** 24/11/2026. **Atualizado no mesmo dia** com as correções aprovadas, entre elas o guia simplificado para o Prompt de Comando do Windows (`PRONTIDAO_TESTES_FISICOS_ANDROID.md`).
**Objetivo:** confirmar ou descartar, em celulares de verdade, o travamento ao abrir o aplicativo (ANR) visto no emulador, e medir os tempos de abertura.
**Build usado:** APK temporário de diagnóstico `0.17.9-diagnostico`.
- **Não é o APK oficial**, que continua sem nenhuma instrumentação.
- **Não deve ser distribuído.** Use só nos aparelhos de teste e apague depois.

**Não é otimização:** nenhuma correção foi feita. O jogo, a cena e a versão oficial não mudaram.

> ### ⚠️ Use o **Prompt de Comando** do Windows
> **Não use o PowerShell nem o Windows Terminal** para gravar o registro deste procedimento.
>
> **Como abrir o Prompt de Comando:**
> 1. abra a pasta do `adb` no Explorador de Arquivos;
> 2. clique na barra de endereço;
> 3. digite `cmd` e aperte Enter.
>
> Todos os comandos deste roteiro foram escritos para o Prompt de Comando.

## 0. Onde baixar o APK de diagnóstico

**Onde fica:** no artefato `bible-quest-0.17.9-diagnostico-NAO-DISTRIBUIR` do fluxo **"Aplicativo Android — diagnóstico da Central 3D"**, na aba Actions do GitHub. É preciso estar conectado ao GitHub. Link: https://github.com/theuzxl13-oss/Bible-Quest/actions/runs/45423371828/artifacts/14936504425

**Validade:** o link vale até **01/12/2026, 15h39 (UTC), 12h39 em Brasília**. **Depois de baixado, o arquivo continua funcionando**, mesmo após essa data.

**Formato:** o download vem compactado em `.zip`. Dentro dele está o **`app-diagnostico.apk`**, que é o nome usado em todos os comandos deste roteiro.

**Visibilidade:** o repositório é público, então quem estiver conectado ao GitHub e encontrar a execução também consegue baixar o artefato. O APK tem só o jogo e os registros de diagnóstico, sem segredos nem dados pessoais. Isso foi autorizado em 24/11/2026.

## 1. O que o APK de diagnóstico registra

Tudo vai para o `adb logcat`, com a etiqueta `BQDiag`.

**Do lado do Android:**
- início do processo e `onCreate`;
- quando o aplicativo vai para o segundo plano e quando volta (`onPause`, `onResume`, foco da janela);
- **cada vez que a thread principal fica 0,5 s ou mais sem responder**, com a duração.

**Do lado do jogo:**
- página iniciada;
- **tela de boas-vindas visível**;
- **Central visível**;
- **cena 3D pronta**;
- **tempo de resposta de cada toque**: o atraso até o jogo começar a tratar e a duração até o quadro seguinte;
- quadros atrasados.

**ANR:** fica no próprio registro do Android (`ActivityManager: ANR in com.kzanntech.biblequest`).

O jogo, os dados e a aparência são os mesmos da versão oficial.

## 2. Aparelhos e cenários

| Aparelho | Perfil | Cenários |
|---|---|---|
| **Entrada** | 2 a 3 GB de memória, Android 10 ou mais novo | **1 a 10 obrigatórios**; 11 a 14 complementares |
| **Intermediário** | 4 a 6 GB de memória, Android 12 ou mais novo | **1 a 10 obrigatórios**; 11 a 14 complementares |
| **Antigo** (opcional) | Android 7, 8 ou 9, se houver | 1, 2, 5 e 9, e a versão do WebView |

**Prioridade: o ANR.**
- Os cenários **1 a 10** investigam o ANR e são **obrigatórios**.
- Os cenários **11 a 14** são **complementares**: recomendados quando houver tempo e o aparelho permitir. **Não devem atrasar** os cenários 1 a 10.
- O aparelho antigo é **opcional**.

**Tempo:** cerca de 60 a 75 minutos por aparelho, contando os complementares.

## 3. No CELULAR: preparar (uma vez)

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

## 4. No COMPUTADOR Windows: preparar (uma vez)

1. **Baixe o Android SDK Platform-Tools para Windows** (site oficial do Android para desenvolvedores) e **extraia** o `.zip`, por exemplo em `C:\platform-tools`.
2. **Baixe o APK de diagnóstico** pelo link do artefato, conectado ao GitHub:
   - extraia o `.zip`;
   - copie o **`app-diagnostico.apk`** para dentro de `C:\platform-tools`.
3. **Abra o Prompt de Comando dentro dessa pasta:**
   - abra a pasta no Explorador de Arquivos;
   - clique na barra de endereço;
   - digite **`cmd`** e aperte Enter.

   **Não use o PowerShell nem o Windows Terminal**: neles, o registro é gravado em outro formato (UTF-16). O procedimento deste roteiro é **só pelo Prompt de Comando**.
4. **Ligue o celular** com o cabo USB de dados. No celular, aceite **"Permitir depuração USB?"**, marcando "Sempre permitir".
5. **No Prompt de Comando, confira a conexão** com o comando abaixo. Deve aparecer uma linha terminando em `device`:

   ```bash
   adb devices
   ```

   Se aparecer vazio ou `unauthorized`, veja a seção 9 (Problemas comuns).

## 5. Instalar (no computador, com o celular ligado ao cabo)

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

## 6. Gravar o registro (no computador, Prompt de Comando)

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

## 7. Cenários

**Obrigatórios: 1 a 10. Complementares: 11 a 14.**

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
| 11 (complementar, grupo D) | `persistencia` | reinicie o celular; depois de ligar, rode de novo o `adb logcat` (janela 1, **arquivo novo**: `registro-entrada-2.txt`) e abra o jogo | o progresso continuou? |
| 12 (complementar, grupo B) | `acessibilidade` | **TalkBack:** ligue (Configurações → Acessibilidade → TalkBack), tente chegar à Central e abrir uma fase; desligue. **Fonte grande:** Configurações → Tela → Tamanho da fonte e Tamanho da exibição no máximo; percorra boas-vindas, Central, uma fase, Biblioteca e Perfil; volte ao normal | onde o TalkBack não lê; textos cortados (com captura) |
| 13 (complementar, grupo C) | `telas` | se o aparelho permitir, troque a navegação entre **gestos** e **3 botões** (Configurações → Sistema → Gestos ou Navegação) e repita o 2 | algum botão encoberto? |
| 14 (complementar, grupo D) | `exportar` | Perfil → **Exportar meus dados** | o arquivo foi salvo? onde (pasta Downloads)? |

**Grupo A (compatibilidade, opcional):** repetir os cenários 1, 2, 5 e 9 num **aparelho com Android 7, 8 ou 9**, se houver. Anotar se abre, se fica em **tela branca** e qual é a versão do WebView.

**Se aparecer "Bible Quest isn't responding" / "não está respondendo":**
- toque em **"Aguardar"**, não em "Fechar";
- anote o cenário e quantos segundos o aviso ficou;
- tire uma **captura pelo celular** (**ligar + diminuir volume**).

**Tela branca, lentidão ou problema visual:** anote o cenário, o que apareceu e quanto tempo durou, e tire uma captura.

## 8. Terminar e enviar

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
   - o **relatório da seção 11** preenchido.

## 9. Problemas comuns

| Dificuldade | Como contornar |
|---|---|
| A pessoa não conhece o `adb` | Seções 3 a 8 deste roteiro, com os comandos prontos para copiar e colar. A sessão leva cerca de 60 a 75 minutos por aparelho |
| Driver USB ou autorização ("unauthorized") | Instalar o driver do fabricante; aceitar "Permitir depuração USB" no celular, marcando "Sempre permitir neste computador" |
| O cabo desconecta no meio do teste | O registro **para de gravar**. Reconectar e iniciar um **novo arquivo** (por exemplo, `registro-entrada-2.txt`), repetindo o cenário interrompido. Os dois arquivos são enviados |
| O APK vence antes do teste | Baixar **já**; o arquivo baixado continua valendo. Se o download não for feito a tempo, gero o mesmo APK de novo, com autorização |
| Aparelho com Android 7 a 9 | Pode não abrir (tela branca) por causa de um WebView antigo. **Esse é justamente o resultado que precisamos registrar**, com a versão do WebView |
| Xiaomi e Redmi | Exigem "Instalar via USB" (conta Mi e chip) além da depuração USB |
| Toques durante a abertura (cenários 4, 7 e 10) | Combinar o ritmo: cerca de 30 toques em 10 segundos, em áreas **vazias** (céu), para não abrir outras telas |

## 10. Checklist por aparelho

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
- [ ] Cenários 11 a 14 (complementares), **só se houver tempo**, sem atrasar os cenários 1 a 10
- [ ] Capturas de qualquer aviso, tela branca ou problema visual

**No fim:**
- [ ] **Ctrl + C** na janela 1
- [ ] Arquivos `.txt` e capturas separados
- [ ] Relatório da seção 11 preenchido
- [ ] Build de diagnóstico desinstalado
- [ ] Tudo enviado

| Aparelho | Perfil | Obrigatório? |
|---|---|---|
| Entrada | 2 a 3 GB de memória, Android 10 ou mais novo | **sim**: cenários 1 a 10 obrigatórios; 11 a 14 recomendados |
| Intermediário | 4 a 6 GB de memória, Android 12 ou mais novo | **sim**: cenários 1 a 10 obrigatórios; 11 a 14 recomendados |
| Antigo (grupo A) | Android 7, 8 ou 9 | **opcional**, se houver: cenários 1, 2, 5 e 9 e a versão do WebView |

## 11. Modelo de relatório (preencher depois dos testes, um por aparelho)

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

## 12. Como os registros cobrem cada comparação

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

## 13. Análise do registro (feita por quem recebe os arquivos)

Com o arquivo recebido, a análise é feita com:

```bash
node tools/android/diagnostico/analisar-logcat.cjs registro-entrada.txt "Aparelho de entrada"
```

A codificação do arquivo é detectada automaticamente: UTF-8, que é o que o Prompt de Comando grava, e UTF-16, se o PowerShell tiver sido usado por engano. Ela gera uma tabela por abertura (rótulo do cenário), com os tempos medidos desde o início do processo:

| Medida | Origem no registro |
|---|---|
| Abertura até a primeira tela do Android | `TotalTime` do `am start -W` (anotado) |
| `onCreate` | `BQDiag onCreate` |
| Página iniciada | `BQDiag\|página iniciada` |
| Abertura até as boas-vindas | `BQDiag\|tela de boas-vindas visível` |
| Abertura da Central | `BQDiag\|Central visível` |
| Cena 3D pronta | `BQDiag\|cena pronta` |
| Travamentos | `BQDiag ... thread principal bloqueada por N ms` (quantidade, maior, soma) |
| ANR | `ActivityManager: ANR in com.kzanntech.biblequest` |
| Resposta aos toques | `BQDiag\|toque` (maior duração e maior atraso) |
| Volta do segundo plano | `onPause` e `onResume` |

**Referência:** o mesmo analisador roda no emulador do GitHub Actions a cada execução do fluxo de diagnóstico. O resultado fica em `evidencias/android-diagnostico-central/tabela-emulador.md`.

## 14. Tabela comparativa (para preencher com os resultados)

| Medida | Emulador (referência) | Aparelho de entrada | Aparelho intermediário |
|---|---|---|---|
| Abertura até as boas-vindas | ver `tabela-emulador.md` | | |
| Abertura da Central (com internet) | | | |
| Cena 3D pronta (com internet) | | | |
| Cena 3D pronta (modo avião) | | | |
| Maior travamento ao abrir (3D) | 5,2 a 9,3 s | | |
| Maior travamento ao abrir (2D, cenário 9) | — | | |
| ANR com toques durante a abertura (3D) | em 5 de 15 aberturas | | |
| ANR com toques durante a abertura (2D) | — | | |
| Maior atraso de resposta a um toque | | | |
| Volta do segundo plano: travamento? | | | |
| Diferença entre internet e modo avião | não houve | | |

## 15. Se o ANR se confirmar

O diagnóstico será separado em duas partes, comparando os cenários de 3D (2 a 7) com os de 2D (9 e 10):

1. **Inicialização do WebView:**
   - travamentos que aparecem **também no 2D**, entre o início do processo e a "página iniciada" ou as boas-vindas;
   - no emulador, o WebView sozinho, sem 3D, já travava de 3,4 a 4,9 s.
2. **Criação da cena 3D:**
   - travamentos que **só aparecem no 3D**, entre "Central visível" e "cena pronta";
   - no emulador, eles somavam alguns segundos ao travamento da abertura.

**Nenhuma correção será recomendada antes dos resultados físicos.**
