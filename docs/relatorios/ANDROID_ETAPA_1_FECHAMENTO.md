# Bible Quest — Aplicativo Android, etapa 1: fechamento

**Data:** 24/11/2026
**Branch:** `claude/bible-quest-android` (não integrada ao `main`; nada publicado; nenhum AAB)
**Complementa:** `ANDROID_ETAPA_1.md` e `ANDROID_ETAPA_1_COMPLEMENTO.md`

Entrega complementar autorizada em 24/11/2026, limitada a quatro itens: permissão INTERNET, ícone, investigação da Central 3D e validação. A lógica, o conteúdo e a monetização do jogo não mudaram. O site continua idêntico à 0.17.9.

## Resumo

| # | Item | Resultado |
|---|---|---|
| 1 | Remover a permissão INTERNET | **Feito.** O manifesto não declara nenhuma permissão. Todas as verificações passaram no emulador, sem internet, e o link externo abre no navegador do sistema |
| 2 | Ajustar o ícone | **Feito.** Medalhão a 88 % no ícone colorido e no monocromático; tela de abertura sem nenhuma mudança (mesmos bytes) |
| 3 | Investigar a Central 3D | **Diagnóstico apresentado, sem correção.** Não tem relação com estar sem internet: a cena é refeita uma vez logo depois de pronta. Também foi encontrado um ANR no emulador. Falta conferir num aparelho físico |
| 4 | Validação | Testes, typecheck, build, verificação do APK e emulador; site idêntico à 0.17.9 (seção 4) |

**Achado fora do pedido, corrigido só no teste:** o teste automático do desafio diário falhava em certas datas, já na 0.17.9. O assistente do teste não respondia perguntas do tipo "associar", que o diário sorteou para 24/11/2026. O jogo não mudou.

## 1. Permissão INTERNET

**O que mudou:**
- `android/app/src/main/AndroidManifest.xml`: a linha `<uses-permission android:name="android.permission.INTERNET" />` foi removida, e um comentário explica por quê;
- nenhuma outra permissão foi adicionada, e nenhum plugin do projeto declara permissões.

**Única permissão no APK:** `com.kzanntech.biblequest.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`. Ela é criada automaticamente pela biblioteca AndroidX, vale só dentro do próprio aplicativo e não é mostrada nem pedida ao usuário.

**Proteções novas:**
- o fluxo `android.yml` falha se a permissão INTERNET voltar ao APK;
- um teste novo, em `src/test/android.test.tsx`, falha se o manifesto declarar qualquer `uses-permission`.

**Verificação no emulador Android 16** (execução 45298299473, APK sem INTERNET):
- tudo vem de `https://localhost`, os arquivos do aplicativo, sem nenhuma requisição para a internet;
- boas-vindas, Central, recursos desativados, Biblioteca e botão voltar funcionam;
- em modo avião, o aplicativo reabre direto na Central com o progresso salvo;
- **link externo:** "Fonte no Commons", na página Sobre, abriu no Chrome (`com.android.chrome`). Depois do navegador, o jogo continuou na mesma tela (`#/sobre`);
- nenhum travamento.

**Observação sobre o teste do link:** no emulador, o Chrome nunca tinha sido usado e abriu na tela de primeiro uso, que às vezes não fecha com o voltar. Nesses casos, o teste traz o jogo de volta pelo alternador de aplicativos e confere a tela. Num celular de uso normal, o Chrome abre direto na página.

## 2. Ícone

**Medalhão reduzido a 88 %** em `tools/android/icone-frente.svg` e `icone-monocromatico.svg`:
- todo o desenho foi escalado em torno do centro;
- o diâmetro passou de cerca de 66 dp para cerca de 58 dp, dentro da área segura de 66 dp do ícone adaptativo;
- cores, cruz, Bíblia e fita foram preservadas.

Os PNGs do lançador foram gerados de novo em todas as densidades.

**Tela de abertura sem mudança:** antes, ela usava a mesma imagem da camada da frente do ícone. Agora tem imagem própria:
- `mipmap-*/ic_splash.png` é **cópia exata** da imagem anterior;
- o desenho original foi guardado em `tools/android/icone-abertura.svg`;
- `styles.xml` aponta para `@mipmap/ic_splash`;
- os `drawable*/splash.png` não foram tocados: o SHA-256 de todas as imagens da abertura é o mesmo de antes;
- o gerador `tools/android/gerar-recursos.cjs` só refaz a abertura com `--abertura`.

**Comparação:** `evidencias/android-etapa-1-fechamento/icone-antes-depois.png`, com a máscara circular de 72 dp do lançador. Da esquerda para a direita: colorido antes, colorido depois, monocromático antes, monocromático depois. Depois da redução, o anel dourado deixa uma margem visível até a borda da máscara.

**Origem do desenho:** registrada em `tools/android/LICENCAS.md`.

## 3. Central 3D ao reabrir: diagnóstico

Ferramenta: `tools/android/diagnostico-central.cjs`, que só observa e roda no fluxo `android-verificacoes.yml`, num emulador com sistema "user", igual ao dos celulares.

**Cenários:**
- A: reabrir com internet;
- B: reabrir em modo avião;
- C: recarregar em modo avião, sem fechar o aplicativo;
- D: reabrir em modo avião e depois sair e voltar ao aplicativo;
- E: reabrir com as animações do sistema ligadas.

**Registrado em cada cenário, aos 5, 15, 30 e 60 s:**
- visibilidade da página;
- estado da cena;
- canvas e contexto WebGL;
- quadros por segundo;
- renderizador;
- preferência "reduzir movimento";
- cada vez que o canvas 3D sai ou volta;
- capturas de tela.

**Evidências:** `evidencias/android-etapa-1/central/`.

### 3.1 O que os dados mostram

| Pergunta | Resposta (execuções 45294591202 e 45301059480) |
|---|---|
| Renderizador | `Android Emulator OpenGL ES Translator (Google SwiftShader)`: **por software**, sem GPU |
| Inicialização do WebGL | o contexto foi criado em todos os cenários, sem erro no console |
| Contexto gráfico perdido? | **não**: sempre ativo, inclusive depois de sair e voltar ao aplicativo (cenário D) |
| Carregamento dos modelos | o personagem 3D (GLB local) carrega em modo avião; o aviso "Montando o acampamento…" some quando o modelo termina |
| Página visível e desenhando? | sim: visível, com foco, de 1 a 11 quadros por segundo (o software é lento) |
| Depende de estar sem internet? | **não**: com internet (A) acontece o mesmo que em modo avião (B e D) |

### 3.2 A causa da tela vazia

Em toda abertura do processo com as animações do sistema desligadas, que é como o emulador de testes roda (cenários A, B e D):
1. a cena fica pronta;
2. cerca de 2 a 3 s depois, o **canvas 3D é removido**;
3. ele é **criado de novo** de 3 a 12 s depois.

Enquanto isso, não há canvas nem o aviso de carregamento. Por isso as capturas mostravam só o fundo azul e os rótulos. Ao recarregar sem fechar (C), ou com as animações ligadas (E), **não há remontagem**.

A cena é montada por um efeito do React em `src/components/camp/CenaAcampamento.tsx`. Ele desmonta e monta de novo a cena quando muda a qualidade gráfica, a opção de animações reduzidas, os elementos liberados ou o baú pronto. Durante a remontagem, o estado continua "pronto", então o aviso de carregamento não volta.

**Reprodução no Chromium:** abrindo a Central e ligando "reduzir movimento" 1 s depois, acontece exatamente a mesma sequência (o canvas sai e volta logo depois de pronto), em cerca de 0,3 s. No emulador, por causa do software, leva segundos.

**Mas o gatilho no emulador não é essa preferência:** ela ficou falsa o tempo todo nos registros, sem nenhuma mudança. O que dispara a remontagem ainda não foi identificado. A execução final registra também se o componente inteiro é montado de novo, o que distingue as duas possibilidades (resultado na seção 3.4).

### 3.3 ANR no emulador

O Android registrou "**Bible Quest isn't responding**" (ANR: "Input dispatching timed out… Waited 5000ms for FocusEvent") nas duas imagens de emulador:
- nas verificações de 24/11/2026, com uma ou duas ocorrências por execução;
- no começo da verificação, quando a Central carrega o 3D.

Na imagem com sistema "user", o aviso fica na tela e recebe o botão voltar. Foi isso que fez o teste do voltar falhar nessa imagem (`eventosVoltar: 0`).

**Causa provável:** no WebView do Android, o desenho é feito dentro do processo do aplicativo. Com o WebGL por software (SwiftShader), um quadro pesado, como a criação da cena e do personagem, pode travar o processo por mais de 5 s.

O ANR agora é registrado em toda verificação (`anr.txt` e um aviso no GitHub Actions), como observação, sem reprovar o fluxo.

### 3.4 Conclusão

1. **Não tem relação com estar sem internet.** Os arquivos, o modelo do personagem e o WebGL funcionam em modo avião.
2. **Não há perda do contexto gráfico** nem falha de inicialização do WebGL ou de carregamento dos modelos.
3. **A tela vazia é a cena sendo refeita logo depois de pronta**, sem o aviso de carregamento.
4. O emulador desenha por software, o que transforma uma remontagem de décimos de segundo em vários segundos e provoca ANR.
5. O gatilho exato da remontagem no emulador ainda não foi identificado; o resultado da execução final está abaixo.

**Confirmação em aparelho físico ainda necessária.** Num celular com GPU, a remontagem, se acontecer, deve ser curta, e o ANR pode não acontecer. Isso só pode ser afirmado depois do teste num aparelho real, com as animações do sistema ligadas e desligadas.

**Possíveis correções (não implementadas; dependem de autorização):**
- mostrar de novo "Montando o acampamento…" sempre que a cena for refeita, para não aparecer tela vazia;
- evitar a remontagem quando só a preferência de movimento muda, aplicando a mudança na cena existente;
- se o ANR se confirmar em aparelhos fracos, criar a cena em etapas menores ou usar a qualidade 2D quando o desenho for por software.

## 4. Validação

| Verificação | Resultado |
|---|---|
| `npm run typecheck` | sem erros |
| `npm test` | 213 testes em 19 arquivos, todos passando |
| `npm run build` | sem erros; **os 106 arquivos do site têm o mesmo SHA-256 da 0.17.9** |
| `npm run build:android` | sem erros |
| Fluxo do APK, build e verificação | execução 45298299473 (`5348df9`): APK compilado; `aapt2` confirma o pacote, a versão 0.17.9, API 24/36 e **nenhuma permissão INTERNET** |
| Emulador Android 16 (`google_apis`) | execução 45298299473: **todas as verificações passaram**, incluindo o link externo |
| Verificações complementares (sistema "user") | depuração do WebView só no APK de depuração (confirmado de novo); tela de abertura e ícone capturados; diagnóstico da Central. O teste do voltar falhou nessa imagem por causa do aviso de ANR (seção 3.3) |
| Verificação do site (GitHub Pages) | sucesso |

**Correções feitas só nos scripts de verificação durante esta entrega (o jogo não mudou):**
- o teste do link externo passou para depois dos testes do voltar;
- antes de reabrir o aplicativo, o script fecha o processo, para ter um WebView novo;
- o diagnóstico da Central registra remontagens e a preferência de movimento;
- o ANR é registrado como observação.

## 5. Arquivos criados e modificados

| Arquivo | Mudança |
|---|---|
| `android/app/src/main/AndroidManifest.xml` | sem a permissão INTERNET |
| `android/app/src/main/res/values/styles.xml` | a tela de abertura usa `@mipmap/ic_splash` |
| `android/app/src/main/res/mipmap-*/ic_launcher*.png` | ícone com o medalhão a 88 % |
| `android/app/src/main/res/mipmap-*/ic_splash.png` | novo: cópia exata da imagem anterior da abertura |
| `tools/android/icone-frente.svg`, `icone-monocromatico.svg` | medalhão a 88 % |
| `tools/android/icone-abertura.svg` | novo: desenho original, para a tela de abertura |
| `tools/android/gerar-recursos.cjs` | separa ícone e abertura (`--abertura`) |
| `tools/android/LICENCAS.md` | origem dos novos arquivos |
| `tools/android/verificar-no-emulador.cjs` | link externo, reabertura com WebView novo, registro de ANR |
| `tools/android/diagnostico-central.cjs` | novo: diagnóstico da Central (só observa) |
| `.github/workflows/android.yml` | falha se a permissão INTERNET voltar |
| `.github/workflows/android-verificacoes.yml` | usa o APK oficial, roda o diagnóstico e não monta mais a variante sem INTERNET |
| `src/test/android.test.tsx` | nenhuma permissão; ícone e abertura separados (16 testes) |
| `src/test/flow.test.tsx` | o assistente do teste responde perguntas "associar" |
| `docs/relatorios/ANDROID_ETAPA_1_FECHAMENTO.md` e `.pdf` | este relatório |
| `docs/relatorios/evidencias/android-etapa-1-fechamento/` | comparação do ícone |
| `docs/relatorios/evidencias/android-etapa-1/` | evidências gravadas pelo fluxo de verificações |
| `CHANGELOG.md`, `README.md`, `docs/README.md` | documentação |

**Não alterados:**
- a lógica, o conteúdo e a monetização do jogo;
- o site;
- o `main`, a branch visual e a Google Play.

**Não feito:** nenhum AAB foi gerado.

## 6. Pendências

1. **Aparelho físico.** Conferir a Central 3D ao fechar e reabrir com e sem internet, com as animações do sistema ligadas e desligadas, e observar se aparece o aviso de "não está respondendo".
2. **Gatilho da remontagem:** ver o resultado da execução final na seção 3.4 e, com autorização, aplicar uma das correções propostas.
3. **Ações do GitHub Actions** baseadas no Node 20 (aviso de descontinuação): atualizar numa próxima etapa.
