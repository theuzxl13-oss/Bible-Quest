# Bible Quest — Aplicativo Android, etapa 1: complemento

**Data:** 23/11/2026
**Branch:** `claude/bible-quest-android` (não integrada ao `main`)
**Complementa:** `docs/relatorios/ANDROID_ETAPA_1.md`

Este complemento registra as cinco verificações pedidas na avaliação da etapa 1. Nenhuma funcionalidade do jogo mudou, e o build do site e o APK oficial continuam os mesmos. Só foram alterados os scripts de verificação e os fluxos do GitHub Actions, e foram acrescentadas evidências e documentação.

## Resumo

| # | Verificação | Resultado |
|---|---|---|
| 1 | Commit `e80b817` nos dois fluxos | **Confirmado.** Os dois terminaram com sucesso |
| 2 | Avaliação visual no emulador Android 16 | **Feita.** Ícone, tela de abertura, barras do sistema, Central, Biblioteca e Configurações estão corretos. Duas das seis capturas originais estavam incompletas (ver seção 2) |
| 3 | A permissão INTERNET é indispensável? | **Não.** Um APK sem a permissão passou em todas as verificações no emulador. Hoje ela vem do modelo do Capacitor. A decisão de remover fica com vocês (seção 3) |
| 4 | Depuração do WebView só no APK de depuração | **Confirmado.** Desligada no build de lançamento, testado num sistema igual ao dos celulares |
| 5 | Nenhuma chave privada ou segredo no repositório | **Confirmado.** A varredura não encontrou nada |

## 1. Commit `e80b817` nos fluxos do GitHub Actions

| Fluxo | Execução | Resultado |
|---|---|---|
| Aplicativo Android (APK de depuração): build, verificação do APK e emulador | 45281055916 | sucesso nos dois jobs |
| Verificação e publicação no GitHub Pages (verificação do site) | 45281055711 | sucesso |

Artefatos da execução 45281055916:
- `bible-quest-0.17.9-debug-apk` (id 14870270614, até 23/12/2026);
- `verificacao-no-emulador` (id 14869656713).

## 2. Avaliação visual (emulador Android 16, API 36)

### 2.1 Como as capturas foram obtidas

Este ambiente não consegue baixar artefatos do GitHub: o servidor de armazenamento é bloqueado pela rede, e o endereço muda a cada execução.

Por isso criei o fluxo `android-verificacoes.yml`, iniciado à mão. Ele copia as capturas para a própria branch, em `docs/relatorios/evidencias/android-etapa-1/`, como JPEG de 720 px de largura:
- `emulador-45281055916/`: as seis capturas originais do commit `e80b817`;
- `complementos/`: tela de abertura, ícone no lançador e build de lançamento;
- `sem-internet/`: a verificação completa do APK sem a permissão INTERNET, com capturas tiradas depois que cada tela termina de carregar.

### 2.2 As seis capturas do commit `e80b817`

| Captura | O que mostra | Avaliação |
|---|---|---|
| 01 primeira abertura | boas-vindas: título, etapas, "Começar jornada", crédito da pintura | correta; a página começa logo abaixo da barra de status, sem ficar atrás dela |
| 02 Central | só o céu e as montanhas, cabeçalho com avatar vazio | **incompleta**: tirada enquanto a cena 3D ainda carregava |
| 03 treino livre | título, números, XP de prática, desafio diário, menu inferior | correta; o multiplayer não aparece |
| 04 Configurações | Leitura (tamanho do texto, alto contraste, reduzir animações) e Jogo | correta; a opção de leitura em voz alta não aparece |
| 05 Biblioteca | a **Central** inteira (personagem, fogueira, baú) | **captura errada**: a Central ainda estava na tela |
| 06 sem internet | modo avião (ícone do avião) e a Central com "Montando o acampamento…" | correta quanto ao modo avião; a cena ainda carregava |

**Problema encontrado:** o emulador desenha o 3D por software, bem mais devagar que um celular, e as esperas fixas do script não bastavam.

Isso afetava também o teste do botão voltar:
- no commit `e80b817`, ele foi aprovado sem que a Biblioteca tivesse aberto de fato;
- com o script corrigido, o teste espera a tela certa antes de capturar ou de apertar voltar;
- a nova verificação mostrou o voltar funcionando nas execuções 45285440109 (versão sem INTERNET, imagem com sistema "user") e 45287219234 (com diagnóstico);
- numa execução (45285440130), o teste conferiu a tela cedo demais e falhou;
- o diagnóstico seguinte mostrou que o evento chega à página, sem teclado aberto e sem erro de JavaScript, e que o jogo volta à Central;
- o script agora espera a resposta do aplicativo (até 15 s) em vez de um tempo fixo.

O código do jogo não precisou mudar.

### 2.3 Novas capturas

| Item | Captura (`evidencias/android-etapa-1/…`) | Avaliação |
|---|---|---|
| Tela de abertura | `complementos/abertura-00…07.jpg` | fundo terra `#22160D` com o medalhão (cruz e Bíblia aberta) no centro, recortado em círculo pelo Android 12+; sem logotipo de terceiros |
| Ícone | `complementos/lancador-aplicativos.jpg` | o ícone aparece na barra do lançador, legível ao lado dos ícones do sistema. **Observação estética:** o anel dourado chega muito perto da borda da máscara circular. Diminuir o desenho na área segura do ícone adaptativo é um ajuste simples, que deixo para a próxima etapa, se aprovado. O ícone temático (monocromático) não foi conferido no emulador |
| Barras do sistema | todas as capturas | barra de status escura com ícones claros e a página logo abaixo dela; a barra de gestos não cobre o menu inferior |
| Central | `sem-internet/02-central.jpg` | cena 3D inteira: personagem, barraca, fogueira, quadro de missões e baú; botões História, Começar e Quiz e o menu inferior visíveis |
| Biblioteca | `sem-internet/05-biblioteca.jpg` | cabeçalho com voltar, painel em pergaminho, abas (Personagens 0/35, Livros, Lugares 0/19, Acontecimentos, Temas, Linha do tempo) e fichas bloqueadas; "Biblioteca" marcado no menu inferior |
| Configurações | `sem-internet/04-configuracoes.jpg` | igual à captura 04 original; sem a leitura em voz alta |
| Sem internet | `sem-internet/06-sem-internet.jpg` | modo avião ligado, o perfil "Tobias" mantido e a Central aberta. **A cena 3D não chegou a ser desenhada nesta captura** (aparecem o fundo e os rótulos). O teste da Central sem internet passou, mas o desenho 3D logo depois de reabrir o aplicativo precisa ser conferido num celular de verdade |

## 3. A permissão INTERNET

**De onde vem:** o modelo de projeto do Capacitor declara `<uses-permission android:name="android.permission.INTERNET" />` em `android/app/src/main/AndroidManifest.xml`. O Bible Quest não a pediu nem a usa.

**Por que o jogo funciona sem ela:**
- o WebView carrega o jogo de `https://localhost`, mas esse endereço não usa a rede: o próprio Capacitor intercepta as requisições e entrega os arquivos de dentro do APK;
- os links externos abrem no navegador do sistema (`@capacitor/browser`), que usa a própria permissão;
- nenhuma das verificações registrou requisição para fora do aparelho.

**Teste:** o fluxo `android-verificacoes.yml` monta, só dentro do executor, um APK de depuração com a permissão removida (`tools:node="remove"`):
- o `aapt2` confirma que esse APK não tem INTERNET (`evidencias/android-etapa-1/apk/app-sem-internet.permissoes.txt`);
- instalado num emulador Android 16 com sistema "user", ele passou nas 16 verificações (`sem-internet/resultado.json`, execução 45285440109): abertura, perfil, Central, recursos desativados, Biblioteca, botão voltar, nenhuma requisição externa, modo avião com o progresso salvo e nenhum travamento.

**Conclusão:**
- a permissão **não é indispensável** para o jogo atual;
- removê-la deixaria o aplicativo sem nenhum acesso à rede, o que é coerente com "funciona sem internet";
- se um dia houver recursos online (multiplayer de verdade, sincronização), ela volta a ser necessária.

**Decisão de vocês:** o APK oficial continua com a permissão, porque mudar o manifesto altera o aplicativo e não foi autorizado nesta verificação. Se aprovarem a remoção, basta uma linha no manifesto, com o mesmo teste já pronto no fluxo.

## 4. Depuração do WebView

**Como o Capacitor decide:**
- a depuração é ligada em `Bridge.java:624`, com `WebView.setWebContentsDebuggingEnabled(config.isWebContentsDebuggingEnabled())`;
- quando `android.webContentsDebuggingEnabled` não está definido (e não está no `capacitor.config.ts`), o padrão em `CapConfig.java:286` é `isDebug`, ou seja, ligado só se o APK tiver o atributo depurável (`FLAG_DEBUGGABLE`).

**Evidências:**

| | APK de depuração | Build de lançamento (teste) |
|---|---|---|
| `aapt2` | `application-debuggable` presente | ausente |
| `dumpsys package` no aparelho | — | `flags=[ HAS_CODE ALLOW_CLEAR_USER_DATA ALLOW_BACKUP ]` (sem DEBUGGABLE) |
| Soquete de depuração do WebView | `@webview_devtools_remote_<pid>` aberto | **nenhum soquete do aplicativo** |

O soquete que aparece na lista do build de lançamento é do aplicativo de mensagens do próprio Android (`stetho_com.google.android.apps.messaging`), não do Bible Quest.

**Como o teste foi feito:**
- num emulador com sistema "user" (`ro.build.type=user`, `ro.debuggable=0`, imagem `google_apis_playstore`), igual aos celulares;
- primeiro foi feito num sistema "userdebug" (imagem `google_apis`). Ali o próprio WebView liga a depuração em todos os aplicativos, e o soquete apareceu também no build de lançamento. Por isso o teste foi refeito no sistema "user";
- o build de lançamento de teste foi assinado só com a chave de depuração gerada no executor, nunca com uma chave comercial. Ele não foi publicado nem guardado como artefato.

**Conclusão:** a depuração do WebView fica ligada somente no APK de depuração e desligada no build de lançamento, sem precisar de configuração. Para deixar isso explícito no futuro AAB, dá para fixar `android.webContentsDebuggingEnabled: false` só no build de lançamento. Isso não foi feito agora.

## 5. Chaves privadas e segredos

| Verificação | Resultado |
|---|---|
| Arquivos de chave ou credencial em todo o histórico da branch desde `4815afa` (`*.jks`, `*.keystore`, `*.p12`, `*.pfx`, `*.pem`, `*.key`, `google-services.json`, `local.properties`, `keystore.properties`, `.env`) | nenhum |
| Padrões de segredo nas mudanças da branch (chaves privadas PEM, tokens do GitHub, chaves AWS ou Google, `storePassword`, `keyPassword`, blocos `signingConfigs`) | nenhum |
| Uso de `secrets.*` nos fluxos | nenhum. Só o `GITHUB_TOKEN` automático, no fluxo de verificações, para gravar as evidências e baixar o artefato |
| Assinatura no Gradle | nenhuma configuração de assinatura no projeto. O APK de depuração usa a chave de depuração que o Gradle cria em cada executor e descarta |
| Varredura de segredos do GitHub | indisponível: o repositório não tem o GitHub Advanced Security ativado |

**Recomendação para a etapa do AAB:** o `android/.gitignore` do Capacitor traz `*.jks` e `*.keystore` comentados. Convém ativar essas linhas antes de criar a chave de envio, para ela nunca entrar no repositório por engano. Não foi alterado agora.

**Plugin do Google Services:** o `build.gradle` do modelo traz o plugin `com.google.gms:google-services`. Ele só é aplicado se existir um `google-services.json`, que não existe, então nenhum SDK do Firebase ou do Google entra no APK.

## 6. Arquivos criados e modificados neste complemento

| Arquivo | Mudança |
|---|---|
| `.github/workflows/android-verificacoes.yml` | novo fluxo de verificações complementares (à mão, ou quando ele ou os scripts mudam) |
| `tools/android/verificacoes-complementares.cjs` | novo: tela de abertura, ícone e depuração do WebView |
| `tools/android/verificar-no-emulador.cjs` | espera cada tela carregar; confirma a Biblioteca antes do voltar; diagnóstico do voltar |
| `.github/workflows/android.yml` | não mudou neste complemento |
| `docs/relatorios/evidencias/android-etapa-1/` | capturas e resultados (gravados pelo fluxo) |
| `docs/relatorios/ANDROID_ETAPA_1_COMPLEMENTO.md` e `.pdf` | este complemento |
| `CHANGELOG.md`, `README.md`, `docs/README.md` | documentação |

**Não alterados:**
- o código do jogo, o site, o `AndroidManifest.xml`, o `capacitor.config.ts` e o projeto Gradle;
- o `main` e a branch visual.

**Não feitos:** nenhum AAB foi criado e nada foi publicado.

## 7. Pendências e decisões de vocês

1. Remover a permissão INTERNET do APK oficial (seção 3).
2. Ajustar o tamanho do medalhão no ícone adaptativo (seção 2.3).
3. Confirmar num celular de verdade o desenho da cena 3D logo depois de reabrir o aplicativo sem internet (seção 2.3).
4. Na etapa do AAB:
   - ativar `*.jks` e `*.keystore` no `.gitignore`;
   - se quiserem, fixar a depuração desligada no build de lançamento (seções 4 e 5).
