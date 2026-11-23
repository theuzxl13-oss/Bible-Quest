# Bible Quest v0.7 — Reconstrução do personagem 3D

## 1. Diagnóstico do personagem anterior (v0.5–v0.6)

| Aspecto | Situação anterior | Por que não alcançava a qualidade desejada |
| --- | --- | --- |
| Tecnologia | Three.js; malhas geradas por código em tempo de execução (`src/character3d/anatomy.ts`, `hair.ts`, `clothing.ts`) | O modelo era montado com primitivas deformadas (esferas, cápsulas, tornos, superfícies de revolução) |
| Corpo | Peças separadas: braços em cápsulas, pernas em superfícies de revolução, mãos em cápsulas | Não havia uma malha anatômica contínua, só partes encaixadas |
| Rosto | Esfera esculpida por funções, olhos esféricos e lábios elipsoides | Sem topologia facial, sem textura de pele real; o resultado era "boneco" |
| Cabelo | Casca da cabeça mais tubos procedurais | Parecia capacete ou fios de massa; sem textura de cabelo real |
| Roupas | Superfícies paramétricas com dobras senoidais | Sem caimento físico; as dobras eram repetitivas |
| Animação | Grupos girados por funções de tempo | Sem esqueleto nem pesos de pele; as juntas não deformavam a malha |
| Personalização | Aparência centralizada (`CharacterAppearance`), com identidade em `data-appearance` | **Boa e mantida**: o problema era só o modelo |

## 2. Tecnologia escolhida

- **Modelo:** malha humana **MakeHuman (CC0)**, processada no **Blender 4.0** por scripts. O pipeline (`tools/personagem/`) é reprodutível.
- **Formato:** **glTF/GLB** com esqueleto, pesos, animações e morph targets. Compressão meshopt (`gltfpack`) e texturas WebP.
- **No navegador:**
  - Three.js (já usado no projeto) com GLTFLoader, MeshoptDecoder, SkeletonUtils e AnimationMixer.
  - React Three Fiber não foi adotado: o controle direto continua mais simples para os vários renderizadores (ao vivo e miniaturas).
- **Alternativa avaliada e descartada:** modelos de Mixamo e VRoid. As licenças não permitem redistribuir o arquivo no repositório, e as roupas são modernas ou de fantasia.

## 3. O que o modelo tem agora

- **Corpo:**
  - Malha anatômica contínua, com proporções de adulto jovem.
  - Duas estruturas (masculina e feminina), com mãos e pés detalhados (dedos com ossos).
- **Rosto:**
  - Topologia facial real e textura de pele real (três tons de base e ajuste fino em 6 tons).
  - Olhos com íris, sobrancelhas, cílios, dentes e língua.
- **Cabelo:** 7 cortes com textura de fios: curto, bem curto, médio, longo, cacheado, preso e trança. Qualquer cor, por tingimento.
- **Barba:** curta ou cheia, crescida da pele do rosto, com borda transparente gradual.
- **Roupas de época:**
  - Túnica: parte de cima e saia longa ou curta, **drapeadas por simulação de tecido**.
  - Mantos (padrão, longo, xale, capuz), também simulados.
  - Cintos (couro, corda, faixa), sandálias (simples, de tiras) e botas.
  - Listras e barras bordadas dos itens especiais, desenhadas no shader.
- **Acessórios:**
  - Presos à mão: cajado, pergaminho, lamparina e cesto.
  - Presos à cabeça: coroa de folhas.
  - Seguindo o corpo: bolsa, odre, colar e lenço.
- **Esqueleto:** 163 ossos, incluindo o rig facial.
- **Animações:** Idle, Walk, Run, Victory, Greeting e Discovery.
- **Expressões:** Piscar, Sorriso, Surpresa e Alegria, combinadas com as animações.

## 4. Limitações conhecidas

- **Realismo:** o MakeHuman tende ao realismo; o resultado é "realismo moderado", não o estilo de RPG estilizado com rosto esculpido à mão. Os cabelos são assets de 2014–2020 de qualidade média.
- **Roupas na animação:** as roupas são simuladas na pose de repouso e acompanham o corpo por pesos (skinning), sem simulação em tempo real. Em poses extremas (braços erguidos) há estiramento nas axilas.
- **Barba e lenço:** mais simples que o restante.
- **Sardas:** o rosto "Sardas" só aparece no modo 2D (no 3D a pele usa a textura do MakeHuman).
- **Peso:** cerca de 4,8 MB por corpo, carregado sob demanda e mantido em cache pelo navegador.
- **Acabamento de nível profissional:** exige um modelo de artista. O "contrato do modelo" está em `tools/personagem/README.md`, e o jogo aceita um GLB que o siga, sem mudar o código.
