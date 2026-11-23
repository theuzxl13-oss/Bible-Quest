# Bible Quest — Aplicativo Android, etapa 1

**Data:** 23/11/2026
**Branch:** `claude/bible-quest-android`, criada a partir de `4815afa` (0.17.9)
**Situação:** em avaliação. Não foi integrada ao `main`, não foi publicada na Google Play e não tem build comercial assinado.

## 1. Resumo

| Item | Resultado |
|---|---|
| Capacitor configurado | Capacitor 8.6.2, `capacitor.config.ts`, identificador `com.kzanntech.biblequest`, nome "Bible Quest" |
| Projeto Android | `android/`, mínimo API 24 (Android 7.0), compilação e alvo API 36 (Android 16) |
| Experiência nativa | ícone adaptativo com versão monocromática, tela de abertura, barras do sistema, botão voltar, retrato em celulares, links externos no navegador, leitura em voz alta oculta |
| Segurança e privacidade | painel administrativo fora do pacote; multiplayer de demonstração desativado; ranking só com recordes do aparelho; nenhum SDK de anúncios, rastreamento ou análise |
| Site publicado | build do site idêntico à 0.17.9: os 106 arquivos têm o mesmo SHA-256 |
| GitHub Actions | fluxo `android.yml`: verde na execução 45278715582 (commit `5b39555`) |
| APK de depuração | compilado, verificado pelo `aapt2`, instalado (`adb install`: Success) e testado num emulador Android 16 (API 36): 14 de 14 verificações passaram |
| Testes do projeto | 212, em 19 arquivos, todos passando; typecheck e build sem erros |

**Conclusão:** a etapa 1 está pronta para avaliação. As seções 4 e 6 trazem as evidências da compilação e das verificações automáticas do APK.

## 2. Decisões técnicas

### 2.1 Um código, dois builds

- **Site:** `npm run build`, igual a antes.
- **Aplicativo:** `npm run build:android` executa `vite build --mode android`.
- O Vite define a constante `__ANDROID__`: verdadeira no build do aplicativo e falsa no do site.
- **Eliminação de código:**
  - no build do site, o código exclusivo do aplicativo (`src/android/nativo.ts` e os plugins do Capacitor) sai do pacote;
  - no build do aplicativo, sai o painel administrativo.
- **Onde se usa cada forma:**
  - a constante global `__ANDROID__` aparece diretamente onde uma importação precisa ser eliminada (`main.tsx` e a importação do painel administrativo em `App.tsx`);
  - nas telas, a condição usa `ANDROID`, de `src/plataforma.ts`, que os testes podem simular.
- **HTML do aplicativo:** um plugin do Vite tira só o `viewport-fit=cover`. Assim o Capacitor encaixa a página entre as barras do sistema (`SystemBars.insetsHandling: 'native'`), sem a página ficar atrás delas.
- **Prova de que o site não mudou:**
  - `tools/android/site-0.17.9.sha256` guarda o SHA-256 dos 106 arquivos do build da 0.17.9;
  - o fluxo do Android compara o build atual com essa lista e avisaria se algo mudasse. Não avisou;
  - a mesma comparação foi feita aqui, também sem diferenças;
  - o fluxo de publicação do site ("Verificação e publicação no GitHub Pages") passou nos três commits da branch.

### 2.2 Recursos desativados só no aplicativo

| Recurso | No aplicativo | No site |
|---|---|---|
| Painel administrativo | rota `/admin` mostra "Este caminho não está no mapa"; o módulo `AdminApp` não entra no APK; sem link na página Sobre | sem mudança |
| Multiplayer de demonstração | `/quiz/multiplayer` e `/livre/multiplayer` levam ao treino livre; sem atalho no menu e no Modo Livre; sem a aba no ranking e nas estatísticas | sem mudança |
| Leitura em voz alta | botões e opção nas Configurações ocultos, mesmo se o aparelho tiver síntese de voz | sem mudança |
| Ranking | continua, só com os recordes deste aparelho; nenhum jogador ou posição é inventado | sem mudança |
| Exportar e apagar dados | continuam no Perfil | sem mudança |

A implementação de cada recurso desativado continua no projeto. A faixa etária não foi alterada.

### 2.3 Experiência nativa

- **Ícone:**
  - desenho próprio: medalhão dourado, cruz e Bíblia aberta, sobre o fundo terra `#22160D` (`tools/android/icone-frente.svg`);
  - camada monocromática para os ícones temáticos do Android 13+;
  - PNGs para Android 7 gerados por `tools/android/gerar-recursos.cjs`;
  - origem registrada em `tools/android/LICENCAS.md`: desenho feito à mão em SVG, sem IA e sem imagens de terceiros.
- **Tela de abertura:** API do Android 12+ (`Theme.SplashScreen`), no mesmo fundo terra e com o ícone. O jogo a esconde depois de desenhar a primeira tela.
- **Barras do sistema:** no tom do jogo, com ícones claros; a página fica entre elas.
- **Botão voltar:**
  1. fecha a janela aberta (como a tecla Esc);
  2. se não houver janela, volta uma tela;
  3. na Central ou na primeira tela do cadastro, sai do aplicativo.
- **Orientação:** retrato em celulares; em tablets e telas grandes (menor lado ≥ 600 dp), rotação livre. Fica em `MainActivity.java` e é recalculada quando a configuração muda (dobráveis, janelas).
- **Links externos:** endereços http e https de outro site abrem no navegador do sistema, nunca dentro do aplicativo.
- **Funciona sem internet:**
  - o conteúdo vem de `assets/public` dentro do APK, servido em `https://localhost`;
  - não há `server.url` e `allowMixedContent` está desligado.

### 2.4 Plugins nativos (somente os necessários)

| Pacote | Uso |
|---|---|
| `@capacitor/core`, `@capacitor/android`, `@capacitor/cli` | base do Capacitor |
| `@capacitor/app` | botão voltar e saída do aplicativo |
| `@capacitor/splash-screen` | esconder a tela de abertura no momento certo |
| `@capacitor/browser` | abrir links externos no navegador do sistema |

**Permissões no APK:**
- `INTERNET`: padrão do Capacitor; o jogo não a usa;
- `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`: interna do AndroidX, criada automaticamente.

## 3. GitHub Actions (`.github/workflows/android.yml`)

Roda em cada envio para `claude/bible-quest-android` e também pode ser iniciado à mão (`workflow_dispatch`).

**Job 1, "Testes, build e APK de depuração":**
1. Node 22, Java 21 (Temurin) e o SDK do Android do próprio executor, mais a plataforma 36 e o build-tools 36.0.0;
2. `npm ci`, typecheck e testes;
3. build do site e comparação com a 0.17.9;
4. `npm run build:android` e `npx cap sync android`;
5. `./gradlew assembleDebug`;
6. verificação do APK:
   - pelo `aapt2`: pacote, versão 0.17.9, minSdk 24, targetSdk 36 e atividade inicial;
   - pelo conteúdo: `index.html` e o modelo 3D presentes, painel administrativo ausente, sem `viewport-fit=cover` e sem `server` no `capacitor.config.json`;
7. publicação do APK como artefato (30 dias).

**Job 2, "Teste no emulador Android 16 (API 36)":** instala o APK num emulador `google_apis` x86_64 (Pixel 6) e roda `tools/android/verificar-no-emulador.cjs`. O script usa o Playwright, conectado ao WebView do APK de depuração.

**Sem chave de assinatura e sem segredos:** o APK de depuração usa a chave de depuração gerada automaticamente pelo Gradle no executor. Nenhuma configuração do repositório precisou ser alterada.

### 3.1 Execuções e correções

| Execução | Commit | Resultado | Causa e correção |
|---|---|---|---|
| 45276466905 | `efb3b5f` | falhou antes de compilar | a ação `android-actions/setup-android@v3` tentou instalar o pacote antigo "tools". Passei a usar o SDK que já vem no executor (`c9e33f1`) |
| 45276688965 | `c9e33f1` | APK compilado; a verificação falhou | o `aapt2` atual escreve `minSdkVersion`, e o fluxo procurava `sdkVersion`. Verificação corrigida, agora mostrando qual item falhou (`c4daa11`) |
| 45277232905 | `c4daa11` | APK verde; emulador com 15 de 16 | sem perfil, o jogo abre na rota inicial (endereço sem `#`), e o script esperava `#/boas-vindas`. Agora confere a rota e o título da tela (`5b39555`) |
| **45278715582** | **`5b39555`** | **tudo verde** | — |

Nenhuma correção mexeu no código do jogo: as três foram no fluxo ou no script de verificação.

## 4. Testes e resultados

### 4.1 Testes automatizados do projeto

- **Resultado:** 212 testes em 19 arquivos, todos passando (`npm test`); `npm run typecheck` e `npm run build` sem erros. O mesmo vale no CI.
- **Arquivo novo:** `src/test/android.test.tsx`, com 15 testes que simulam o build do aplicativo.
- **Recursos desativados:**
  - painel administrativo inexistente;
  - multiplayer redirecionado, também pelos endereços antigos, e sem atalho;
  - abas do ranking;
  - leitura em voz alta oculta;
  - textos da página Sobre;
  - exportar e apagar dados continuam no Perfil.
- **Integração nativa:**
  - o voltar fecha a janela aberta;
  - na Central, sai do aplicativo; em outra tela, volta uma tela ou vai à Central;
  - links externos abrem no navegador e os internos não;
  - a tela de abertura é escondida.
- **Configuração:**
  - Capacitor: identificador, `dist` local, sem servidor remoto, barras nativas;
  - API 24 e 36, orientação, ícones e tema de abertura;
  - scripts de build separados;
  - nenhum SDK de anúncios ou análise.
- **Comportamento do site:** continua coberto pelos outros 197 testes, que rodam com o build do site.

### 4.2 Verificação do APK (`aapt2`, execução 45278715582)

```
package: name='com.kzanntech.biblequest' versionCode='1' versionName='0.17.9'
         platformBuildVersionCode='36' compileSdkVersion='36'
minSdkVersion:'24'
targetSdkVersion:'36'
application-label:'Bible Quest'
uses-permission: android.permission.INTERNET
uses-permission: com.kzanntech.biblequest.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION
app-debug.apk: 17.821.452 bytes
```

### 4.3 Verificação no emulador Android 16 (API 36)

Emulador `sdk_gphone64_x86_64`, execução 45278715582. O APK foi instalado pelo `adb install` (Success) e aberto pela atividade `MainActivity`. **14 de 14 verificações passaram**.

| # | Verificação | Resultado |
|---|---|---|
| 1 | emulador com Android API 36 | OK |
| 2 | a página vem dos arquivos do aplicativo (`https://localhost`) | OK |
| 3 | a primeira tela é a de boas-vindas (sem perfil) | OK |
| 4 | a Central abre com o perfil de teste (fictício) | OK |
| 5 | painel administrativo inacessível | OK |
| 6 | multiplayer de demonstração inacessível (leva a `#/quiz/treino`) | OK |
| 7 | sem atalho para as salas multiplayer | OK |
| 8 | leitura em voz alta oculta nas Configurações | OK |
| 9 | voltar na Biblioteca leva de volta à Central | OK |
| 10 | voltar na Central sai do aplicativo | OK |
| 11 | nenhuma requisição para a internet | OK |
| 12 | em modo avião, o aplicativo reabre direto na Central (progresso salvo) | OK |
| 13 | em modo avião, a Central mostra o jogador | OK |
| 14 | nenhum travamento (`FATAL EXCEPTION` no logcat) | OK |

### 4.4 Capturas da tela do Android

O artefato `verificacao-no-emulador` da execução 45278715582 tem seis capturas tiradas no emulador:
- primeira abertura;
- Central;
- treino livre;
- Configurações;
- Biblioteca;
- abertura sem internet.

Ele também traz o `resultado.json` e o registro de erros do logcat.

Não foi possível copiar as capturas para este relatório: o ambiente onde trabalho bloqueia o servidor de armazenamento dos artefatos do GitHub. Para vê-las, baixe o artefato pela página da execução (é preciso estar conectado ao GitHub).

## 5. Arquivos criados e modificados

### 5.1 Criados

| Arquivo | Conteúdo |
|---|---|
| `capacitor.config.ts` | configuração do Capacitor |
| `src/plataforma.ts`, `src/globais.d.ts` | constante `ANDROID` e declaração de `__ANDROID__` |
| `src/android/nativo.ts` | botão voltar, links externos e tela de abertura |
| `src/test/android.test.tsx` | 15 testes do aplicativo |
| `android/` | projeto Android gerado por `npx cap add android` e ajustado (lista abaixo) |
| `.github/workflows/android.yml` | build, verificação e emulador |
| `tools/android/icone-frente.svg`, `icone-monocromatico.svg` | desenho do ícone |
| `tools/android/gerar-recursos.cjs` | gera ícones e imagens de abertura |
| `tools/android/verificar-no-emulador.cjs`, `perfil-teste.json` | verificação no emulador e perfil fictício |
| `tools/android/site-0.17.9.sha256` | SHA-256 dos 106 arquivos do site 0.17.9 |
| `tools/android/LICENCAS.md` | origem e licença do ícone |
| `docs/relatorios/ANDROID_ETAPA_1.md` e `.pdf` | este relatório |

**Ajustes no projeto Android gerado:**
- `variables.gradle`: API 24, 36 e 36;
- `app/build.gradle`: `versionCode 1`, `versionName "0.17.9"`;
- `MainActivity.java`: orientação;
- `res/values/styles.xml` e `cores.xml`: tema, barras e tela de abertura;
- `res/values/ic_launcher_background.xml`: fundo do ícone;
- `res/mipmap-anydpi-v26/*.xml`: camada monocromática;
- PNGs dos ícones e das imagens de abertura em todas as densidades;
- removidos os vetores com o logotipo do Capacitor.

### 5.2 Modificados

| Arquivo | Mudança |
|---|---|
| `vite.config.ts` | modo `android`, constante `__ANDROID__`, HTML do aplicativo sem `viewport-fit=cover` |
| `package.json`, `package-lock.json` | dependências do Capacitor; scripts `build:android` e `android:sync`; versão continua 0.17.9 |
| `src/main.tsx` | carrega `nativo.ts` só no aplicativo |
| `src/App.tsx` | rotas do painel administrativo e do multiplayer no aplicativo |
| `src/components/layout/Layout.tsx`, `src/pages/free/FreeHub.tsx` | sem atalho do multiplayer no aplicativo |
| `src/pages/Ranking.tsx`, `src/pages/Statistics.tsx` | sem as partidas de demonstração no aplicativo |
| `src/pages/About.tsx` | textos do aplicativo e sem link do painel administrativo |
| `src/components/ReadAloud.tsx`, `src/pages/Settings.tsx` | leitura em voz alta oculta no aplicativo |
| `CHANGELOG.md`, `README.md`, `ROADMAP.md`, `docs/README.md` | documentação |

**Não alterados:**
- o `main`;
- a branch visual `claude/loving-carson-8mrbjo`;
- os arquivos da 0.17.8 e da 0.17.9;
- o Perfil.

## 6. Evidências e links

- **Execução verde:** https://github.com/theuzxl13-oss/Bible-Quest/actions/runs/45278715582
- **APK de depuração** (artefato `bible-quest-0.17.9-debug-apk`, 17,4 MB compactado, disponível até 23/12/2026): https://github.com/theuzxl13-oss/Bible-Quest/actions/runs/45278715582/artifacts/14868768126
- **Verificação no emulador** (capturas, `resultado.json` e logcat): https://github.com/theuzxl13-oss/Bible-Quest/actions/runs/45278715582/artifacts/14868144193

Os artefatos só podem ser baixados por quem está conectado ao GitHub com acesso ao repositório.

## 7. Limitações

- **É um APK de depuração:**
  - usa a chave de depuração do executor, que muda a cada execução. Para atualizar o aplicativo no aparelho, desinstale a versão anterior;
  - não serve para a Google Play;
  - a depuração do WebView fica ligada.
- **Testado só no emulador:** Android 16, x86_64. Faltam aparelhos reais (ARM) e versões mais antigas (Android 7 a 15), tablets e dobráveis. A orientação livre em tablets foi testada apenas no código.
- **Partes da experiência nativa sem verificação automática:** o visual do ícone no lançador, a tela de abertura e as barras do sistema aparecem nas capturas do artefato, mas nenhum teste os confere. A avaliação visual depende de quem baixar o artefato ou instalar o APK.
- **Leitura em voz alta oculta:** a síntese de voz do WebView do Android não é confiável. Uma voz nativa (plugin de TTS) ficaria para uma etapa futura, se aprovada.
- **Aviso de ferramenta:** o GitHub avisa que `actions/setup-java@v4` e outras ações do Node 20 serão descontinuadas. Funciona hoje; convém atualizar numa próxima etapa.
- **Resto do modelo do Capacitor:** os testes de exemplo em `android/app/src/test` e `androidTest` (pacote `com.getcapacitor.myapp`) continuam no projeto. Não rodam no fluxo e não entram no APK.

## 8. Pendências para o AAB e a Google Play (dependem da Kzann Tech)

Nenhuma destas pendências foi feita e nenhuma é declarada como cumprida.

1. **Chave de envio (upload key):**
   - criada e guardada pela Kzann Tech, fora do repositório;
   - se o build assinado for feito no GitHub Actions, ela entra como segredo do repositório, cadastrado por vocês;
   - a assinatura final fica com a Google Play (Play App Signing).
2. **Build de lançamento:**
   - `bundleRelease` (AAB) com a depuração do WebView desligada;
   - estratégia de `versionCode` (por exemplo, crescente a cada envio);
   - revisão do `minifyEnabled`.
3. **Conta de desenvolvedor:**
   - verificação de identidade;
   - se a conta for pessoal e criada depois de 13/11/2023, teste fechado com 12 testadores por 14 dias antes da produção.
4. **Política de privacidade:** publicada numa URL pública, descrevendo o armazenamento local e as opções de exportar e apagar dados.
5. **Play Console:**
   - Segurança dos dados;
   - classificação de conteúdo (questionário IARC);
   - público-alvo.

   A faixa etária do jogo inclui crianças ("até 12"), então valem a política de Famílias e os requisitos correspondentes. Essa análise e as declarações cabem à Kzann Tech.
6. **Página da loja:**
   - ícone de 512 × 512;
   - imagem de destaque de 1024 × 500;
   - capturas de celular (e de tablet, se a loja for oferecer para tablets);
   - descrições em pt-BR.
7. **Testes em aparelhos reais:** pelo menos um Android antigo (API 24 a 28) e um recente, além de um tablet.
8. **Trilhas da Play:** teste interno, depois teste fechado, depois produção, sempre com a autorização de vocês.
