# Editor de personagens 3D modular: análise e plano (Etapas 1 a 3)

Pedido do dono do projeto em 13/11/2026. Este documento registra a análise do que já existe, a arquitetura proposta e os modelos 3D necessários, antes da implementação.

## Etapa 1: o que já existe e pode ser reaproveitado

| Parte | Onde está | Situação |
| --- | --- | --- |
| Editor (guarda-roupa) | `src/pages/onboarding/Wardrobe.tsx` (`/personagem/personalizar` e `/guarda-roupa`) | Abas Rosto, Cabelo, Cor do cabelo, Barba, Túnica, Manto, Cinto, Sandálias e Acessórios. Tem visão 3D, frente/lado/costas, giro de 360°, zoom, "Voltar à aparência padrão" e "Finalizar personagem". **Base do novo editor** |
| Visualizador 3D | `src/character3d/runtime.ts` (`createViewer`, `snapshot`) | Usa um renderizador ao vivo e um renderizador compartilhado para miniaturas, com rotação, zoom, vistas, qualidade automática e reserva 2D. O GLB fica em cache (não é baixado de novo), mas cada mudança remonta o personagem a partir do cache |
| Modelo modular v0.7 | `src/character3d/heroi.ts` + `tools/personagem/` | **Já é modular**: corpo com esqueleto compartilhado de 163 ossos e peças separadas no mesmo esqueleto (7 cabelos, túnicas, 4 mantos, 3 cintos, 3 calçados, 2 barbas e acessórios), mostradas ou escondidas. Estilo realista, não de animação |
| Modelo estilizado v0.8 | `heroi-masculino.glb` | Estilo de animação, mas é **uma peça só** (corpo, cabelo e roupa juntos). Personaliza só as cores, pelas regiões |
| Shader de cor | `tingirRegiao` em `heroi.ts` | Troca a cor de uma região preservando textura, luz e detalhes. Hoje é recriado a cada mudança |
| Dados da aparência | `CharacterAppearance` (`src/types`), `data/character/{bases,items,look}.ts` | 8 bases, itens com desbloqueio por progresso, tingimentos e migração de perfis antigos |
| Salvamento | `src/services/storage/` (repositórios sobre o `localStorage`) | A aparência fica em `Profile.character`. As telas não acessam o `localStorage` diretamente |
| Testes | `src/test/personagem.test.ts` e outros | 117 testes |

## Etapa 2: arquitetura proposta (adaptada aos nomes do projeto)

O projeto usa nomes em português e pastas `character3d/`, `data/character/` e `services/`. O editor fica nessa organização, em vez de criar uma árvore paralela (`features/`), para não duplicar código.

```
src/
  character3d/
    pecas.ts          catálogo das peças 3D (id, tipo, arquivo, encaixe, regiões de cor)
    montagem.ts       encaixa e remove peças no esqueleto compartilhado, sem recarregar o corpo
    cores.ts          shader de região com uniforms: troca de cor ao vivo, sem remontar
    heroi.ts          (modificado) usa montagem.ts e cores.ts
    runtime.ts        (modificado) setAppearance distingue troca de cor, troca de peça e troca de corpo
  components/character/editor/
    CharacterEditor.tsx     layout: personagem no centro, categorias ao lado, opções e cores
    EditorCategorias.tsx
    EditorOpcoes.tsx        miniaturas 3D reais (renderizador compartilhado)
    SeletorDeCor.tsx        paletas por categoria e cor livre
    ControlesDaVisao.tsx    girar, zoom, frente/lado/costas
  data/character/
    aparencia.ts      aparência v3: cores livres, olhos (cor e formato), expressão; migração da v2
  services/game/
    aparencia.ts      selecionar, restaurar, salvar e carregar (repositórios existentes)
public/models/personagem/
  corpos/  cabelos/  roupas/  acessorios/  calcados/
```

- **Sem remontar a cada clique.** Troca de cor muda só os uniforms do shader. Troca de peça carrega o GLB da peça uma vez (cache) e liga a malha ao esqueleto já montado. Só a troca de corpo remonta.
- **Descarte de memória.** Materiais e texturas das peças removidas são descartados, e as geometrias compartilhadas ficam no cache. Continua havendo um único renderizador de miniaturas.
- **Salvamento.** Apenas identificadores, cores e configurações, nos repositórios atuais. Perfis antigos são migrados sem perder progresso.
- **Interface.** A tela `/guarda-roupa` e o passo de personalização passam a usar o novo editor, com a identidade visual do jogo.

## Etapa 3: modelos 3D necessários

**Limitação importante.** O TRELLIS.2 gera **uma malha só** por imagem: corpo, cabelo e roupa fundidos. Ele não gera peças que se encaixam umas nas outras. Para um editor modular de verdade, as peças precisam de outra origem:

| Componente | Como produzir (gratuito) | Situação |
| --- | --- | --- |
| Corpo base estilizado (masculino e feminino), com roupa de baixo simples, cabeça, olhos e sobrancelhas | TRELLIS.2 com imagem do corpo de roupa simples e cabelo curto colado. Esqueleto e regiões pelos scripts atuais | **Prontos com esqueleto e animações em 14/11/2026** (`tools/personagem/estilizado/corpos-base/corpo-*-rig.glb`); faltam regiões de cor e expressões |
| Cabelos (curto, médio, longo; liso, ondulado, cacheado; trança, coque, véu) | TRELLIS.2 com imagem só do penteado, encaixado na cabeça do corpo base (peso no osso da cabeça) | **A produzir** (cerca de 10 gerações) |
| Roupas: túnicas, vestidos, mantos, capas, faixas, cintos | Scripts do Blender (simulação de tecido sobre o corpo base, como em `vestes.py`), na paleta do estilo. Assim se encaixam sem atravessar o corpo | **A produzir** por script, sem cota |
| Calçados (sandálias, sandálias de tiras, botas) | Scripts do Blender sobre os pés do corpo base | **A produzir** por script |
| Acessórios (cajado, pergaminho, lamparina, bolsa, odre, cordão, coroa) | TRELLIS.2 por objeto, preso ao osso (mão, cintura, pescoço, cabeça) | Há versões simples (v0.7). **Versões estilizadas a produzir** (cerca de 7 gerações) |
| Olhos: cor da íris | Região de cor da íris no shader | Possível no corpo base |
| Olhos: formatos | Morph targets (formas) no rosto do corpo base | **A produzir** por script |
| Expressões | Morph targets atuais (Piscar, Sorriso, Surpresa, Alegria) | Existe |
| Personagens prontos (8) | Continuam como "aparência inicial" de cada base, montados com as peças acima | |

Com a cota gratuita (cerca de 2 gerações por dia), as cerca de 19 gerações levam perto de 10 dias. Roupas e calçados por script não dependem da cota.

Enquanto as peças não existem, o editor funciona com o que há: os modelos estilizados de peça única, com troca de cores, e o modelo modular v0.7. O catálogo mostra o que falta.

## Andamento

- **13/11/2026, v0.9.0:**
  - Feito: cores livres por região com troca ao vivo, expressão de repouso, restaurar original, salvar, categorias laterais e testes.
  - A fazer:
    - referências do corpo base: o gerador do Canva insistiu em folhas de peças ou em manter as roupas;
    - geração 3D do corpo base;
    - cabelos e acessórios estilizados;
    - roupas e calçados por script;
    - cor e formato dos olhos;
    - encaixe de peças (`montagem.ts`).
