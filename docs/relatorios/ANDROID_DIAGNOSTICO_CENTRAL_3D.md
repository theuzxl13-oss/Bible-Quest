# Bible Quest — Diagnóstico da Central 3D no Android

**Data:** 24/11/2026
**Branch:** `claude/bible-quest-android`. Não foi integrada ao `main`, nada foi publicado e nenhum AAB foi gerado.
**Escopo:** só diagnóstico, autorizado em 24/11/2026. Nenhuma correção foi feita. O jogo, os quatro valores, a cena, o comportamento visual, o APK oficial e o site não mudaram.
**Relatórios anteriores:** `ANDROID_ETAPA_1_FECHAMENTO.md`, seção 3.

## 1. Conclusão

1. **O valor que muda é `animacoesReduzidas`**, que vem da preferência do sistema `prefers-reduced-motion`. Os outros três (qualidade gráfica, elementos liberados e estado do baú) **não mudaram em nenhum dos 27 cenários**.
2. **A mudança é causada pela própria ferramenta de teste.**
   - Com as animações do Android desligadas, que é como o emulador de testes roda, o WebView abre corretamente com "reduzir movimento" ligado (`true`).
   - No instante em que o Playwright se conecta ao WebView pelo DevTools, o valor vira `false`.
   - A mudança acompanhou o momento da conexão aos 5, 40, 45 e 70 s.
   - Com as animações ligadas, o valor é `false` desde o início, e a conexão não muda nada.
3. **A cena é refeita na primeira renderização depois da mudança.** Isso vale para qualquer renderização: quando a cena fica pronta, ou quando o relógio de minutos da Central atualiza a tela.
   - Nesse momento, o componente lê o valor novo, o efeito roda de novo, e a cena é desmontada e montada outra vez.
   - Era isso que deixava o fundo vazio nas verificações anteriores: o Playwright se conectava aos 6–10 s, antes de a cena ficar pronta.
4. **Sem a ferramenta conectada, o efeito rodou uma vez só.**
   - Antes de cada conexão, em todos os cenários, o valor ficou estável durante 40 a 70 s.
   - Nesse período, a cena ficou pronta sem nenhuma remontagem: com internet, em modo avião e na volta do segundo plano; com as animações ligadas e desligadas.
5. **Para os usuários,** a remontagem só aconteceria se a preferência de animações do sistema mudasse com a Central aberta. Por exemplo, alguém que liga ou desliga "Remover animações" nas configurações do Android e volta ao jogo. Isso é raro, e o efeito seria só a cena sendo refeita, sem o aviso de carregamento. **Não é a causa do problema visto nos testes.**
6. **O ANR é um problema à parte e continua aberto.** A thread principal do Android ficou bloqueada por **5,2 a 9,3 s logo ao abrir o aplicativo** em todos os 15 cenários da última execução, e houve ANR em 5 deles.
   - O WebView sozinho, na tela de boas-vindas sem 3D, já bloqueou de 3,4 a 4,9 s.
   - O carregamento da Central 3D acrescenta alguns segundos.
   - O emulador desenha por software (SwiftShader), e por isso **é preciso medir num aparelho físico**. Esta investigação não considera o ANR resolvido.

## 2. Build temporário de diagnóstico

**Onde fica e quem usa:**
- a instrumentação está em `tools/android/diagnostico/` e é aplicada **só dentro do executor do GitHub Actions** pelo fluxo `android-diagnostico.yml`;
- o script `instrumentar.cjs` altera, numa cópia descartável, `src/main.tsx`, `src/components/camp/CenaAcampamento.tsx`, `MainActivity.java` e `build.gradle`;
- a versão gerada é `0.17.9-diagnostico`;
- depois do build, a cópia volta ao estado do repositório.

**Separado do APK oficial:**
- o APK de diagnóstico não é guardado como artefato nem publicado;
- nenhum arquivo de `src/` ou de `android/` foi alterado no repositório;
- o fluxo oficial `android.yml` agora **falha** se o APK tiver o registro (`__bqDiag`) ou a vigia (`BQDiag`), e confere a versão `0.17.9`. Ele passou depois da mudança, nas execuções 45312760731 e 45317162016.

**O que é registrado:**

| Registro | Como |
|---|---|
| Os quatro valores do efeito, antes e depois de cada execução, com o motivo | em cada renderização, execução e limpeza do efeito em `CenaAcampamento` |
| Horário | `performance.now()` (desde o início da página) e horário real (ISO) |
| Canvas e cena | entrada e saída do canvas 3D; "cena pronta" |
| Ciclo de vida da página | visibilidade, foco, `pageshow`/`pagehide` e mudanças de `prefers-reduced-motion` |
| Conexão do Playwright | marcada no instante em que a ferramenta se conecta |
| Thread principal do Android | vigia em `MainActivity` (logcat `BQDiag`): cada bloqueio de 500 ms ou mais, com a duração |
| ANR | `ActivityManager` ("ANR in…") e eventos `am_anr` do logcat |
| Desenho da página | quadros atrasados (mais de 500 ms) e tarefas longas do JavaScript (mais de 200 ms) |

**Cenários:** emulador Android 16, com sistema "user" como nos celulares (`google_apis_playstore`).
- Três rodadas, para separar o efeito das animações da ordem dos testes: animações desligadas, depois ligadas, depois desligadas de novo.
- Em cada rodada:
  - abertura normal, com o Playwright conectando aos 45 s;
  - abertura normal com conexão aos 70 s;
  - abertura normal com conexão aos 5 s (só na última execução);
  - modo avião;
  - volta do segundo plano (tela inicial por 10 s e volta).

## 3. Evidências

**Primeira execução, 45312760778:**
- ficou na tela de boas-vindas, porque o script fechou o aplicativo antes de o WebView gravar o perfil de teste. O erro foi do script e foi corrigido;
- mesmo assim, mostrou a preferência mudando na conexão e mediu os bloqueios do WebView sem 3D.

**Segunda execução, 45314585471:** 12 cenários, conexão aos 45 e aos 70 s. Registros em `evidencias/android-diagnostico-central-45314585471/`.

| Cenário | Execuções do efeito | Preferência de movimento |
|---|---|---|
| todos os 12 | **1** | desligadas: `true` na abertura e `false` só na conexão (43–45 s ou 67–70 s); ligadas: sempre `false` |

**Terceira execução, 45317055749:** 15 cenários, incluindo a conexão aos 5 s. Registros em `evidencias/android-diagnostico-central/`.

| Cenário | Execuções | Motivo da segunda execução |
|---|---|---|
| animações desligadas, conexão aos 5 s (rodadas 1 e 3) | **2** | `animacoesReduzidas: true → false` e `prefersReducedMotion: true → false` |
| animações ligadas, conexão aos 5 s | 1 | — |
| animações desligadas, volta do segundo plano (rodada 3) | 2 | o mesmo; a preferência mudou na conexão (39,7 s) e a cena foi refeita na primeira renderização seguinte (60,5 s) |
| os outros 12 | 1 | — |

**Sequência registrada (rodada 3, animações desligadas, conexão aos 5 s; em ms desde a abertura):**

```
   350  prefers-reduced-motion inicial: true
   474  efeito executa #1 (primeira vez)
 11167  +canvas
 14743  prefers-reduced-motion mudou: false
 15688  Playwright conectado ao WebView
 16401  cena pronta
 24101  render: animacoesReduzidas true → false; prefersReducedMotion true → false
 25846  efeito limpeza
 26167  efeito executa #2 — motivo: animacoesReduzidas true → false
 26167  -canvas
 29631  +canvas
 29633  cena pronta
```

**Reprodução no navegador:** no Chromium do computador, com o build instrumentado, ligar "reduzir movimento" 1 s depois de abrir produz a mesma sequência. O registro mostra "efeito executa #2 — motivo: animacoesReduzidas false → true".

## 4. ANR e bloqueios da thread principal

| Execução | Cenários | Maior bloqueio por cenário | Cenários com ANR |
|---|---|---|---|
| 45312760778 (só boas-vindas, sem 3D) | 9 | 3,4 a 4,9 s | 0 |
| 45314585471 (Central 3D) | 12 | 3,4 a 11,8 s | 2 |
| 45317055749 (Central 3D) | 15 | 5,2 a 9,3 s | 5 |

**Quando acontecem:** o maior bloqueio ocorre **no primeiro segundo da abertura** e vai até 7–9 s, enquanto o WebView inicia e a Central começa a carregar o 3D. Há bloqueios menores, de 1 a 1,8 s, perto de quando o canvas aparece e de quando a cena fica pronta.

**Causa do ANR:** o Android registra "Input dispatching timed out… Waited 5000ms for FocusEvent". O aviso aparece quando o sistema entrega um evento (foco ou toque) durante um desses bloqueios.

**Não depende** de internet nem das animações do sistema.

**Interpretação provável, ainda não confirmada:** no WebView do Android, parte do desenho e da inicialização acontece no processo do próprio aplicativo. Com WebGL por software, iniciar o WebView e montar a cena 3D trava a thread principal por segundos.

**Continua registrado:** o ANR aparece em `anr.txt` nas verificações e como aviso no GitHub Actions; a duração de cada bloqueio aparece neste diagnóstico.

## 5. Recomendação técnica

**Ainda não corrigir a remontagem por causa dos testes.** Ela vem da ferramenta de teste, não do uso real.

**Ferramentas de teste (sem tocar no jogo):**
- rodar as verificações visuais com as animações do sistema **ligadas**, como nos celulares de uso comum;
- ou conectar o Playwright só depois de a cena ficar pronta.

Assim o fundo vazio deixa de aparecer como falso problema nas capturas.

**Correção opcional de robustez** (baixa prioridade; depende de autorização):
- quando a preferência de movimento mudar com a cena aberta, aplicar a mudança na cena existente em vez de refazê-la;
- ou, se for refeita, mostrar de novo "Montando o acampamento…".

**O ANR é a prioridade:**
1. **Medir num aparelho físico:** um Android de entrada (2–3 GB de memória) e um intermediário, abrindo o aplicativo direto na Central com e sem internet. Se o ANR não aparecer, o problema é do emulador. Para medir a duração no aparelho, o build de diagnóstico serve para uso interno (com o `adb logcat -s BQDiag`).
2. Se os bloqueios se confirmarem, as alternativas, todas com autorização, são:
   - adiar a criação da cena 3D para depois do primeiro quadro da Central;
   - dividir a montagem em etapas menores;
   - usar a qualidade 2D quando o WebGL for por software, como já acontece quando não há WebGL.

## 6. Arquivos

| Arquivo | Conteúdo |
|---|---|
| `tools/android/diagnostico/registro.ts` | registro na página (`window.__bqDiag`) |
| `tools/android/diagnostico/instrumentar.cjs` | monta o build temporário, só no executor |
| `tools/android/diagnostico/central-efeito.cjs` | cenários no emulador e coleta dos registros |
| `.github/workflows/android-diagnostico.yml` | fluxo do build de diagnóstico |
| `.github/workflows/android.yml` | falha se houver instrumentação de diagnóstico no APK oficial |
| `docs/relatorios/evidencias/android-diagnostico-central/` | registros da execução 45317055749 (JSON por cenário, resumo e capturas) |
| `docs/relatorios/evidencias/android-diagnostico-central-45314585471/` | registros da execução 45314585471 |
| `docs/relatorios/ANDROID_DIAGNOSTICO_CENTRAL_3D.md` e `.pdf` | este relatório |
| `CHANGELOG.md`, `README.md`, `docs/README.md` | documentação |

**Validação desta entrega:**
- typecheck sem erros;
- 213 testes passando;
- build sem erros;
- site idêntico à 0.17.9 (mesmo SHA-256 nos 106 arquivos);
- fluxo do APK oficial com sucesso.
