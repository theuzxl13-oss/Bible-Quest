# Bible Quest — Auditoria de memória e desempenho do mapa pintado

**Etapa de auditoria e planejamento, sem mudanças no jogo** · branch `claude/bible-quest-android` · base `ff195a5` (região 2 aprovada) · 27/11/2026

> **Limitação principal, antes de tudo.** Não havia aparelho Android ligado a esta sessão: nenhum computador conectado e nenhum dispositivo por `adb`. Também não foi possível usar o emulador, porque o servidor não tem aceleração de virtualização (`/dev/kvm` ausente). **Nenhum número deste relatório foi medido num Android.** As medições foram feitas no **Chromium 140**, que usa o mesmo motor do Android System WebView (Blink, compositor `cc`, decodificador de imagens e GPU via Skia). A tela simulou um celular (412 × 915 px CSS, densidade 2,625, toque, modo móvel). Usei a mesma versão de produção do aplicativo Android (`vite build --mode android`) e as ferramentas internas de memória do próprio Chromium (`memory-infra`). A § 9 traz o roteiro para repetir tudo num aparelho, com os mesmos scripts.

## 1. Resumo

| Pergunta | Resposta medida |
|---|---|
| Quanto ocupam as duas regiões em **alta**? | **Cerca de 8 a 16 MB** na rasterização pela GPU, que é o modo normal do Android. Na rasterização por software, usada quando a GPU não é usável, são **23,4 MB**. A estimativa anterior de ~20 MB valia para imagens RGBA completas. Com a GPU, o Chromium decodifica a WebP no formato YUV, a 1,5 byte por pixel e não 4. |
| E em **leve**? | **5,9 MB** pela GPU e **6,9 MB** por software, para as duas regiões. |
| As duas ficam na memória ao mesmo tempo? | **Sim.** As duas imagens estão sempre no DOM, sem carregamento sob demanda. O arquivo das duas é lido ao abrir o mapa, e a decodificação acontece quando cada uma chega perto da tela. |
| Ao sair do mapa, a memória volta? | **Não de imediato.** O DOM e os ouvintes voltam ao nível do menu, então não há vazamento de elementos. Mas as imagens decodificadas ficam no cache do Chromium até ele precisar do espaço ou o sistema pedir memória. |
| Há duplicações? | **Sim, três tipos** (§ 5.4):<br>(a) por software, cada imagem é decodificada em tamanho cheio e de novo em meia escala;<br>(b) a cada nova visita ao mapa, o Chromium decodifica as imagens de novo e guarda outra cópia. Em 24 visitas, a soma chegou a **57 MB** antes de o cache se limpar sozinho;<br>(c) ao trocar a qualidade, as versões alta e leve ficam juntas no cache. |
| Liberar a referência (trocar o `src`) libera a memória? | **Não de imediato.** No teste, a memória continuou igual mesmo depois de um aviso de pressão moderada. Um aviso crítico libera só a parte que fica na GPU. A única liberação **imediata e garantida** foi com `ImageBitmap.close()` (§ 6.3). |
| Rolagem | **Lisa.** p95 = 16,7 ms (60 quadros por segundo) em todos os modos, sem nenhuma decodificação durante a rolagem. |
| Toque nos marcos | A janela da fase abre em **46 a 56 ms** em velocidade normal e em **~200 ms** com a CPU 4 vezes mais lenta. |
| Abertura do mapa | No modo 2D, com as imagens altas ou leves, leva **0,16 a 0,8 s**. A decodificação de cada pintura custa **10 a 57 ms**. Nos modos 3D, a abertura levou de 1,8 a 14 s aqui, e **a culpa não é das pinturas**: é a saída da cena 3D do menu e a foto do personagem, ambas na GPU simulada por software (§ 7.2). |
| Travamentos e ANR | O navegador não gera ANR. Fora do 3D, a maior tarefa longa foi de **97 ms**. No 3D com GPU simulada houve um bloqueio de 5,3 s, ao sair do menu e não no mapa. No Moto G75 real, o maior bloqueio registrado foi de 1,6 s (relatório de 24/11). |
| Projeção para 4 regiões | Pela GPU, **16,4 MB** medidos com 4 regiões simuladas em alta e mais cerca de 2,9 MB por região em leve. Por software, **46,7 MB** medidos em alta. As visitas repetidas podem dobrar esses valores por algum tempo (§ 8). |

**Conclusão.** O mapa pintado não é hoje o maior consumidor de memória do jogo. A cena 3D do menu pesa bem mais (§ 7.2). Mesmo assim, o crescimento é linear com o número de regiões e há três duplicações evitáveis. Por isso recomendo implementar o carregamento sob demanda **antes ou junto da região 3**. A proposta da § 10 limita o mapa a no máximo 3 pinturas decodificadas ao mesmo tempo e elimina as duplicações por visita e por troca de qualidade.

## 2. Arquitetura atual (diagnóstico do código)

**Caminho das imagens:**

1. `StoryMap.tsx` monta **todos os mundos** de uma vez numa coluna só (`ordem.map(... <JourneyMap/>)`). Não há virtualização.
2. `StoryMap.tsx:39` decide a versão: `leve = resolveQuality(settings.graphics) !== 'alta'`. Assim, as qualidades **leve** e **2D** usam `*-leve.webp`, e **automática** depende do aparelho. A decisão é tomada a cada renderização e muda na hora em que o jogador troca a qualidade.
3. `JourneyMap.tsx` (`dividirTrecho`) distribui os nós entre as regiões de `ARTES_DO_MUNDO['mundo-genesis'] = [ARTE_EDEN, ARTE_DILUVIO]` e cria uma `RegiaoTrilha` para cada uma. A ordem é invertida, com o Dilúvio em cima e o Éden embaixo.
4. `Trilha.tsx` desenha um `<img class="tr-arte" src=… width=1080 height=2257 decoding="async">` **sem `loading="lazy"`**, dentro de uma caixa com `aspect-ratio` fixo. Os marcos são botões HTML posicionados em % por cima da imagem.
5. `mapa-trilha.css`:
   - `.tr-arte` ocupa a caixa inteira (`object-fit: cover`) com máscara de esmaecimento no topo;
   - a regra `.tr-pintada + .tr-pintada .tr-arte` tira a máscara na emenda.

**O que isso significa para a memória:**

- **Arquivo (codificado).** As duas WebP da qualidade atual são pedidas assim que o mapa monta: 200 + 181 KB em alta, 74 + 66 KB em leve. No Android, saem do APK pelo `WebViewAssetLoader` do Capacitor, sem rede. O cache de memória do Blink mantém os bytes codificados (0,4–0,5 MB). Na segunda visita, o arquivo foi pedido de novo ao servidor.
- **Decodificado.** O compositor do Chromium decodifica cada pintura **quando um bloco da tela que a contém vai ser desenhado**, e não ao baixar. Como cada região tem só 861 px CSS de altura (412 × 2257/1080), quase sempre as duas estão perto da tela. Na prática, as duas acabam decodificadas.
- **Tamanho de desenho.** A 412 px CSS × 2,625 = 1.082 px físicos, a imagem alta (1.080 px) é desenhada em escala ~1:1 e decodificada inteira. A leve (648 px) é ampliada 1,67 vez e também decodificada inteira. Num aparelho com densidade 2, a imagem alta seria desenhada a 824 px e ainda assim decodificada inteira: o Chromium só usa níveis menores abaixo de 50 %.
- **Ao sair do mapa.** O React desmonta tudo. Os elementos `<img>` são coletados (conferido: os nós do DOM voltam ao valor do menu). Mas o cache de imagens decodificadas do compositor é separado do DOM e guarda as entradas como "descartáveis", até faltar espaço.
- **Quiz.** O mapa do Quiz usa o mesmo motor, mas ainda **não tem região pintada**. Hoje ele não consome memória de pintura.

## 3. Metodologia

| Item | Como foi feito |
|---|---|
| Aplicativo | Versão de produção Android (`vite build --mode android`) numa pasta temporária, servida localmente. **Nenhum arquivo de `src/` ou `public/` foi alterado.** |
| Motor | Chromium 140 (Playwright 1.63), o mesmo motor Blink/`cc`/Skia do Android System WebView. |
| Tela | 412 × 915 px CSS, densidade 2,625, `isMobile`, toque, agente de usuário de WebView Android. |
| Rasterização | Duas configurações:<br>**GPU** (`--enable-gpu-rasterization`), como no Android, mas com a GPU **simulada por software (SwiftShader)**, porque o servidor não tem placa de vídeo;<br>**software**, como num WebView sem GPU utilizável. |
| Memória | `memory-infra` do Chromium (`Tracing.requestMemoryDump`, nível detalhado), coletado em cada passo depois de uma coleta de lixo forçada. Separa:<br>• imagens decodificadas (`cc/image_memory`);<br>• cópias na GPU (`gpu/transfer_cache`);<br>• blocos da tela (`cc/tile_memory`);<br>• imagens codificadas (`web_cache/Image_resources`);<br>• JavaScript (`v8`) e DOM (`blink_gc`);<br>• a "pegada privada" de cada processo. Também registrei RSS e PSS (`/proc/<pid>/smaps_rollup`). |
| Percurso | Abrir o menu → abrir o mapa (fase atual 8, no Dilúvio) → ir ao Éden → ir ao Dilúvio → ir e voltar 6 vezes e subir até Êxodo → voltar ao menu → aviso de pressão de memória crítico → abrir o mapa de novo → trocar a qualidade nas Configurações e voltar ao mapa → rolar → voltar ao menu. |
| Combinações | Qualidade alta, leve e 2D × GPU e software, mais duas especiais:<br>• modo 2D **com as imagens altas**, trocadas só no teste por interceptação de rede, para medir as pinturas sem o 3D;<br>• projeção de **4 regiões**: cópias das duas pinturas criadas só na página do teste, com endereços diferentes. |
| Visitas repetidas | 24 idas e voltas entre menu e mapa (alta e 2D), com medida a cada 4 e aviso de pressão moderado e crítico no fim. |
| Tempos | CPU normal e **4 vezes mais lenta** (aproximação de um aparelho intermediário). Mediu:<br>• abertura do mapa a frio e a quente, 3 repetições;<br>• decodificações pelo rastro `devtools.timeline`;<br>• rolagem do mapa inteiro, 3 passadas de 3 s;<br>• toque em 10 marcos, abrindo e fechando a janela da fase;<br>• decodificação isolada de cada arquivo (`createImageBitmap`). |
| Reprodução | Os scripts estão em `docs/relatorios/evidencias/auditoria-memoria-mapa/scripts/` e os resultados em JSON na pasta ao lado. |

**Um erro de medição que encontrei e corrigi.** Na primeira rodada, o número de nós do DOM subia ~2.700 a cada visita ao mapa, o que parecia um vazamento. A causa era o próprio Playwright: `waitForSelector` devolve uma referência ao elemento e mantém viva a árvore desmontada. Sem essas referências, os nós voltaram exatamente ao valor do menu (622 → 622 em 6 visitas, no 2D). Todas as rodadas deste relatório foram refeitas sem elas.

## 4. Teoria: quanto cada imagem pode ocupar

| Arquivo | Pixels | Disco | RGBA (4 B/px) | YUV 4:2:0 (1,5 B/px) | YUV na GPU com mipmaps |
|---|---|---|---|---|---|
| `eden.webp` | 1080 × 2257 | 200 KB | 9,30 MB | 3,49 MB | 4,65 MB |
| `diluvio.webp` | 1080 × 2257 | 181 KB | 9,30 MB | 3,49 MB | 4,65 MB |
| `eden-leve.webp` | 648 × 1354 | 74 KB | 3,35 MB | 1,26 MB | 1,67 MB |
| `diluvio-leve.webp` | 648 × 1354 | 66 KB | 3,35 MB | 1,26 MB | 1,67 MB |

Os valores medidos batem com essas colunas byte a byte (por exemplo, 9.752.576 B = 9,30 MB e 3,49 MB por imagem alta). O arquivo em disco é **50 vezes menor** que a imagem decodificada. O que pesa é a imagem decodificada, não o download.

## 5. Resultados de memória

Unidades em MB (MiB). "Imagens" é a soma das imagens decodificadas no processo da página com as cópias na GPU.

### 5.1 Percurso completo, rasterização pela GPU (o modo do Android)

| Passo | Alta: imagens (página + GPU) | Leve | 2D (usa leve) | 2D com imagens altas |
|---|---|---|---|---|
| Menu inicial | 0 | 0 | 0 | 0 |
| Mapa aberto | 3,5 + 0 | 2,5 + 3,4 = **5,9** | 2,5 + 3,4 = **5,9** | 3,5 + 4,7 = **8,1** |
| No Éden | 3,5 + 4,7 = **8,2** | 5,9 | 5,9 | 8,1 |
| No Dilúvio / ida e volta ×6 | **8,2** | 5,9 | 5,9 | 8,1 |
| Voltou ao menu | **8,2** (continua) | 5,9 (continua) | 5,9 (continua) | 8,1 (continua) |
| Depois do aviso de pressão crítico | 3,5 + **0** | 2,5 + 0 | 2,5 + 0 | 3,5 + 0 |
| Mapa de novo | 7,0 + 4,7 = **11,7** | 5,1 + 3,4 = 8,4 | 5,0 + 3,4 = 8,4 | 7,0 + 4,7 = 11,7 |
| Trocou a qualidade e rolou | alta→leve: 6,1 + 8,1 = **14,1** | leve→alta: 12,1 + 12,7 = **24,8** | — | — |

Na primeira rodada, as duas imagens altas chegaram a ficar decodificadas ao mesmo tempo: 7,0 + 9,3 = **16,4 MB**. Esse é o teto das duas regiões altas juntas. Aquela rodada foi refeita só por causa da contagem do DOM (§ 3), que não afeta a decodificação. Nas rodadas finais, o Chromium manteve uma imagem alta de cada vez na GPU (~8,2 MB).

### 5.2 Rasterização por software (WebView sem GPU utilizável)

| Passo | Alta | Leve | 2D (leve) | 2D com imagens altas |
|---|---|---|---|---|
| Mapa aberto / percorrido | **23,5** | **6,9** | 6,7 | **23,3** |
| Voltou ao menu | 23,5 (continua) | 6,9 | 6,7 | 23,3 |
| Depois do aviso crítico | **23,5 (continua)** | 6,9 | 6,7 | 23,3 |
| Mapa de novo | 14,0 | 6,9 | 6,7 | 14,0 |
| Menu final | 0,1 (só depois da troca de qualidade) | 0,1 | 0 | 0 |

No caminho por software, cada imagem alta aparece decodificada **duas vezes**:
- **9,30 MB em tamanho cheio**;
- **2,33 MB em meia escala** (540 × 1129), criada pelos blocos de baixa resolução que o Chromium usa no celular durante a rolagem.

O total é 2 × (9,30 + 2,33) = **23,3 MB**.

### 5.3 Pegada total dos processos (contexto)

| Modo (GPU simulada) | Menu inicial | Com o mapa aberto | De volta ao menu |
|---|---|---|---|
| Alta (3D) | 345 MB | 329 MB | 469 MB |
| Leve (3D) | 294 MB | 292 MB | 352 MB |
| 2D | 153 MB | 206 MB | 202 MB |
| 2D por software | 77 MB | 97 MB | 92 MB |

**Como ler esta tabela.**
- O mapa **custa menos que o menu 3D**: abrir o mapa saindo do menu alto até reduz a pegada. O acampamento 3D, com GPU simulada, domina tudo.
- No caminho mais limpo (2D por software, sem 3D), o mapa soma ~20 MB à pegada: 16 MB no processo da página, com imagens, blocos da tela e DOM.
- A memória do "processo da GPU" aqui inclui a própria simulação SwiftShader. **Ela não representa a memória gráfica de um aparelho.** Por isso, as conclusões usam só os contadores de imagens e de blocos, que têm o mesmo significado num Android.

### 5.4 Duplicações e referências antigas

**(a) Meia escala (software).** Descrita acima: +25 % por imagem. Esse caminho só é usado quando o WebView não rasteriza pela GPU.

**(b) Nova cópia a cada visita.** Ao voltar ao mapa, o Chromium decodifica as pinturas **de novo** e cria entradas novas no cache, sem reaproveitar as anteriores. As antigas só saem quando o cache atinge o limite dele. Ida e volta entre menu e mapa, GPU:

| Visitas | Alta (3D): página + GPU | 2D (leve): página + GPU |
|---|---|---|
| 0 | 0 | 0 |
| 4 | 14,0 + 9,4 = 23,4 | 2,5 + 3,4 = 5,9 |
| 8 | 24,5 + 32,6 = **57,1** | 5,0 + 6,7 = 11,7 |
| 12 | 24,5 + 32,6 = **57,1** | 7,5 + 10,1 = 17,6 |
| 16 | 21,0 + 18,7 = 39,6 | 10,0 + 13,4 = 23,4 |
| 20 | 17,5 + 18,7 = 36,2 | 12,6 + 16,8 = **29,4** |
| 24 | 10,5 + 14,0 = 24,5 | 7,5 + 10,1 = 17,6 |
| Aviso moderado | 24,5 (sem mudança) | 17,6 (sem mudança) |
| Aviso crítico | 10,5 + **0** | 7,5 + **0** |

O crescimento **tem teto**: o próprio cache se limpa (57 → 24 MB em alta). Mas o pico fica **5 a 7 vezes acima** do valor de uma única visita (57 contra 8,2 MB em alta e 29,4 contra 5,9 MB no 2D). Cada visita também gasta CPU decodificando de novo (§ 7.1).

**(c) Troca de qualidade.** Depois de trocar alta → leve, as entradas da versão alta continuam no cache junto com as da leve: 14,1 MB contra 5,9 MB só da leve. Isso só se resolve com pressão de memória ou com o limite do cache. A troca de qualidade é rara, então o impacto é pequeno.

**Sem vazamento do DOM.** Em 6 visitas, com coleta de lixo antes de contar:
- os nós voltaram de 2.863 (mapa) para 622 (menu), sempre;
- os ouvintes de eventos subiram uma vez (177 → 190) e ficaram estáveis;
- a pegada do processo da página no 2D ficou estável (28,7 → 43 MB em 24 visitas, com as imagens dentro).

**Observação fora do mapa (risco a investigar).** No modo alto, em 24 visitas, a pegada total subiu de 408 para 593 MB, quase tudo no processo da GPU e no da página. No 2D, o processo da página ficou estável. A diferença aponta para a **cena 3D do menu**, recriada a cada volta, e não para o mapa. Não investiguei mais, porque está fora do escopo. Recomendo uma auditoria própria da limpeza do acampamento 3D.

### 5.5 Liberação: teste direto da premissa do carregamento sob demanda

Projeção com 4 regiões (as duas reais mais duas cópias com endereços diferentes, só na página do teste). Depois de percorrer todas, troquei o `src` das duas cópias distantes por uma imagem vazia de 1 pixel:

| Passo | GPU alta (página + GPU) | GPU leve | Software alta |
|---|---|---|---|
| 2 regiões percorridas (hoje) | 3,5 + 4,7 = 8,2 | 2,5 + 3,4 = 5,9 | 23,4 |
| **4 regiões** percorridas | 7,0 + 9,3 = **16,4** | 5,1 + 6,7 = **11,8** | **46,7** |
| As 2 distantes trocadas por imagem vazia | 16,4 (**sem mudança**) | 11,8 (sem mudança) | 46,7 (sem mudança) |
| + aviso moderado | 16,4 | 11,8 | 46,7 |
| + aviso crítico | 7,0 + **0** | 5,1 + 0 | **46,7 (sem mudança)** |
| 4 `ImageBitmap` da pintura alta criados | +37,6 MB na página | +13,5 MB | +37,7 MB |
| Os 4 fechados com `.close()` | **liberados na hora** | liberados na hora | liberados na hora |

**Consequência para a proposta.** Só "soltar a referência" **não devolve a memória na hora** no Chromium. Isso limita o que fica decodificado *daqui em diante*: imagens nunca desenhadas não são decodificadas. Mas não apaga o que já foi decodificado. O que garante um teto de verdade é:
- **não deixar decodificar o que está longe**: a imagem distante nem chega a ter `src`;
- **não multiplicar cópias por visita**.

## 6. Comparação alta × leve

| | Alta (1080 × 2257) | Leve (648 × 1354) | Leve / alta |
|---|---|---|---|
| Arquivo das 2 regiões | 381 KB | 140 KB | 37 % |
| Decodificado, GPU (2 regiões) | 8,2 a 16,4 MB | 5,9 MB | 36 a 72 % |
| Decodificado, software (2 regiões) | 23,4 MB | 6,9 MB | 29 % |
| Decodificação de 1 imagem, CPU normal | 26–27 ms | 10–11 ms | ~40 % |
| Decodificação de 1 imagem, CPU 4× mais lenta | 27–57 ms | 12–22 ms | ~45 % |
| Abertura do mapa no 2D, CPU 4× mais lenta (fria) | 0,53–0,80 s | 0,51–0,78 s | igual |
| Rolagem (p95) | 16,7–16,8 ms | 16,7–16,8 ms | igual |
| Nitidez num celular de 1.080 px | 1:1 | ampliada 1,67× (mais suave) | — |

Na prática, a leve corta a memória pela metade ou mais e não muda o tempo de abertura nem a rolagem. A alta só compensa em telas de 1.080 px físicos ou mais.

## 7. Resultados de desempenho

Medido com rasterização pela GPU (simulada) e 3 repetições. A coluna "CPU 4×" usa a CPU 4 vezes mais lenta.

### 7.1 Abertura do mapa (do toque até o primeiro quadro com as duas pinturas prontas)

| Modo | CPU normal, a frio | CPU normal, a quente | CPU 4×, a frio | CPU 4×, a quente |
|---|---|---|---|---|
| 2D (imagens leves) | 0,16–0,51 s | 0,06–0,08 s | 0,51–0,78 s | 0,26–0,28 s |
| 2D com imagens altas | — | — | 0,53–0,80 s | 0,25–0,39 s |
| Leve (3D) | 0,92–5,0 s | 3,4–3,8 s | 1,8–7,8 s | 4,8–5,4 s |
| Alta (3D) | 6,0–8,8 s | 11,1–11,3 s | 7,9–10,4 s | 13,6–14,2 s |

- Cada pintura gera **uma tarefa de decodificação** numa thread auxiliar, fora da thread principal: de 8 a 64 ms com a CPU 4×.
- Na volta ao mapa a quente, houve **2 a 3 decodificações novas**. É a duplicação (b) da § 5.4, que também custa tempo.
- Nenhuma decodificação aconteceu durante a rolagem.

### 7.2 Por que os modos 3D demoram tanto aqui (não são as pinturas)

Medi o que acontece na abertura no modo alto:
- uma tarefa longa de **5,3 s começa 75 ms depois do toque, antes de o mapa existir**;
- depois, mais duas tarefas (2,4 s e 0,8 s), quando a foto 3D do personagem fica pronta;
- as pinturas ficam prontas no mesmo instante em que o DOM do mapa aparece.

Ir do menu para as **Configurações** leva o mesmo tempo (4,75 s até a tela aparecer). Isso confirma que o custo é **a saída da cena 3D do menu**, mais a foto do personagem. As duas coisas rodam na GPU simulada por software, muito mais lenta que uma GPU de verdade. No Moto G75 real (relatório de 24/11), o bloqueio equivalente foi de **1 a 1,6 s**.

**Isso fica fora do escopo do mapa, mas é o maior gargalo de tempo encontrado.**

### 7.3 Rolagem (mapa inteiro, 4.187 px, 3 passadas de 3 s)

| Modo | p95 do quadro | Pior quadro | Quadros > 33 ms | Tarefas longas |
|---|---|---|---|---|
| Todos, CPU normal | 16,7 ms | 16,8 ms | 0 | 0 |
| Alta, CPU 4× | 16,7 ms | 66,8 ms | 3 de 536 | 1 (54 ms) |
| Leve, CPU 4× | 16,8 ms | 50,0 ms | 1 de 541 | 0 |
| 2D, CPU 4× | 16,7 ms | 83,3 ms | 2 de 539 | 1 (97 ms) |
| 2D com imagens altas, CPU 4× | 16,8 ms | 50,0 ms | 1 de 543 | 0 |

### 7.4 Resposta ao toque (janela da fase)

| Modo | CPU normal: até a janela abrir | CPU 4×: até a janela abrir | Duração do evento, p95 (CPU 4×) |
|---|---|---|---|
| 2D | mediana 46 ms, p95 64 ms | mediana 196–210 ms, p95 283 ms | 112–144 ms |
| Leve / alta | mediana 56 ms | mediana 213–229 ms | 88–104 ms |

As fases 9 e 10 (bloqueadas) não abrem janela, e o resultado é o aviso de fase bloqueada, como esperado. Por isso ficaram fora das medianas.

### 7.5 Travamentos e ANR

- O navegador não gera ANR. O equivalente útil é a maior tarefa longa na thread principal da página: **97 ms** fora do 3D e 5,3 s no 3D com GPU simulada, ao sair do menu.
- No Android, a página do WebView roda num processo separado (`sandboxed_process`). Um bloqueio dela aparece como "WebView sem resposta" e toques ignorados, não necessariamente como um ANR do aplicativo.
- O teste físico anterior teve 0 ANR em 11 aberturas.

## 8. Impacto estimado das regiões 3 e 4

Estimativa supondo regiões do mesmo tamanho (1080 × 2257). Os números com ✔ foram **medidos** na projeção da § 5.5. Os outros são calculados.

| Cenário | 2 regiões (hoje) | 3 regiões | 4 regiões |
|---|---|---|---|
| GPU, alta, regime normal | 8,2–16,4 ✔ | ~24 | **16,4 ✔** a ~33 |
| GPU, alta, depois de visitas repetidas (pior caso) | 57 ✔ | ~85 | **~115** (extrapolado) |
| GPU, leve | 5,9 ✔ | ~8,8 | **11,8 ✔** |
| Software, alta | 23,4 ✔ | ~35 | **46,7 ✔** |
| Software, leve | 6,9 ✔ | ~10,4 | ~13,9 |
| Arquivos no APK (alta + leve) | 521 KB | ~780 KB | ~1,04 MB |

**Com a proposta da § 10** (no máximo a região atual e as vizinhas decodificadas, sem cópias por visita), o teto passa a ser fixo, **qualquer que seja o número de regiões**:
- ≤ 3 regiões altas: ≤ ~25 MB pela GPU e ≤ ~35 MB por software;
- normalmente 2 regiões: ~16 MB e ~23 MB;
- na leve: ≤ ~9 MB.

O Gênesis completo (20 fases, 4 regiões) e os mundos seguintes não aumentam esse teto.

## 9. Limitações dos testes

1. **Nenhuma medição em Android.** Não havia aparelho conectado e não havia aceleração para o emulador. O Chromium tem o mesmo motor, mas no Android:
   - a GPU roda **dentro do processo do aplicativo**, e as texturas aparecem em "Graphics" no `dumpsys meminfo` do app;
   - a página roda no `sandboxed_process` do WebView, que não entra na conta do app;
   - os limites de cache dependem da memória do aparelho e o sistema avisa da falta de memória por conta própria, não com o aviso simulado deste teste.
2. **GPU simulada (SwiftShader).** A memória e o tempo do processo da GPU e de tudo o que é 3D ficam muito acima do real. Por isso, não use a "pegada total" como número de aparelho. Use os contadores de imagens e de blocos.
3. **"Memória Java"** não existe no navegador. No Android, o Java do app (Capacitor, ponte) é pequeno, e as imagens **nunca** passam pelo heap Java. Ficam na memória nativa do processo da página e na memória gráfica do app. Esta separação só pode ser confirmada no aparelho.
4. **CPU 4×** é só uma aproximação de um aparelho intermediário. Os tempos de decodificação de um celular de entrada podem ser 2 a 3 vezes maiores.
5. **Tela de 412 px CSS.** O Moto G75 tem 320 px CSS. Com isso, cada região fica com 669 px CSS de altura e a imagem alta continua desenhada em escala ~1:1.
6. A troca de imagem nas combinações "2D com imagens altas" e as regiões copiadas na projeção existiram **só na página do teste**. Nada disso foi incorporado ao jogo.

**Roteiro para confirmar num aparelho, quando houver um:**
- Precisa de um APK de depuração com a depuração do WebView ligada (o Capacitor já liga em builds de depuração), o que exige a sua autorização.
- Abra o túnel e use os **mesmos scripts** deste relatório, pelo Playwright com `connectOverCDP('http://localhost:9222')`:

```bash
adb forward tcp:9222 localabstract:webview_devtools_remote_$(adb shell pidof com.kzanntech.biblequest)
```

- Em cada passo do percurso, colete também:

```bash
adb shell dumpsys meminfo com.kzanntech.biblequest
```

```bash
adb shell dumpsys meminfo | grep -i sandboxed
```

```bash
adb shell dumpsys gfxinfo com.kzanntech.biblequest
```

- Separe Java, nativa e gráfica (linhas "Java Heap", "Native Heap", "Graphics"/"GL mtrack") e anote os ANR do `logcat`, como no teste do Moto G75.
- Aparelhos sugeridos: um de entrada (2–3 GB) e um intermediário (4–6 GB), como no roteiro de testes físicos já publicado.

## 10. Proposta: carregamento sob demanda das regiões

### 10.1 Princípios

1. **A caixa de cada região nunca muda de tamanho.** A caixa já tem `aspect-ratio` fixo e os marcos ficam em %. Por isso a rolagem, os pontos das fases, o `scrollIntoView` da fase atual e a emenda continuam exatamente iguais. O que muda é só o conteúdo da `<img>`.
2. **Nunca existe espaço vazio nem imagem quebrada.** Toda região mostra no mínimo uma **miniatura** da própria pintura: por exemplo, 54 × 113 px, com ~1–2 KB e 24 KB decodificada. Ela fica sob a pintura, desfocada pelo próprio aumento, e tem a mesma cor média da pintura. Se o arquivo grande falhar, a miniatura fica e a tentativa se repete uma vez.
3. **A pintura só entra quando já está decodificada.** O carregamento cria uma `Image` fora da página, chama `await decode()` e só então troca o `src` visível. Com isso não há "flash" de quadro vazio, nem decodificação na thread principal, nem pintura aparecendo pela metade.

### 10.2 Estados de cada região

| Estado | Quando | O que tem |
|---|---|---|
| **longe** | A mais de 2 telas da área visível | Só a miniatura. Nenhum `src` grande, então nada é decodificado. |
| **perto** | Até 1,5 tela da área visível | Arquivo pedido e decodificado em segundo plano, pronto para quando chegar. |
| **visível** | Dentro da tela | Pintura completa. |

- **Histerese.** Uma região sobe de "longe" para "perto" a 1,5 tela e só desce de volta a mais de 3 telas. Isso evita carregar e soltar repetidamente quem rola para cima e para baixo na divisa.
- **Detecção.** Um `IntersectionObserver` por mapa, com duas margens: 150 % e 300 %. O observador não usa a thread principal durante a rolagem.
- **Emenda.** Se a emenda está na tela, as duas regiões estão a menos de 1 tela e, portanto, ambas estão "perto" ou "visível". Nunca aparece metade pintura e metade miniatura na junção quando a rolagem é normal. Numa rolagem muito rápida pode passar por um instante uma miniatura desfocada, nunca um buraco.
- **Abertura do mapa.** A região da fase atual e a vizinha no sentido do caminho são pedidas **antes** de aparecer o primeiro quadro. Cada uma leva 10–57 ms medidos. O mapa abre como hoje, com a pintura no lugar.
- **Teto fixo.** No máximo **3 pinturas** com `src` grande ao mesmo tempo: a visível e as duas vizinhas. Com 4, 8 ou 20 regiões, o teto é o mesmo.

### 10.3 Eliminar as duplicações

- **Por visita (§ 5.4 b).** Manter, fora do React, um pequeno registro das últimas 2–3 pinturas já decodificadas (`Map` de endereço → elemento `Image` decodificado), que sobrevive à desmontagem do mapa. Na volta ao mapa, as regiões reaproveitam esses objetos em vez de criar imagens novas.
  - **Primeiro passo da implementação:** medir se o Chromium reaproveita a decodificação nesse caso.
  - **Se não reaproveitar:** usar a alternativa B (§ 10.5), que tem liberação garantida.
- **Troca de qualidade (§ 5.4 c).** Ao trocar, as regiões carregadas recebem a nova versão pelo mesmo caminho do `decode()`, e o registro esvazia as entradas da versão antiga. Hoje a troca deixa as duas versões presas no cache.
- **Meia escala (§ 5.4 a).** Acontece só por software e não dá para evitar por página. O teto de 3 regiões já a limita.

### 10.4 O que não muda

- Os arquivos `eden*.webp`, `diluvio*.webp` e as pinturas aprovadas.
- Os pontos das fases (`artes.ts`), a ordem dos nós, as fases, os baús, a progressão e os dados salvos.
- O motor História/Quiz (`RegiaoTrilha`) continua o mesmo, ganhando só o comportamento da imagem.
- A regra de emenda do CSS e a máscara da pintura mais alta.
- A escolha alta/leve (`resolveQuality`).

### 10.5 Alternativas, se o WebView continuar segurando as imagens decodificadas

| Alternativa | Como | Ganho | Custo e risco |
|---|---|---|---|
| **A. `srcset` por densidade** | Uma terceira versão de 824 px para telas de densidade ≤ 2 (`srcset` com descritores `w`). | −42 % por imagem nessas telas, sem mudar a lógica. | Mais um arquivo por região, ~130 KB. Os pontos continuam em %, sem risco. |
| **B. `ImageBitmap` com `.close()`** | Decodificar com `createImageBitmap` e desenhar num `<canvas>` do tamanho da região. | **Liberação imediata e garantida** (medida). | O canvas tem memória própria (~9,8 MB em alta). Só compensa se o canvas for do tamanho da tela e redesenhado na rolagem, o que é mais complexo. Último recurso. |
| **C. Fatiar cada região** | Cortar cada pintura em 2–3 faixas horizontais. | Só as faixas perto da tela são decodificadas (−33 a −50 % do pico). | Mais arquivos e risco de linha fina na emenda das faixas em densidades fracionárias. Exige 1 px de sobreposição e conferência pixel a pixel. |
| **D. `content-visibility: auto`** | Nas regiões fora da tela. | Menos trabalho de pintura e de blocos. | Não libera imagens decodificadas. É só um complemento. |
| **E. Pedir memória ao WebView** | No Android, ao receber `onTrimMemory`, o próprio WebView já reduz caches. | Automático. | Não é controlável pela página. Serve para confirmar no aparelho. |

Recomendação: **10.2 + 10.3 primeiro.** **A** se o aparelho mostrar pouca margem. **B** e **C** só se as medições no aparelho mostrarem que o teto não está sendo respeitado.

### 10.6 Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Miniatura aparecendo por um instante ao rolar muito rápido | Margem de 1,5 tela e decodificação em segundo plano. A miniatura tem a mesma cor e composição da pintura, então não há buraco. |
| Salto ou deslocamento da rolagem ao trocar a imagem | Caixa com `aspect-ratio` fixo (já é assim). Teste automático compara a posição de cada marco antes e depois da troca. |
| Emenda com uma pintura carregada e a outra não | As duas ficam "perto" quando a emenda está a menos de 1 tela. Teste em 100 posições de rolagem. |
| Fase atual em região "longe" ao abrir | A região da fase atual é carregada antes do primeiro quadro, independentemente do observador. |
| Imagem quebrada (arquivo ausente ou erro de decodificação) | `onerror` mantém a miniatura e tenta de novo uma vez. Teste com o arquivo bloqueado. |
| Carregar e soltar repetidamente na divisa | Histerese (1,5 tela para entrar, 3 telas para sair). |
| Memória não liberada na hora (§ 5.5) | O teto vem de não decodificar o que está longe e de não duplicar, não de "soltar". As medições de aceitação conferem o teto. |
| Testes em jsdom sem imagens reais | A lógica dos estados é testada com `IntersectionObserver` simulado. A memória é conferida com os scripts deste relatório. |
| Regressão no toque | Os marcos são botões independentes da imagem. O teste de toque (29/29) é repetido. |

## 11. Critérios objetivos para validar a implementação futura

Todos medidos com os scripts deste relatório (com os mesmos parâmetros) e, quando houver, num aparelho real.

| # | Critério | Limite de aprovação |
|---|---|---|
| 1 | Pinturas com `src` grande ao mesmo tempo | **≤ 3** em qualquer posição de rolagem, com 2 ou com 4 regiões (simuladas). |
| 2 | Imagens decodificadas, GPU, alta, regime normal, 4 regiões | **≤ 25 MB** (hoje: 16,4 medidos com 4 regiões, sem teto). |
| 3 | Idem, software, alta, 4 regiões | **≤ 35 MB** (hoje: 46,7). |
| 4 | Idem, leve, 4 regiões | **≤ 9 MB** (hoje: 11,8). |
| 5 | Crescimento por visitas repetidas (24 idas e voltas) | Imagens depois da 24ª visita **≤ 1,1 ×** o valor da 1ª (hoje: pico de 7 ×). |
| 6 | Troca de qualidade | Depois da troca e de 1 rolagem, **só a nova versão** com `src` no DOM, e o registro sem entradas da antiga. |
| 7 | Rolagem | p95 ≤ 16,8 ms. No máximo 1 % dos quadros acima de 33 ms com a CPU 4×. Nenhuma tarefa longa acima de 100 ms causada pelo mapa. |
| 8 | Abertura do mapa no 2D (CPU 4×) | ≤ abertura atual + 10 % (hoje: 0,51–0,80 s a frio). Pintura da fase atual presente no **primeiro** quadro visível. |
| 9 | Emenda | Folga de 0 px. Em 100 posições de rolagem com a emenda na tela, as duas regiões com a pintura completa. |
| 10 | Marcos | Posições em px idênticas às de hoje, com o teste do motor travando os pontos. Toque 29/29. Janela da fase ≤ 100 ms com a CPU normal. |
| 11 | Sem buracos e sem flash | Em 200 capturas durante a rolagem normal, nenhum quadro com área sem pintura nem miniatura. Com o arquivo bloqueado, aparece a miniatura e não um ícone de imagem quebrada. |
| 12 | Testes e build | `typecheck`, `npm test` (266 + novos) e `build` passando. |
| 13 | Aparelho real (quando houver) | 0 ANR e 0 "WebView sem resposta" no percurso da § 3. Diferença de "Graphics" + nativa entre menu e mapa **≤ 40 MB** num aparelho de entrada. |

## 12. Preservação

- Nenhum arquivo do jogo foi alterado: `git diff ff195a5 -- src public android tools` está vazio.
- Este commit só acrescenta o relatório e a pasta de evidências, com os scripts e os resultados em JSON.
- README, CHANGELOG e ROADMAP não foram tocados (regra A21).
- A versão Android usada nas medições foi gerada numa pasta temporária fora do repositório.
- Não foi gerado APK.
- Não comecei região 3, região 4, Quiz pintado nem Êxodo, e não fiz merge nem publicação.

## 13. Evidências

Pasta `docs/relatorios/evidencias/auditoria-memoria-mapa/`:

- **`resultados/`**:
  - percursos `gpu-*.json` e `software-*.json`;
  - visitas repetidas `ciclolongo-*.json` e `ciclos-gpu-*.json`;
  - projeção `proj-*.json`;
  - tempos `tempo-*.json`.
- **`scripts/`**:
  - `dump.cjs` (memória por processo);
  - `cenarios.cjs` (percurso);
  - `ciclos-longo.cjs` (visitas repetidas);
  - `vaza.cjs` (contagem do DOM);
  - `projecao.cjs` (4 regiões e liberação);
  - `desempenho.cjs` (tempos);
  - `sonda3d.cjs` (abertura no 3D).
- Os despejos brutos (~70 MB) ficaram fora do repositório.
