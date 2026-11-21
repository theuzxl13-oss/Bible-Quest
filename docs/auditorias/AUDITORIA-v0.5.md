# Bible Quest v0.5 — Auditoria (Etapa 1) e decisões técnicas

## O que já existia e foi preservado (v0.1 a v0.4)

| Área | Situação encontrada |
| --- | --- |
| Tecnologia | React 19, TypeScript, Vite 8 (`base: './'`), HashRouter, Vitest, GitHub Actions → GitHub Pages |
| Estrutura | `data/` (conteúdo), `services/game/` (regras puras), `services/storage/` (repositórios com migração), `state/GameContext.tsx` (estado único), `pages/`, `components/` |
| Entrada | Boas-vindas → identificação (apelido e faixa etária) → personagem-base → personalização → chegada |
| Personagem | Aparência única (`CharacterAppearance`) salva no perfil e desenhada por um só componente; 36 itens com requisitos; guarda-roupa; tela de recompensa |
| Modo História | 66 livros, 10 mundos, Gênesis em 20 fases (5–10 perguntas), Êxodo em 4; mapa 2D sinuoso, baús, estrelas |
| Modo Quiz | Mapa próprio (4 regiões, 24 desafios), treino livre com 10 modalidades e 4 dificuldades, diário, multiplayer em demonstração |
| Complementos | Biblioteca (personagens, livros, lugares, acontecimentos, temas), linha do tempo, revisão inteligente, conquistas, estatísticas, rankings locais |
| Persistência | `localStorage` com migrações; serviços prontos para Supabase |

## Pontos a corrigir ou aprimorar

1. **Personagem plano.** O personagem era um desenho SVG por camadas. Era consistente, mas tinha visual simples e "de brinquedo". É o foco desta versão.
2. **Sem rotação nem zoom** na personalização.
3. **Sem opção de estrutura corporal, barba independente do rosto ou tingimento** das roupas.
4. **Desempenho:** o personagem aparece em muitas telas ao mesmo tempo (topo, mapas, cartões). Um visualizador 3D por tela esgotaria o limite de contextos WebGL do navegador (cerca de 16).
5. **Aparelhos fracos e sem WebGL** precisam de alternativa.

## Decisão técnica: Three.js puro, com modelo construído no código

### Tecnologias avaliadas

| Opção | Avaliação |
| --- | --- |
| **React Three Fiber** | Ótimo para cenas declarativas. Aqui o personagem precisa existir em dezenas de lugares, e o controle direto dos renderizadores (um ao vivo por tela e um compartilhado para miniaturas) é mais simples sem a camada extra. Também evita mais dependências. |
| **Modelos GLB/GLTF prontos** | Não há, com licença livre (CC0) e alcançáveis por este ambiente, humanos de boa qualidade com roupas da época bíblica. Modelos de serviços como Mixamo ou VRoid têm licenças que não permitem redistribuí-los dentro do repositório. Roupas modernas ou de fantasia contrariam o projeto. |
| **Three.js puro (escolhida)** | É leve (cerca de 165 KB comprimido) e carregado sob demanda: não pesa a primeira tela. Funciona no GitHub Pages sem servidor e dá controle total da qualidade gráfica. |

### Como o personagem 3D é feito (`src/character3d/`)

- **Cabeça.** Esfera esculpida por funções: órbitas, ponte e ponta do nariz, asas nasais, maçãs do rosto, lábios, queixo e mandíbula. Diferenças sutis entre as estruturas masculina e feminina.
- **Rosto.** Olhos com íris e pupila (textura procedural com brilho), pálpebras que piscam, cílios, sobrancelhas em tubo, orelhas e três expressões de boca (neutra, sorriso e alegria).
- **Cabelo.** Casca gerada a partir da forma da cabeça, com linha do cabelo natural e sulcos de mechas. Sete estilos: curto, longo, ondulado, cacheado (com cachos), coque, trança e raspado.
- **Barba.** Curta ou cheia.
- **Corpo.** Pescoço, braços articulados, mãos com cinco dedos que se fecham para segurar objetos, panturrilhas e pés com dedos.
- **Roupas.**
  - Túnica com dobras crescentes até a barra, cintura franzida e textura de tecido com trama.
  - Mangas largas.
  - Manto que cai dos ombros por trás dos braços (com capuz abaixado ou como xale com franjas).
  - Cintos de couro, corda trançada ou faixa.
  - Sandálias com tiras, sandálias de tiras cruzadas ou botas.
- **Acessórios.** Cajado (sempre apoiado no chão), pergaminho, lamparina com chama e luz, cesto, bolsa ou odre a tiracolo, lenço, coroa de folhas e colar de contas.
- **Iluminação.** Três pontos (principal quente, contraluz fria, preenchimento), ambiente para reflexos, mapeamento de tons ACES, sombra projetada e sombra de contato.
- **Animações procedurais.** Respiração e espera, caminhada, comemoração, descoberta, saudação e piscar.

### Consistência e desempenho

- Toda tela usa `Character`, que lê a aparência salva (`PlayerCharacter`).
- O elemento raiz sempre expõe `data-appearance` com a identidade visual completa, usada nos testes e na auditoria.
- Formas de exibição:
  - **ao vivo:** Home, guarda-roupa (com rotação 360°, zoom e vistas de frente, lado e costas), chegada, recompensa e resultado;
  - **imagem do mesmo modelo:** gerada por um renderizador compartilhado, com cache, para mapas, topo, cartões e fases;
  - **2D:** sem WebGL ou por escolha do jogador.
- Qualidade gráfica em Configurações:
  - **Automática:** detecta aparelhos com poucos núcleos ou pouca memória.
  - **Alta.**
  - **Leve:** sem sombras projetadas nem materiais físicos.
  - **2D.**
- A animação pausa quando o personagem sai da tela ou a aba fica oculta, e respeita "reduzir animações".

## Limitações conhecidas

- O personagem é **procedural**: não há escultura digital, captura de movimento nem cabelo fio a fio. A qualidade é de um RPG 3D estilizado leve, não de um jogo de console.
- As roupas não têm simulação física de tecido: as dobras são modeladas e o manto não reage aos braços erguidos.
- Em renderização por software (sem GPU), a primeira miniatura leva alguns segundos.
