# Bible Quest — Roteiro de teste em aparelhos físicos (Android)

**Data:** 24/11/2026
**Objetivo:** confirmar ou descartar, em celulares de verdade, o travamento ao abrir o aplicativo (ANR) visto no emulador, e medir os tempos de abertura.
**Build usado:** APK temporário de diagnóstico `0.17.9-diagnostico`.
- **Não é o APK oficial**, que continua sem nenhuma instrumentação.
- **Não deve ser distribuído.** Use só nos aparelhos de teste e apague depois.

**Não é otimização:** nenhuma correção foi feita. O jogo, a cena e a versão oficial não mudaram.

## 0. Onde baixar o APK de diagnóstico

**Onde fica:** no artefato `bible-quest-0.17.9-diagnostico-NAO-DISTRIBUIR` do fluxo **"Aplicativo Android — diagnóstico da Central 3D"**, na aba Actions do GitHub. É preciso estar conectado ao GitHub.

**Validade:** o arquivo é apagado automaticamente **7 dias** depois da execução.

**Visibilidade:** o repositório é público, então quem estiver conectado ao GitHub e encontrar a execução também consegue baixar o artefato. O APK tem só o jogo, que já é público, e os registros de diagnóstico, sem segredos nem dados pessoais. Isso foi autorizado em 24/11/2026.

**Formato:** o download vem compactado em `.zip`. Dentro dele está o `app-diagnostico.apk`, que nos comandos abaixo aparece como `bible-quest-0.17.9-diagnostico.apk`.

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

## 2. Aparelhos

| | Aparelho de entrada | Aparelho intermediário |
|---|---|---|
| Perfil | 2 a 3 GB de memória, processador de entrada, Android 10 ou mais novo | 4 a 6 GB de memória, Android 12 ou mais novo |
| Exemplo de faixa | celulares de entrada atuais | celulares intermediários atuais |

Se tiver, vale testar também um aparelho com Android 7 a 9 (mínimo suportado: Android 7, API 24).

## 3. Preparação (uma vez por computador e por aparelho)

1. **No computador:** instale o *Android SDK Platform-Tools*, que traz o `adb` (download gratuito no site do Android para desenvolvedores). Confira com `adb version`.
2. **No celular:**
   - **Configurações → Sobre o telefone →** toque 7 vezes em **Número da versão**;
   - em seguida, **Configurações → Sistema → Opções do desenvolvedor →** ligue a **Depuração USB**.
3. **Ligue o cabo USB**, aceite a autorização no celular e confira se o aparelho aparece como `device`:

```bash
adb devices
```

4. **Deixe as animações do sistema como o dono do aparelho usa**, normalmente ligadas, e anote se estão ligadas ou não. Elas ficam em Opções do desenvolvedor, na escala de animação.

## 4. Instalação

**No Windows:** nos comandos abaixo, troque `grep versionName` por `findstr versionName` e tire o `| head -n 1`.

O APK de diagnóstico é assinado com outra chave. Se o Bible Quest oficial (de depuração) estiver instalado, desinstale antes:

```bash
adb uninstall com.kzanntech.biblequest
```

```bash
adb install bible-quest-0.17.9-diagnostico.apk
```

Confira se é o build de diagnóstico. Deve aparecer `versionName=0.17.9-diagnostico`:

```bash
adb shell dumpsys package com.kzanntech.biblequest | grep versionName
```

Anote os dados do aparelho:

```bash
adb shell getprop ro.product.model
```

```bash
adb shell getprop ro.build.version.release
```

```bash
adb shell cat /proc/meminfo | head -n 1
```

## 5. Coleta do registro

**Num terminal, limpe o registro e comece a gravar.** Deixe esse terminal aberto durante todo o teste:

```bash
adb logcat -c
```

```bash
adb logcat -v epoch BQDiag:V Capacitor/Console:V ActivityManager:V ActivityTaskManager:V *:S > registro-APARELHO.txt
```

Troque `APARELHO` por um nome curto, por exemplo `entrada` ou `intermediario`.

**Em outro terminal, rode os cenários da seção 6.** Antes de cada cenário, grave um rótulo no registro. Ele aparece na tabela final:

```bash
adb shell log -t BQDiag "cenario: NOME-DO-CENARIO"
```

**No fim,** pare a gravação com **Ctrl + C** no primeiro terminal e envie o arquivo `registro-APARELHO.txt` com as anotações da seção 7.

## 6. Cenários (na ordem)

Em cada abertura:
- feche o aplicativo antes, para medir a abertura completa;
- abra pelo comando abaixo, que também mostra o tempo de abertura medido pelo Android (`TotalTime`; anote o valor).

```bash
adb shell am force-stop com.kzanntech.biblequest
```

```bash
adb shell am start -W -n com.kzanntech.biblequest/.MainActivity
```

| # | Rótulo (`cenario: …`) | O que fazer | Mede |
|---|---|---|---|
| 1 | `primeira-abertura` | logo depois de instalar: feche e abra; espere a tela de boas-vindas; crie um perfil de teste e o personagem até chegar à Central; espere o acampamento 3D aparecer | abertura até as boas-vindas; primeira Central |
| 2 | `central-internet-1` | com internet (Wi-Fi ligado): feche e abra; **não toque** até o acampamento 3D aparecer; depois toque em **Missões**, feche, toque em **Biblioteca** e volte | abertura da Central; cena 3D pronta; resposta aos toques |
| 3 | `central-internet-2` | repita o 2 | repetição |
| 4 | `central-internet-toques` | com internet: feche e abra e **toque na tela 3 vezes por segundo nos primeiros 10 segundos** (em áreas vazias) | se os toques durante o carregamento provocam o aviso "não está respondendo" |
| 5 | `central-aviao-1` | ligue o **modo avião**: feche e abra; espere o acampamento; toque em **Missões** e feche | comportamento sem internet |
| 6 | `central-aviao-2` | repita o 5, ainda em modo avião | repetição |
| 7 | `central-aviao-toques` | em modo avião: repita o 4 | toques durante o carregamento, sem internet |
| 8 | `segundo-plano` | desligue o modo avião; com a Central aberta, vá para a tela inicial do celular, espere 30 s e volte pelo botão de apps recentes; toque em **Missões** | volta do segundo plano |
| 9 | `qualidade-2d` | **Configurações → Qualidade gráfica → 2D**; feche e abra; espere a Central; toque em **Missões** e feche | separa a inicialização do WebView da criação da cena 3D: no 2D não há 3D |
| 10 | `qualidade-2d-toques` | com o 2D: repita o 4 | toques durante a abertura, sem 3D |

**Depois do cenário 10,** volte a qualidade gráfica para **Automática**.

**Se aparecer "Bible Quest isn't responding" / "não está respondendo":**
- **não feche o aviso pelo botão "Fechar app"**; toque em **Aguardar**;
- anote o cenário e quantos segundos o aviso ficou na tela;
- se possível, tire uma captura (`adb exec-out screencap -p > anr.png`).

## 7. O que anotar à mão

| Item | Aparelho de entrada | Aparelho intermediário |
|---|---|---|
| Modelo, versão do Android, memória | | |
| Animações do sistema (ligadas ou desligadas) | | |
| `TotalTime` do `am start -W` em cada cenário (ms) | | |
| Viu o aviso "não está respondendo"? Em quais cenários? | | |
| A tela ficou travada sem o aviso? Quanto tempo? | | |
| O acampamento 3D apareceu completo? Alguma tela vazia? | | |
| Algo diferente em modo avião? | | |

## 8. Análise do registro

Com o arquivo recebido, a análise é feita com:

```bash
node tools/android/diagnostico/analisar-logcat.cjs registro-entrada.txt "Aparelho de entrada"
```

Ela gera uma tabela por abertura (rótulo do cenário), com os tempos medidos desde o início do processo:

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

## 9. Tabela comparativa (para preencher com os resultados)

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

## 10. Se o ANR se confirmar

O diagnóstico será separado em duas partes, comparando os cenários de 3D (2 a 7) com os de 2D (9 e 10):

1. **Inicialização do WebView:**
   - travamentos que aparecem **também no 2D**, entre o início do processo e a "página iniciada" ou as boas-vindas;
   - no emulador, o WebView sozinho, sem 3D, já travava de 3,4 a 4,9 s.
2. **Criação da cena 3D:**
   - travamentos que **só aparecem no 3D**, entre "Central visível" e "cena pronta";
   - no emulador, eles somavam alguns segundos ao travamento da abertura.

**Nenhuma correção será recomendada antes dos resultados físicos.**

## 11. Depois do teste

Desinstale o build de diagnóstico e, se quiser, reinstale o oficial:

```bash
adb uninstall com.kzanntech.biblequest
```
