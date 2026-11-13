# Próximos passos: personagem no estilo de animação 3D

Status: **aguardando o dono do projeto**. Retomar depois que ele estiver com o código no computador.

## O que foi pedido

Deixar os personagens e o jogo com estética de filme de animação 3D:

- olhos grandes e expressivos, cabeça um pouco maior e corpo esguio;
- cabelo volumoso em mechas macias;
- roupas de época "de personagem": linho com costuras e barras, faixa estampada, manto e capuz com caimento amplo, sandálias de tiras;
- pele quente e luz suave de estúdio;
- interface do jogo em tons quentes (areia, bege, terracota), cartões e botões mais arredondados, cenário de fundo.

Uma prévia foi gerada no Canva em 13/11/2026, na conta do dono do projeto (mídia `MAHawA5P0-E`).

## Restrição

Tudo **gratuito**, sem custo.

## Plano combinado (caminho gratuito)

1. **Interface** quente e suave, e **imagens de referência** do personagem (masculino e feminino, pose neutra; cabelos e roupas separados) para aprovação.
2. **Imagem para 3D** com o **TRELLIS** (Microsoft, licença MIT), pela demonstração gratuita no Hugging Face:
   - **Opção A:** o dono gera no navegador e envia o `.glb`.
   - **Opção B:** o Claude gera, se o acesso a `huggingface.co` for liberado no ambiente.
3. **Blender** (`tools/personagem/`): encaixar cabelo e roupas (simulação de tecido), esqueleto, animações e expressões, seguindo o "contrato do modelo" de `tools/personagem/README.md`.
4. **Integração** no jogo (`src/character3d/heroi.ts`), testes e publicação.

## Decisões pendentes do dono do projeto

1. **Autorizar a mudança da regra de imagens do `CLAUDE.md`.** Hoje só são permitidas imagens em domínio público do Wikimedia Commons. A mudança permitiria imagens e modelos gerados por IA, com origem e licença registradas.
2. **Escolher entre a opção A e a opção B** para gerar o modelo 3D.
3. **Aprovar** as imagens de referência e, depois, o primeiro modelo 3D, antes de produzir as variações.

## Limitações já explicadas

- As filas e cotas da demonstração gratuita podem atrasar o trabalho.
- Rosto e mãos gerados por IA precisam de correção.
- O resultado fica próximo da referência, mas não idêntico a um filme de animação.
- No começo haverá menos opções de roupa.
