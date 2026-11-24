# Bible Quest — Teste físico Android: Moto G75 5G

**Relatório técnico sanitizado** · build `0.17.9-diagnostico` · teste em 24/11/2026, das 19:58 às 20:27 · análise em 24/11/2026

> **Sobre a evidência.** O registro original (`registro-entrada.txt`, logcat de 2.145 linhas, 378.864 bytes, UTF-8) foi analisado na íntegra, **em modo privado**, e **não foi publicado**. Ele traz também linhas do sistema sobre outros aplicativos do aparelho, e essas linhas revelam o perfil de uso do dono. O arquivo foi preservado sem nenhuma alteração. Impressão digital SHA-256, conferida antes e depois da análise:
> `d35392a9aa165ca21ee9148520f3be093135862f43a4f3ed76472a72df325e3f`
> Este relatório cita **somente** linhas do Bible Quest (`com.kzanntech.biblequest` e a etiqueta `BQDiag`). Não traz nomes de outros aplicativos, dados pessoais nem informações de uso do aparelho.

## 1. Resumo

| Pergunta | Resposta |
|---|---|
| Houve ANR ("o aplicativo não está respondendo")? | **Não.** Foram 11 aberturas, com 0 ANR, contra 5 em 15 no emulador. |
| O aplicativo travou ou fechou sozinho? | **Não.** Nenhum encerramento inesperado. Todas as mortes de processo foram pedidas pelo testador. |
| Maior bloqueio da thread principal | **1,6 s.** O limite do ANR é 5 s. No emulador, os bloqueios foram de 5 a 9 s. |
| Abertura a frio (processo novo) | A tela do Android apareceu entre **0,93 e 1,38 s**. A página iniciou em 0,7 s. A Central ficou visível entre 0,8 e 2,9 s e o acampamento 3D ficou pronto entre 2,6 e 3,4 s. |
| Internet × modo offline × modo avião | **Sem diferença** nos tempos. |
| Segundo plano | **Correto.** O sistema congelou o processo e o descongelou na volta. A Central voltou sem recriar a atividade, mesmo depois de 5 minutos fora. |
| Problemas encontrados | Três problemas leves de fluidez (§ 6), nenhum crítico. |

**Conclusão:** neste aparelho, o ANR investigado no emulador **não se reproduziu**. Os bloqueios existem, mas são de 4 a 6 vezes menores. Ainda assim, há um custo perceptível de cerca de 1 a 1,6 s na abertura e ao voltar para a Central.

## 2. Aparelho e condições

| Item | Valor |
|---|---|
| Aparelho | Motorola moto g75 5G |
| Sistema | Android 16 |
| WebView | Chrome WebView 157.0.8103.50 |
| Aplicativo | Bible Quest `0.17.9-diagnostico` (APK de diagnóstico do CI) |
| Coleta | `adb logcat -v epoch BQDiag:V Capacitor/Console:V ActivityManager:V ActivityTaskManager:V *:S` pelo Prompt de Comando |
| Horários | Relógio do aparelho, horário de Brasília (UTC−3, presumido) |
| Tela da página | 320 × 627 px CSS |

## 3. Cenários executados

Os rótulos são os que o testador gravou com `adb shell log -t BQDiag "cenario: …"`. "Abertura a frio" é o processo encerrado com `force-stop` e iniciado de novo.

| # | Horário | Rótulo no registro | Cenário do roteiro | O que aconteceu |
|---|---|---|---|---|
| 1 | 19:58:48 | `primeira-abertura` | 1 | Abertura a frio. O app iniciou **sem estar em primeiro plano** e só ficou visível 7 s depois (ver § 5.2). |
| 2 | 19:59:42 | `primeira-abertura-repeticao` | (extra) | Abertura a frio e exploração livre: 143 toques e 14 entradas e saídas da Central. |
| — | 20:03–20:04 | `internet` (×3), `modo-offline` | (marcas) | Só marcas de tempo, sem nova abertura. O app seguia aberto. |
| 3 | 20:05:08 | `central-internet-1` | 2 | Abertura a frio. Houve toques durante a carga e a saída da Central em 2,4 s, antes de o 3D ficar pronto. |
| 4 | 20:06:05 | `central-internet-2` | 3 | Abertura a frio. O app foi para o segundo plano em 4,8 s. |
| — | 20:06:43 | `central-offline-1` | 5 (preparo) | Volta do segundo plano, sem abertura nova. |
| 5 | 20:07:00 | `central-offline-1` | 5 | Abertura a frio, sem rede. |
| 6 | 20:08:32 | `central-internet-toques` | 4 | Abertura a frio. Os toques começaram só em 20 s, e não logo ao abrir (ver § 7). |
| — | 20:09:26 | `segundo-plano` | 8 | Ida ao segundo plano por 17 s e volta. |
| 7 | 20:10:16 | `central-aviao-1` | 5 | Abertura a frio em modo avião. Aos 51 s, a qualidade foi trocada para **2D**. |
| 8 | 20:11:29 | `central-2d` | 9 | Abertura a frio já em 2D. Depois, 5 min em segundo plano. |
| 9 | 20:18:44 | `central-2d-internet` | (extra) | Abertura a frio em 2D. Depois, a qualidade voltou a **automática** (3D). |
| 10 | 20:22:14 | `central-automatico-final` | (extra) | Abertura a frio, de novo sem estar em primeiro plano. Ficou visível em 14,5 s. Às 20:23:10, o app foi removido dos recentes. |
| 11 | 20:23:41 | `central-automatico-final` | (extra) | Abertura a frio. Depois, três idas e voltas ao segundo plano até 20:27:29. |

**Não executados:** os cenários 6 (`central-aviao-2`), 7 (`central-aviao-toques`) e 10 (`qualidade-2d-toques`) do roteiro, e os complementares 11 a 14 (reinício, acessibilidade, navegação por gestos, exportação). Neste registro não há evidência deles.

## 4. Resultados por abertura

Os tempos contam a partir do início do processo do aplicativo. O relógio é o do aparelho.

| # | Cenário | onCreate | Tela exibida (Android) | Página iniciada | Central visível | Acampamento 3D pronto | Bloqueios ≥ 0,5 s (qtd · maior · soma) | ANR | Toques (qtd · maior duração · maior atraso) | Retornos do 2º plano |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | primeira-abertura | 1,3 s | — ¹ | 2,2 s | 9,1 s ¹ | 6,9 s ¹ | 1 · 1,0 s · 1,0 s | 0 | nenhum | 1 |
| 2 | primeira-abertura-repeticao | 0,4 s | +1,04 s | 0,8 s | 0,9 s | 3,0 s | 1 · 1,0 s · 1,0 s | 0 | 143 · 496 ms · 201 ms | 0 |
| 3 | central-internet-1 | 0,4 s | +0,98 s | 0,7 s | 0,9 s | — ² | 1 · 1,0 s · 1,0 s | 0 | 3 · **1.160 ms** · **1.132 ms** | 0 |
| 4 | central-internet-2 | 0,4 s | +1,04 s | 0,7 s | 2,7 s | 3,0 s | 1 · 0,6 s · 0,6 s | 0 | nenhum | 1 |
| 5 | central-offline-1 | 0,5 s | +1,11 s | 0,8 s | 2,9 s | 3,2 s | 1 · 0,6 s · 0,6 s | 0 | nenhum | 0 |
| 6 | central-internet-toques | 0,4 s | +0,98 s | 0,7 s | 0,9 s | 3,0 s | 2 · 1,0 s · 1,5 s | 0 | 28 · 552 ms · 544 ms | 1 |
| 7 | central-aviao-1 | 0,5 s | +1,07 s | 0,7 s | 2,8 s | 3,0 s | 1 · 0,7 s · 0,7 s | 0 | 8 · 56 ms · 25 ms | 0 |
| 8 | central-2d | 0,4 s | +0,93 s | 0,7 s | 0,8 s | (2D) | 2 · 1,4 s · 2,2 s | 0 | 7 · 96 ms · 60 ms | 1 |
| 9 | central-2d-internet | 0,4 s | +0,96 s | 0,7 s | 0,8 s | (2D) ³ | 1 · 1,6 s · 1,6 s | 0 | 7 · 104 ms · 103 ms | 1 |
| 10 | central-automatico-final | 1,3 s | — ¹ | 2,2 s | 16,3 s ¹ | 6,8 s ¹ | 1 · 0,8 s · 0,8 s | 0 | 2 · **984 ms** · **927 ms** | 1 |
| 11 | central-automatico-final | 0,6 s | +1,38 s | 1,1 s | 2,9 s | 3,4 s | 1 · 1,1 s · 1,1 s | 0 | nenhum | 3 |

Notas da tabela:
- **¹** O app iniciou fora do primeiro plano (§ 5.2). "Central visível" só é registrada quando a página fica visível, por isso inclui a espera de 7 s e de 14,5 s. O 3D ficou pronto antes de a tela aparecer. Os valores não medem lentidão do jogo.
- **²** O testador saiu da Central em 2,4 s, antes de o 3D terminar.
- **³** O analisador mostra 146,0 s nessa abertura. Esse é o momento em que a qualidade voltou para "automática" e o 3D foi criado (+0,6 s depois da troca). Não é uma espera de 146 s.
- **"Tela exibida (Android)"** é a linha `Displayed com.kzanntech.biblequest/.MainActivity: +…` do próprio sistema, contada a partir do pedido de abertura.

Mediana das aberturas a frio normais (nº 2 a 9 e 11):
- onCreate: **0,4 s**
- página iniciada: **0,7 s**
- acampamento 3D pronto: **3,0 s**
- maior bloqueio: **1,0 s**

## 5. Análise por tema

### 5.1 ANR e bloqueios da thread principal

- **Nenhum ANR.** Não há nenhuma linha `ANR in com.kzanntech.biblequest` no registro.
- Em cada abertura a frio houve **um bloqueio de 0,56 a 1,64 s**, perto de 1,5 a 2,5 s do início do processo. Ele coincide com a **primeira tarefa longa de JavaScript**, de 1,0 a 1,6 s, que começa cerca de 0,5 s depois da página. Exemplo da abertura 2: tarefa de 1.492 ms, iniciada em 482 ms, e vigia acusando 994 ms às 19:59:44.5.
- O bloqueio **também acontece no modo 2D**, sem nenhuma cena 3D: foram 1.395 ms e 1.641 ms. O custo vem principalmente da inicialização da WebView e do primeiro desenho da página, não só do Three.js. É o mesmo padrão do emulador, onde a WebView sozinha bloqueou de 3,4 a 4,9 s, mas aqui ele é cerca de 3 vezes menor.
- Fora da abertura, só houve dois bloqueios:
  - 509 ms às 20:08:56, na abertura 6, quando o 3D foi recriado depois de voltar à Central;
  - 829 ms às 20:12:04, na abertura 8, em 2D.

### 5.2 Falhas de inicialização

- **Nenhuma falha.** As 11 aberturas chegaram à Central.
- **Aberturas 1 e 10:** o sistema registrou, só para o Bible Quest, `Activity pause timeout` e `Activity top resumed state loss timeout`. O app recebeu `onPause` 0,1 s depois de `onResume`, e a visibilidade só voltou 7,4 s e 14,5 s depois (`onResume` seguido de `foco da janela=true`).
  - Nos dois casos, a página carregou e o 3D ficou pronto em segundo plano: 5,6 s de página, mais lento porque o app não estava visível.
  - A Central apareceu **0,3 s** depois de o app vir para a frente.
  - O padrão é compatível com o comando de abertura enviado com a **tela do celular bloqueada ou coberta**. Isso é condição do procedimento, não defeito do jogo. Fica a recomendação de deixar a tela desbloqueada antes de cada abertura.
- Às 20:08:00 houve um comando de abertura com o nome da atividade digitado errado (`.MainActivityadb`). Ele não teve efeito, e a abertura correta veio às 20:08:32.

### 5.3 WebView

- O processo isolado da WebView (`SandboxedProcessService0`) foi criado de 0,3 a 0,9 s depois do processo do app em todas as aberturas.
- O processo isolado só morreu uma vez, às 20:23:10. O sistema registrou `Scheduling restart of crashed service … SandboxedProcessService0`, logo depois de `Killing … com.kzanntech.biblequest … remove task`. Ou seja, o app foi **removido da lista de recentes** pelo testador, e a WebView foi encerrada junto. Não é uma queda da WebView.
- A página nunca foi recarregada sozinha: houve um `página iniciada` por abertura (11 no total). Também não houve `pageshow` com `persisted=true` nem nenhum erro de JavaScript.
- As 44 mensagens de console que não são de diagnóstico são todas do nível informativo: `[object Object]` ×22, `undefined` ×11 e `{"canGoBack":true}` ×11. Elas vêm da ponte do Capacitor (botão voltar e afins). São inofensivas, mas poluem o registro.

### 5.4 Cena 3D da Central (remontagens)

- O motivo das remontagens vistas no emulador, `prefers-reduced-motion` mudando de valor, **não apareceu no aparelho**: o valor foi `false` em todas as leituras.
- O efeito da cena executou de novo até a execução nº 15 na abertura 2 e até a nº 7 na abertura 6. Cada nova execução veio em par com uma "limpeza", com **motivo vazio** e valores idênticos antes e depois.
- Entre a limpeza e a nova execução passaram de 0,6 a 62 s, e houve toques e canvases de outras telas nesse intervalo. Isso corresponde a **sair da Central e voltar** (o componente é desmontado e montado de novo), não a uma remontagem espontânea. Por isso, *remontagem espontânea da cena* **não foi identificada**.
- As únicas mudanças reais de valor foram as trocas de qualidade feitas pelo testador:
  - `alta → 2d` às 20:11:07;
  - `2d → alta` às 20:21:09, com o 3D pronto em 0,6 s.
- Cada volta à Central recria a cena 3D, com uma tarefa longa de **0,4 a 0,9 s**. Ver o problema P2 em § 6.

### 5.5 Toques e resposta à interação

| Medida | Valor |
|---|---|
| Eventos de toque medidos | 198 (78 `pointerdown`, 62 `pointerup`, 58 `click`) |
| Duração até o próximo quadro: mediana · p90 · p95 · máximo | 40 ms · 128 ms · 432 ms · **1.160 ms** |
| Eventos acima de 200 ms | 17 (8,6 %) |

Os toques lentos se concentram em dois momentos:

1. **Toques durante a abertura.**
   - Abertura 3, a 2,2 s do início: 1.160 ms, com 1.132 ms de espera antes de o jogo começar a tratar.
   - Abertura 10, a 16,2 s, logo que a tela apareceu: 984 ms, com 927 ms de espera.
   - Em ambos, o toque chegou durante o bloqueio inicial de cerca de 1 s.
2. **Toques logo depois de voltar à Central.**
   - Até 552 ms (abertura 6), de 432 a 496 ms (abertura 2).
   - Eles coincidem com a recriação da cena 3D.

Fora desses momentos, a resposta é boa: a mediana é de 40 ms.

### 5.6 Internet, offline e modo avião

| Condição | Aberturas | Página iniciada | Central visível | 3D pronto |
|---|---|---|---|---|
| Wi-Fi ligado | 2, 3, 4, 6, 9, 11 | 0,7 a 1,1 s | 0,8 a 2,9 s | 3,0 a 3,4 s |
| Sem rede / modo avião | 5, 7 | 0,7 a 0,8 s | 2,8 a 2,9 s | 3,0 a 3,2 s |

**Sem diferença mensurável.** O jogo não depende da rede para abrir.

### 5.7 Segundo plano

| Ida | Tempo fora | O que o sistema fez | Volta |
|---|---|---|---|
| Abertura 4, 20:06:10 | 37 s | — | `onResume` sem `onCreate`; página `visible` |
| Abertura 6, 20:09:26 (`segundo-plano`) | 17 s | Processo **congelado** pelo gerenciador de energia do sistema 10,5 s depois de sair, e **descongelado** na volta | `onResume`; 3D recriado em 0,8 s |
| Abertura 8, 20:13:22 | **5 min 9 s** | — | `onResume`; Central 2D intacta |
| Abertura 9, 20:19:31 | 1 min 32 s | — | `onResume` |
| Abertura 11, três vezes | 10 s · 65 s · 21 s | Congelado e descongelado na última | `onResume` em todas |

- Em nenhuma volta houve recriação da atividade (`onCreate`), recarga da página ou ANR.
- Os "quadros atrasados" enormes nessas horas (16 s, 36 s, 92 s e 308 s) são o tempo em que a página ficou oculta. O navegador suspende o desenho nesse período, então não são travamentos.

### 5.8 Linhas do sistema sobre o Bible Quest

Foram 104 linhas, todas classificadas:

| Tipo | Qtd | Interpretação |
|---|---|---|
| `START … MainActivity` | 12 | Pedidos de abertura pelo `adb` (um com nome errado, sem efeito) |
| `Start proc … com.kzanntech.biblequest` | 11 | Processo do app criado (uma vez por abertura a frio) |
| `Start proc … SandboxedProcessService0 … for {com.kzanntech.biblequest…}` | 11 | Processo isolado da WebView do app |
| `Displayed … MainActivity: +926 ms … +1377 ms` | 9 | Tempo do sistema até a primeira tela |
| `animate false … onSplashScreenAttachComplete` | 9 | Fim da tela de abertura (splash) |
| `Force stopping` | 11 | Encerramentos pedidos pelo testador (`force-stop`); 2 com o processo já parado |
| `Killing … stop com.kzanntech.biblequest`, `Force removing … app died, no saved state` e `Got obituary` | 9 + 9 + 9 | Consequência dos `force-stop` acima |
| `Killing … remove task` e `appDiedLocked … isKilledByAm=true` | 1 + 1 | App removido dos recentes |
| `Scheduling restart of crashed service … SandboxedProcessService0` | 1 | Efeito colateral do item acima |
| `freezing` / `unfreezing` e `sync unfroze` | 3 / 2 + 2 | Congelamento normal em segundo plano |
| `pause timeout` / `top resumed state loss timeout` | 2 + 2 | Aberturas 1 e 10, feitas fora do primeiro plano (§ 5.2) |
| `ANR in`, `crash` do app, `has died` inesperado | **0** | — |

## 6. Problemas encontrados

| # | Problema | Gravidade | Evidência | Situação |
|---|---|---|---|---|
| P1 | **Bloqueio de 0,6 a 1,6 s na abertura**, também no 2D (WebView e primeiro desenho) | Leve | 11 de 11 aberturas; tarefa longa de JS de 1,0 a 1,6 s; toques durante a abertura esperam até 1,1 s | Bem abaixo do ANR (5 s); já previsto na etapa 6 de desempenho |
| P2 | **Recriação da cena 3D a cada volta à Central** (de 0,4 a 0,9 s de tarefa longa) | Leve | 20 recriações nas aberturas 2 e 6; toques até 552 ms | Candidato a manter a cena viva ou adiar a criação; sem mudança agora |
| P3 | **Mensagens de console sem conteúdo** (`[object Object]`, `undefined`) | Cosmético | 44 linhas | Só polui o registro; nenhum efeito no jogo |

## 7. Problemas não identificados

- ANR (0 em 11 aberturas).
- Encerramento inesperado do app ou da WebView.
- Falha de inicialização ou tela vazia: toda abertura chegou à Central e, no 3D, ao acampamento pronto.
- Recarga espontânea da página ou perda de estado ao voltar do segundo plano, mesmo depois de 5 min.
- Remontagem espontânea da cena 3D. O efeito do `prefers-reduced-motion` do emulador não acontece no aparelho.
- Diferença entre internet, offline e modo avião.
- Erros de JavaScript.

## 8. Comparação com o emulador

| Medida | Emulador (relatório de diagnóstico da Central 3D) | Moto G75 5G |
|---|---|---|
| ANR | 5 em 15 aberturas | **0 em 11** |
| Maior bloqueio na abertura | 5 a 9 s | **1,6 s** |
| Bloqueio só com WebView (2D) | 3,4 a 4,9 s | 1,4 a 1,6 s |
| Remontagem da cena por `prefers-reduced-motion` | Sim (efeito da conexão de depuração) | **Não** |

O ANR do emulador vinha da combinação de uma máquina virtual lenta com a ferramenta de depuração conectada. No aparelho real, ele não se confirmou.

## 9. Limitações

- **Só um aparelho**, intermediário e recente, com Android 16. Ainda faltam um aparelho de entrada e uma versão mais antiga do Android.
- **Três cenários obrigatórios não foram executados** (6, 7 e 10) e nenhum complementar foi feito.
- No cenário de toques (abertura 6), os toques começaram só em 20 s, e não logo ao abrir. A "tempestade de toques durante a carga" **não foi testada de verdade**. O caso mais próximo é a abertura 3, com três toques em 2,2 s.
- As aberturas 1 e 10 foram feitas com o app fora do primeiro plano, e seus tempos não servem de referência.
- O filtro de coleta não incluiu as etiquetas `AndroidRuntime` e `chromium`. A ausência de queda se baseia no `ActivityManager`, que registra ANRs e mortes de processo. Uma exceção Java engolida não apareceria, mas não houve sintoma dela.
- O fuso horário é presumido (UTC−3).
- O registro original continua privado. Quem precisar conferir pode pedir ao dono do projeto, e o SHA-256 acima garante que é o mesmo arquivo.

## 10. Conclusões e próximos passos (sem mudança no código agora)

1. **O ANR não se reproduz no Moto G75 5G.** O problema prioritário da prontidão fica **rebaixado** de "bloqueante" para "observar em aparelho de entrada".
2. O custo de abertura (P1) e a recriação da cena (P2) são as frentes de desempenho mais úteis para a etapa 6. Nenhuma das duas impede a versão 1.0.
3. **Próximo teste recomendado:**
   - um aparelho de entrada (2 a 3 GB de RAM), com os cenários 6, 7 e 10;
   - a tempestade de toques feita **logo** após o comando de abrir;
   - a tela desbloqueada antes de cada abertura.
4. Nenhuma alteração foi feita no código, no APK ou nas configurações do aplicativo nesta análise.
