# Bible Quest — Auditoria de memória e desempenho da cena 3D do menu (Central)

**Etapa de auditoria, sem mudanças no jogo** · branch `claude/bible-quest-android` · base `b0e8fe8` · 27/11/2026

> **Limitações, antes de tudo.**
> - Continua sem aparelho Android e sem emulador nesta sessão (o servidor não tem `/dev/kvm`). **Nada aqui foi medido em Android.**
> - As medições são do **Chromium 140** com a GPU **simulada por software (SwiftShader)**, porque o servidor não tem placa de vídeo. Os tempos de GPU e a memória do "processo da GPU" ficam muito acima do real; as **proporções** e as **causas** valem.
> - O Moto G75 (teste físico de 24/11) mostrou um bloqueio equivalente de 1 a 1,6 s.
> - As variantes de correção da § 6 existiram **só numa cópia temporária**, para medir; nenhuma foi para a branch.

## 1. Resumo

| Pergunta | Resposta medida |
|---|---|
| A memória cresce a cada visita? | **Sim, sem limite.** Fora da Central, em 24 idas e voltas: 251 → 407 MB na qualidade alta e 220 → 348 MB na leve, cerca de **+4 MB por visita**. Os tempos não pioram com as visitas. |
| Por quê? (causa 1) | **Cada cena que sai continua inteira na memória.** O `WebGLRenderer` antigo, o contexto WebGL e o canvas ficam presos por **ouvintes** que o three.js põe nas geometrias e texturas do personagem. Essas geometrias e texturas são **compartilhadas e ficam em cache** (GLB), e a limpeza da cena nunca as libera. Depois de 24 visitas, **25 contextos** seguiam na memória JavaScript (1 por visita), e nenhum foi coletado. |
| Por quê? (causa 2) | **Um contexto WebGL novo a cada visita.** No processo da GPU, cada contexto criado e destruído deixa cerca de 2 MB de memória nativa que não volta. Esse custo continua mesmo com a causa 1 corrigida. |
| Por que a saída trava? | **100 % do bloqueio é `forceContextLoss()`**, chamado de forma síncrona na limpeza: **9–10 s** na alta e 2,5 s na leve, com a GPU simulada. A limpeza em JavaScript leva ~10 ms. O bloqueio acontece **logo depois** de a tela nova aparecer, então o jogador vê a tela, mas ela não responde. |
| Por que a entrada demora? | A cada visita a cena inteira é recriada, e **56 shaders** são compilados de novo. Só a espera síncrona da compilação (`getProgramInfoLog`) leva **760–840 ms**; montar a cena leva **~500–625 ms**. Entrada total: **~1,0 s** na alta e **~0,6 s** na leve, a partir da 2ª visita. |
| O `forceContextLoss` pode simplesmente sair? | **Não sozinho.** Sem ele e sem corrigir a causa 1, os contextos presos ficam **ativos**: o processo da GPU chegou a **1.092 MB em 10 visitas** (variante V1). Hoje ele **esconde** o vazamento, ao custo do bloqueio. |
| Melhor caminho medido | **Cena persistente** (V4): a Central é criada uma vez e só pausada ao sair. Resultados: **entrada de 28–40 ms**, saída sem bloqueio, **memória estável** da 2ª visita em diante e nenhum contexto novo. O custo é manter a cena na memória enquanto o jogo está aberto. Junto, a **higiene dos recursos compartilhados** (V3) para quando a cena for realmente destruída. |

## 2. Arquitetura atual

```text
Dashboard (rota #/painel)
 └─ CenaAcampamento.tsx  ── useEffect[quality, reduced, elementos, bauPronto]
     ├─ import('character3d/acampamento')  (módulo 3D sob demanda)
     ├─ createCamp(container, aparência, opções)      ← A CADA ENTRADA
     │   ├─ createRenderer()  → new THREE.WebGLRenderer  → contexto WebGL NOVO
     │   ├─ cena: céu, nuvens, chão, montanhas, florestas (InstancedMesh), tendas, fogueira, baú, mesa,
     │   │        quadro, barris e elementos desbloqueados; dezenas de CanvasTexture desenhadas na hora
     │   ├─ luzes; na alta, sol com sombra (mapa 1024²)
     │   ├─ personagem: montar() → loadHero() (GLB em CACHE de módulo) → buildHero(): clone do esqueleto
     │   │   (cloneSkinned) com GEOMETRIAS e TEXTURAS COMPARTILHADAS e materiais próprios
     │   ├─ eventos: pointerdown/up/move no canvas, visibilitychange, ResizeObserver, IntersectionObserver
     │   ├─ setInterval(1 s): medidas de composição (data-personagem, data-objetos)
     │   └─ setAnimationLoop(tick): animações, gestos, câmera, rótulos
     └─ cleanup → handle.dispose()                       ← A CADA SAÍDA
         ├─ para o laço, o intervalo, os observadores e os eventos
         ├─ personagem: scene.remove + rig.dispose() (só MATERIAIS)
         ├─ scene.traverse: geometrias, materiais e texturas da cena
         ├─ renderer.dispose()
         └─ renderer.forceContextLoss()   ← SÍNCRONO: bloqueia a página até a GPU desmontar o contexto

Fora da cena, sempre vivo:
 runtime.ts → snapshot(): UM WebGLRenderer compartilhado (retrato do HUD, miniaturas), rigs em cache (até 4),
              até 300 imagens em cache
 heroi.ts   → cache de GLB (Promise<GLTF>) e de texturas de pele: compartilhados entre a cena e as fotos
```

A cena não tem vazamento de eventos nem de laços: os ouvintes, o intervalo, os observadores e o `setAnimationLoop` são encerrados no `dispose()`. **Medido:** fora da cena não sobra quadro sendo desenhado, e o contexto da cena fica perdido. A falha é de **referências**, explicada abaixo.

## 3. Causas identificadas

### 3.1 Renderizadores antigos presos pelos recursos compartilhados (vazamento)

Instantâneo do heap depois de 3 visitas, já fora da cena e após 3 coletas de lixo: **4 `WebGLRenderer` vivos**.

- **1 é o renderizador das fotos**, que é permanente de propósito.
- **3 são das cenas que já saíram**, com este caminho de retenção (encurtado):

```text
módulo runtime → shared.scene (cena das fotos) → renderLists (WeakMap Scene→lista) → item → geometry
  (BufferGeometry do GLB em cache, compartilhada) → _listeners.dispose[2] → função do WebGLGeometries/WebGLTextures
  da CENA ANTIGA → WebGLTextures → info.programs → WebGLProgram → renderer: WebGLRenderer (o da cena antiga)
```

Como acontece:
- Quando um renderizador envia uma geometria ou textura à GPU, o three.js põe nela um ouvinte de `dispose`, que aponta para o próprio renderizador.
- O personagem da Central é um clone que **reaproveita** as geometrias e texturas do GLB em cache. A foto do HUD usa os mesmos objetos.
- O `rig.dispose()` libera só os materiais.
- Com isso, as geometrias e texturas compartilhadas acumulam **um ouvinte por visita**, e cada um segura o renderizador inteiro: programas, listas, estados, o contexto WebGL e o canvas.

| Fora da Central (alta, referência) | Início | 1 visita | 5 | 10 | 24 |
|---|---|---|---|---|---|
| Contextos WebGL na memória JS (1 = o das fotos) | 1 | 2 | 6 | 11 | **25** |
| Heap JavaScript | 7,0 MB | 8,4 | 9,7 | 10,7 | **12,2** |
| Processo da página (pegada) | 83 MB | 91 | 92 | 101 | **118** |
| Processo da GPU (pegada) | 129 MB | 179 | 198 | 226 | **246** |
| **Total** | **251 MB** | 312 | 332 | 368 | **407** |
| Nós do DOM fora da cena (+1 por visita = o canvas preso) | 356 | 359 | 363 | 368 | 382 |

**Prova da causa (variante V3):** liberar as geometrias e texturas compartilhadas do personagem na saída tira os ouvintes. Resultado:
- os contextos antigos passam a ser coletados (fica só o das fotos);
- os nós e os ouvintes do DOM ficam estáveis;
- o processo da página fica estável (94,4 → 94,0 MB entre as visitas 1 e 10);
- o instantâneo do heap mostra **1** `WebGLRenderer`.

### 3.2 Um contexto WebGL novo a cada visita (custo de memória nativa e de entrada)

**Memória.** Com a causa 1 corrigida (V3), o processo da GPU ainda cresce cerca de 5 MB por visita (146 → 193 MB em 10 visitas). O detalhe por alocador mostra que a única coisa que cresce é a **memória nativa (`malloc`) do processo da GPU**: +17,8 MB entre as visitas 1 e 10. É memória interna do ANGLE/SwiftShader a cada contexto criado e compilado. Num Android, o equivalente fica no driver da GPU, e isso **não foi medido**.

**Tempo.** Cada contexto novo recompila tudo:
- **56 compilações de shader por visita** (contador do WebGL instrumentado);
- 760–840 ms esperando a compilação (`getProgramInfoLog`, que o three.js chama para conferir erros, `renderer.debug.checkShaderErrors` ligado por padrão);
- reenvio de todas as texturas e geometrias;
- reconstrução da cena (~500–625 ms em `createCamp`, com as texturas desenhadas em canvas).

### 3.3 `forceContextLoss()` síncrono na saída (bloqueio)

Perfil de CPU da saída (alta, 2ª visita):

| | Tempo |
|---|---|
| Bloqueio total na limpeza (efeito de desmontagem do React) | **10.058 ms** |
| `WebGLRenderer.forceContextLoss` → `WEBGL_lose_context.loseContext()` | **10.050 ms** |
| Liberar geometrias, materiais e texturas, `renderer.dispose()` | ~10 ms |

A chamada espera o processo da GPU terminar e desmontar o contexto inteiro. Com a GPU simulada são 9–10 s na alta e 2,5 s na leve.

O React roda a limpeza **depois** de mostrar a tela nova. Assim, a tela de destino (Configurações, mapa) aparece em 0,1–0,6 s, mas **não responde** durante o bloqueio. No Moto G75, a mesma sequência (sair da Central) teve bloqueio de 1 a 1,6 s; a atribuição exata no aparelho não foi medida.

## 4. Metodologia

| Item | Como |
|---|---|
| Versões | Produção minificada (números de memória e tempo) e produção **sem minificação** (perfis de CPU e heap com nomes legíveis). As duas foram geradas fora do repositório, sem mudar o código. |
| Navegador | Chromium 140 (Playwright 1.63), GPU simulada (SwiftShader) com rasterização pela GPU, tela de celular 412 × 915 com densidade 2,625 e toque. Movimento normal (`reduceMotion: false`), com as animações da cena ligadas. |
| Instrumentação (só na página de teste) | Script injetado antes do jogo que conta: contextos WebGL criados, perdidos e coletados (`FinalizationRegistry`); objetos WebGL criados e apagados por contexto (texturas, buffers, framebuffers, programas, VAOs); compilações de shader. Ele acrescenta **1 ouvinte por canvas**, já descontado na leitura. |
| Roteiro de visitas | Começa em Configurações e repete N vezes: **Central** (espera a cena pronta, mede a entrada, quadros perdidos e tarefas longas; fica 1,5 s) → **Configurações** (mede o tempo até a tela aparecer e o bloqueio depois; fica 0,8 s). Também com o **mapa da História** como destino. |
| Memória | `memory-infra` por processo (pegada privada e alocadores), heap JS, nós e ouvintes do DOM e contadores WebGL, após 3 coletas de lixo forçadas, nas visitas 0, 1, 2, 5, 10, 15, 20 e 24, dentro e fora da cena. |
| Causas | Perfil de CPU do V8 (amostragem a 200 µs) da 2ª entrada e da 2ª saída. Instantâneo do heap com o caminho de retenção de cada `WebGLRenderer`. Diferença por alocador entre as visitas 1 e 10. |
| Variantes (cópia temporária) | V1, sem `forceContextLoss`. V2, V1 + liberar os recursos compartilhados. V3, `forceContextLoss` + liberar os compartilhados. V4, cena persistente: pausa e reanexa, sem recriar. |
| Ruído | O ponto inicial variou 251–275 MB entre execuções iguais (±20 MB). As conclusões usam a **inclinação** entre visitas e as contagens exatas (contextos, renderizadores), que não têm ruído. |

## 5. Comparação após visitas repetidas (versão atual)

**Memória total fora da Central** (pegada de todos os processos, MB):

| Visitas | Alta → Configurações | Leve → Configurações | Alta → Mapa da História |
|---|---|---|---|
| 0 | 251 | 220 | 306 |
| 1 | 312 | 260 | 354 |
| 5 | 332 | 290 | 369 |
| 10 | 368 | 330 | 404 |
| 24 | **407** | **348** | — |
| Inclinação (1 → 24) | **+4,1 MB/visita** | **+3,8 MB/visita** | +5,6 MB/visita (1 → 10) |

Dentro da cena (alta), a memória total foi de 423 MB na 1ª visita para 448, 485 e **522 MB** nas visitas 5, 10 e 24.

**Tempos** (medianas; GPU simulada; não pioram com as visitas):

| | Alta | Leve | Alta → mapa |
|---|---|---|---|
| Entrada na Central (1ª visita / da 2ª em diante) | 1,5 s / **~1,0 s** | 0,8 s / **~0,6 s** | 2,2 s / ~1,35 s |
| Quadros acima de 50 ms na entrada | 6–9 | 9 | 14–16 |
| Tela de destino aparece | 0,1–0,6 s | < 0,1 s | 0,2–0,5 s |
| **Bloqueio logo depois da saída** | **9,1–10,3 s** | **2,5–2,6 s** | **7,9–8,6 s** |

## 6. Variantes medidas (protótipos só na cópia temporária)

| Variante | O que muda | Memória fora da cena (alta) | Contextos presos | Entrada (2ª em diante) | Bloqueio na saída |
|---|---|---|---|---|---|
| **Atual** | — | 312 → 368 (10) → **407 (24)**, crescendo | +1 por visita | ~1,0 s | **9–10 s** |
| V1 | sem `forceContextLoss` | 436 → 847 (5) → **1.246 MB (10)** | +1 **ativo** por visita | 3,2–3,9 s | 0 |
| V2 | V1 + liberar os compartilhados | 382 → 449 (10) → 455 (24), oscilando ~300 MB na GPU | **0** | **3–6 s** (a destruição dos contextos antigos cai na entrada seguinte) | 0 |
| V3 | `forceContextLoss` + liberar os compartilhados | 291 → 314 (5) → **330 (10)** | **0** | ~1,0 s | 9–10 s |
| **V4** | **cena persistente** (pausa e reanexa) | 449 (1) → 473 (5) → 480 (10) → **488 (24)**, **estável** | 0 (1 contexto da cena, sempre o mesmo) | **28–40 ms** | **0** |

**Na qualidade leve:**

| Variante | Memória fora da cena (visitas 1 → 10) | Entrada | Saída |
|---|---|---|---|
| V4 | 331 → 365 MB, estável a partir da 5ª | 28 ms | sem bloqueio |
| V2 | 282 → 357 MB | ~0,6 s | sem bloqueio |

**Leitura:**
- **A V3 é a correção mínima da retenção.** Elimina o vazamento em JavaScript e reduz a inclinação, mas mantém o bloqueio e a recompilação.
- **A V2 só desloca o custo:** a saída fica livre, mas a entrada seguinte trava.
- **A V4 resolve tempo e crescimento ao mesmo tempo.**
  - O custo dela: a cena fica residente quando o jogador não está na Central, com ~80 MB a mais que a versão atual na 24ª visita, com a GPU simulada.
  - Comparação: a versão atual cresceria até esse ponto por volta da 40ª visita e continuaria crescendo.
  - O protótipo da V4 deixou cerca de 600 nós do DOM retidos fora da cena (estáveis, sem crescer), porque os rótulos da tela antiga ficaram referenciados. A versão definitiva precisa soltá-los na pausa (§ 7).

## 7. Proposta de correção (para implementar só com autorização)

**Objetivo:** a Central entra e sai instantaneamente, a memória não cresce com as visitas, e os recursos só são liberados quando não vão ser reutilizados. A cena, as animações, a qualidade visual e o comportamento 2D ficam exatamente como hoje.

1. **Cena persistente por sessão (base: V4).**
   - O módulo 3D guarda **uma** instância da Central, identificada pela chave `qualidade | movimento reduzido | elementos | baú`.
   - **Sair** = `pausar()`:
     - para o laço, o intervalo e os observadores;
     - tira o canvas da página;
     - **solta as referências da tela antiga** (rótulos, `onSelect`), para não reter o DOM desmontado.
   - **Voltar** = `reanexar()`:
     - devolve o canvas ao novo contêiner, com novos rótulos e callbacks;
     - mede o tamanho e retoma o laço;
     - a cena aparece no primeiro quadro, sem "Montando o acampamento…".
   - A aparência continua atualizada por `setAppearance`.
2. **Destruir de verdade só quando a cena não vai ser reutilizada:**
   - quando a chave muda (outra qualidade, novo elemento desbloqueado, baú);
   - quando o aplicativo fica em segundo plano por mais de X minutos (sugestão: 5);
   - quando há pressão de memória, se o Capacitor ou o WebView avisarem;
   - quando o jogador sai da conta.
3. **Higiene dos compartilhados (base: V3)**, na destruição:
   - liberar as geometrias e texturas do personagem que vêm do GLB em cache, disparando o evento `dispose` para todos os renderizadores soltarem a sua parte;
   - garantir que nenhum renderizador antigo fique preso;
   - o renderizador das fotos reenvia o que precisar na próxima foto, um custo pequeno;
   - o mesmo cuidado vale para o visualizador 3D do Guarda-roupa (`createViewer`), que usa o mesmo cache.
4. **Tirar o `forceContextLoss` do caminho crítico.** Com a retenção corrigida, ele deixa de ser necessário para o contexto sumir. Se ainda for usado, por exemplo em pressão de memória, deve rodar fora de uma troca de tela.
5. **Entrada mais leve quando a cena precisar ser criada.** É o caso da 1ª visita e de uma troca de qualidade.
   - `renderer.debug.checkShaderErrors = false` em produção, o que tira a espera síncrona de `getProgramInfoLog`, hoje de 760–840 ms;
   - `compileAsync` com `KHR_parallel_shader_compile`, quando disponível, antes de mostrar a cena;
   - texturas desenhadas em canvas geradas uma vez por sessão.
6. **Fora do escopo, mas relacionado.** O renderizador das fotos é permanente e é um 2º contexto WebGL. Na fase de implementação, vale medir se a Central e as fotos podem **compartilhar um renderizador**, o que deixaria 1 contexto em vez de 2.

## 8. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Memória residente da cena fora da Central | Liberação após X minutos em segundo plano e sob pressão. Medir no aparelho o "Graphics" e a memória nativa com a cena pausada. |
| A cena pausada ainda desenhando (bateria) | O laço para na pausa. Teste automático: 0 quadros da cena fora da Central. |
| Rótulos ou toques ligados à tela antiga | `reanexar()` troca rótulos e callbacks; a pausa solta as referências. Testes de toque nos 5 alvos depois de 10 idas e voltas. |
| Elementos novos ou baú não aparecem por reaproveitar a cena | A chave inclui elementos e baú: se mudou, a cena é recriada. |
| Contexto WebGL perdido pelo sistema com a cena pausada | Ouvir `webglcontextlost`/`restored`: recriar a cena na volta, mostrando o "Montando…" atual. |
| Liberar geometrias compartilhadas afetar as fotos | O three.js reenvia na próxima foto. Teste: o retrato do HUD continua igual depois de destruir a cena. |
| Quedas de desempenho em aparelhos fracos | Manter o 2D e a qualidade leve como hoje. Medir a qualidade leve no aparelho de entrada. |

## 9. Critérios de aprovação da implementação futura

| # | Critério | Limite |
|---|---|---|
| 1 | Contextos WebGL criados em 24 idas e voltas (mesma qualidade) | **1** para a Central (mais o das fotos) |
| 2 | `WebGLRenderer` vivos no heap fora da Central, após coleta de lixo | ≤ 2 (cena pausada + fotos); 1 se a cena for destruída |
| 3 | Inclinação da memória total fora da cena (visitas 5 → 24) | ≤ 0,5 MB por visita (hoje 4,1) |
| 4 | Nós e ouvintes do DOM fora da cena após 24 visitas | iguais aos da 1ª visita (±5) |
| 5 | Entrada na Central da 2ª visita em diante (CPU normal) | ≤ 100 ms até a cena visível (hoje ~1,0 s) |
| 6 | Bloqueio da página depois de sair da Central | nenhuma tarefa longa acima de 100 ms causada pela cena (hoje 9–10 s) |
| 7 | Quadros perdidos na volta à Central | ≤ 2 quadros acima de 50 ms (hoje 6–9) |
| 8 | Cena pausada fora da Central | 0 quadros desenhados (laço parado) |
| 9 | Recriação (troca de qualidade, novo elemento) | 0 renderizadores antigos no heap depois; nenhum bloqueio acima de 100 ms na troca de tela |
| 10 | Visual e animações | capturas da Central (alta, leve, 2D, movimento reduzido) iguais às de hoje; aceno de chegada e gestos mantidos; os 5 rótulos e toques funcionando |
| 11 | Testes e build | `typecheck`, `npm test`, `build` e `build:android` passando |
| 12 | Aparelho real (quando houver) | No Moto G75 ou equivalente: bloqueio ao sair da Central < 100 ms; "Graphics" + nativa estáveis em 24 visitas; 0 ANR |

## 10. Limitações dos testes sem Android

- **GPU simulada (SwiftShader).**
  - A memória do processo da GPU (100–350 MB aqui) e os tempos de compilação e de destruição de contexto ficam muito acima de um celular.
  - No Android, a GPU roda **dentro do processo do aplicativo** e a memória aparece como "Graphics" no `dumpsys meminfo`.
  - O bloqueio de 9–10 s daqui corresponde ao de 1–1,6 s observado no Moto G75, mas a atribuição a `forceContextLoss` no aparelho **não foi medida**.
- **As causas 1 e 3 independem da GPU.** São referências em JavaScript e uma chamada síncrona, comprovadas por contagem exata, instantâneo do heap e perfil de CPU. A causa 2 (memória nativa por contexto) é específica de cada driver.
- **Quedas de quadros e tarefas longas na entrada** refletem a GPU simulada. Os números absolutos não valem para o aparelho.
- **Para confirmar no aparelho:** os mesmos scripts (`evidencias/cena3d-menu/scripts/`) podem rodar pelo `chrome://inspect` com um APK de depuração, conectando o Playwright por CDP, como descrito na auditoria do mapa. Isso exige gerar um APK de depuração, o que depende da sua autorização.

## 11. Preservação

- Nenhum arquivo do jogo foi alterado.
  - `git diff b0e8fe8 -- src public android tools vite.config.ts package.json .github` está vazio.
  - Este commit acrescenta só documentação: este relatório, o PDF e as evidências.
- As variantes V1–V4 foram montadas e compiladas numa cópia temporária fora do repositório.
- Não foram tocados: o site oficial, a configuração da prévia, os mapas, as pinturas, os personagens, a progressão e os dados salvos.
- Não houve merge, APK, publicação nem Região 3.

## 12. Evidências

`docs/relatorios/evidencias/cena3d-menu/`:

- **`resultados/`:**
  - `base-*` (versão atual: alta, leve, saída para o mapa);
  - `var-V1..V4-*` (variantes);
  - `perfil-cpu-*` (entrada e saída);
  - `heap-*` (contagem de objetos e caminhos de retenção);
  - `bruto-V3.json` (diferença por alocador).
- **`scripts/`:**
  - `instrumentar.js`
  - `visitas.cjs`
  - `perfil-cpu.cjs`
  - `heap-retencao.cjs`
  - `variantes.py` (como cada protótipo foi montado)
  - `resumo-tempos.cjs`
