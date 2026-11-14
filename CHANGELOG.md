# Histórico de atualizações

Todas as versões do Bible Quest, da mais recente para a mais antiga. Cada mudança no projeto ganha uma entrada no topo deste arquivo.

## 0.16.2 — 14/11/2026 — Etapa 1: ponto de retorno e publicação estável

Sem mudança no jogo: personagens, mapas, perguntas e conteúdo bíblico ficaram iguais.

- **Ponto de retorno:** tag anotada `v0.16.1` no commit `5a1a21f`, a versão auditada. Ela foi criada no repositório local da sessão, mas o envio ao GitHub foi recusado pela conexão da sessão; a criação no GitHub fica com o dono do projeto (passo a passo em `docs/planos/PUBLICACAO-E-BACKUP.md`).
- **Causa da falha na publicação:**
  - o ambiente `github-pages` só aceita os ramos `claude/...`, por isso toda publicação pelo `main` era recusada em 2 segundos (execuções 37, 39 e 41);
  - todas as execuções usavam o grupo `pages` com `cancel-in-progress: true`, então o envio ao `main` cancelava a publicação válida do ramo de desenvolvimento (execuções 38 e 40).
- **Correção (não percebida antes):** a versão 0.16.0 nunca foi publicada sozinha. O site ficou na 0.15.0 até a publicação da 0.16.1. A conferência daquela hora procurou um texto (`av-cena`) que já existia na 0.15 e deu falso positivo.
- **Novo workflow** (`.github/workflows/deploy.yml`):
  - produção só pelo `main`;
  - `claude/**` e pull requests só verificam;
  - grupo de publicação `pages-producao` sem cancelamento;
  - permissões de publicação só no job que publica;
  - conferência dos arquivos gerados (`index.html`, scripts, modelos e caminhos relativos).
- **Documentação:** `docs/planos/PUBLICACAO-E-BACKUP.md` (processo, histórico, retorno e limitações); seção de publicação do README.
- **Verificação:**
  - o ramo de desenvolvimento só verificou (execução 44);
  - duas publicações seguidas pelo `main` deram certo: execução 45 (envio) e execução 46 ("Run workflow"), implantações 7790588720 e 7790604371;
  - o site serve os mesmos arquivos da versão auditada;
  - as 23 telas abriram sem erro no site publicado.
- **Pendente:** criar a tag `v0.16.1` no GitHub.

## 0.16.1 — 14/11/2026 — Auditoria geral e plano oficial de evolução

- Novo documento `docs/auditorias/AUDITORIA-GERAL-v0.16.md`, com:
  - diagnóstico de arquitetura, telas, estado, persistência, mapas, personagens, conteúdo, testes, build e publicação, com evidências e classificação de cada funcionalidade;
  - pontos fortes, problemas por gravidade, arquitetura recomendada (mapas em camadas e esqueleto padrão para o 3D), roadmap E0–E10, dependências, critérios de aceitação, esforço e riscos.
- Sem mudança no jogo: o plano aguarda aprovação.
- `ROADMAP.md`: contagem de fases de Gênesis corrigida (20) e referência ao novo plano.

## 0.16.0 — 14/11/2026 — Cena da fase, cenário de Êxodo e telas do acampamento no visual de aventura

- **Cena narrativa da fase** (a história antes das perguntas):
  - acontece sobre a paisagem da região da fase, com faixa de pergaminho no topo (voltar ao mapa, quadros da cena e "Pular");
  - a introdução mostra a pintura da fase numa moldura de madeira;
  - personagens bíblicos em cartões de pergaminho e o personagem do jogador ao lado, também no celular;
  - o texto fica num pergaminho com o título numa faixa; as referências bíblicas parecem um rolo, com as pontas de madeira;
  - os avisos de narrativa dramatizada e a fonte do texto bíblico continuam iguais.
- **Cenário próprio para Êxodo:** quatro regiões no mapa e nas partidas.
  - O rio Nilo: cesto entre os juncos, pirâmide e palmeiras;
  - O deserto de Midiã: a sarça ardente, ovelhas e tenda;
  - As pragas no Egito: porta marcada da Páscoa, obelisco e casas;
  - O mar e o monte Sinai: o mar aberto, o monte com nuvem e relâmpago, as tábuas e a coluna de fogo.
- **Biblioteca, Conquistas e Perfil:** placa de pergaminho no topo, botão de voltar ao acampamento, paisagem ao fundo (biblioteca antiga, salão das conquistas e acampamento) e painéis de pergaminho e madeira. Todo o conteúdo e as funções continuam os mesmos, e o menu inferior continua.
- **Novos arquivos:** `src/components/map/aventura/PaginaAventura.tsx` (moldura das telas) e o cabeçalho `CabecalhoPagina`.
- **Testes:** 144, com 3 novos (regiões de Êxodo, cena da fase e as três telas).

## 0.15.0 — 14/11/2026 — Perguntas e resultado no visual de aventura (etapas 5 e 6)

- **Tela de perguntas:**
  - A partida acontece sobre a paisagem da região da fase: céu, montanhas, chão e marcos. Exemplos: a arca nas fases de Noé, a torre em Babel, pirâmide e celeiro no Egito, e no Quiz a biblioteca, o templo e os pergaminhos do desafio.
  - O cabeçalho virou uma faixa de pergaminho, com botão redondo de sair, progresso, sequência de acertos e moeda de pontos.
  - O cartão da pergunta é de madeira emoldurada.
  - O personagem fica com a fala ao lado também no celular.
  - A barra superior do site some durante a partida.
- **Tela de resultado:**
  - pergaminho sobre a mesma paisagem, faixa com o título e personagem comemorando com raios de luz;
  - estrelas grandes (a do meio maior) e placas de madeira com acertos, erros, aproveitamento e pontos;
  - moeda de XP que gira ao entrar, baú brilhando quando um baú é liberado e confete na vitória;
  - sem o menu inferior, porque os botões levam de volta ao mapa;
  - todos os valores vêm da partida registrada.
- **Novos arquivos:**
  - `src/components/map/aventura/CenarioFundo.tsx`: a paisagem;
  - `src/data/mapas/partida.ts`: o cenário da fase ou do desafio.
- **Animações:** confete e moeda respeitam "reduzir animações".
- **Testes:** 141, com 2 novos (cenário de cada partida e início direto do desafio pela janela). O fluxo completo confere o resultado de vitória.

## 0.14.0 — 14/11/2026 — Mapas de aventura: Gênesis completo e trilha do Quiz

Primeira etapa do redesign de aventura. Antes de mudar o código, foi feita uma auditoria da central e dos mapas: `docs/auditorias/AUDITORIA-v0.14.md`.

- **Modo História:** o mapa virou um mundo de aventura em 2D com camadas.
  - O caminho sobe da fase 1 por regiões ilustradas de Gênesis: criação, Éden, Caim e Abel, Noé, Babel, Abraão, Isaque e Jacó, e José no Egito.
  - O cenário tem paredões de pedra com escadas, lagos e cachoeiras, arca, arco-íris, torre de Babel, tendas, camelo, poço, pirâmide e outros elementos.
- **Fases em medalhão:** ouro quando concluídas, dourada com raios quando é a atual, prata com cadeado quando bloqueadas, e três estrelas embaixo.
- **Cabeçalho em pergaminho:**
  - botões de voltar e de ajuda;
  - placa do mundo visível com as fases concluídas;
  - total de estrelas e botão do baú, que leva até o baú pronto.
- **Janela de apresentação da fase:**
  - número, nome, pintura, descrição, objetivo, referência bíblica, dificuldade, recompensa e estrelas;
  - numa fase bloqueada, explica o requisito e não deixa começar.
- **Modo Quiz:** trilha própria com cenário de templos, biblioteca, pergaminhos, livros, ampulheta, pedras com inscrição, portal e braseiros, em caminho de pedra.
  - Seletor de dificuldade (Iniciante, Intermediário, Avançado e Especialista), uma região por vez.
  - Ícone do tipo de desafio em cada medalhão.
  - Atalhos para o treino livre: por tempo, por tema, avançado e aleatórias.
  - "Começar desafio" na janela já inicia a partida.
- **Sem mudança nas regras de progresso:** os dois modos continuam com desbloqueios separados e compartilham XP, nível e conquistas.
- **Removidos os arquivos do mapa da v0.13:** `Prado.tsx`, `MapaTopo.tsx` e `paletasMapa.ts`.
- **Testes:** 139, com 7 novos em `src/test/mapas.test.tsx`.

## 0.13.3 — 14/11/2026 — Referências dos penteados

- Imagens de referência de 5 peças do editor modular, geradas no Canva no estilo dos corpos base: cabelo longo ondulado, trança, cacheado volumoso e véu (femininos), e cacheado (masculino). Ficam em `tools/personagem/estilizado/referencias/cabelos/`.
- Viram 3D com a cota gratuita do Hugging Face, cerca de 2 por dia. A primeira geração está agendada para 14/11 às 22:45 (Brasília).

## 0.13.2 — 14/11/2026 — Esqueleto e animações nos corpos base

- Os corpos base feminino e masculino ganharam esqueleto (os mesmos nomes de ossos dos personagens do jogo), pesos e as 6 animações: parado, caminhada, corrida, aceno, comemoração e descoberta. Arquivos: `tools/personagem/estilizado/corpos-base/corpo-*-rig.glb` (1,4 MB e 1,8 MB comprimidos).
- **Novo `juntas_auto.py`:** posiciona as juntas de cada corpo. As alturas e a abertura vêm da silhueta de frente, e a profundidade é calculada na malha.
- **Novo `exportar_corpo.py`:** exporta o corpo com esqueleto e animações.
- **`preparar.py`:** novo parâmetro opcional que também reduz o rosto. Nos corpos de cabeça grande, o rosto inteiro tomava quase todo o limite de faces e o resto do corpo ficava quebrado.
- Prévias das poses em `corpos-base/poses-*.png`.
- Ainda não aparecem no jogo. Próximo passo: regiões de cor (pele, cabelo e roupa de baixo) e expressões, e depois as peças.

## 0.13.1 — 14/11/2026 — Corpos base em 3D

- Gerados com o TRELLIS.2 (gratuito, Hugging Face) os modelos 3D dos dois corpos base do editor modular, a partir das imagens `corpo-feminino.png` e `corpo-masculino.png`. Estão em `tools/personagem/estilizado/corpos-base/`, com prévias de frente e de lado.
- Ainda não aparecem no jogo. Próximo passo: esqueleto e animações nos corpos, e depois cabelos, roupas, calçados e acessórios como peças separadas.
- Origem, ferramenta, data e licença registradas em `public/models/personagem/LICENCAS.md`.

## 0.13.0 — 13/11/2026 — Mapas em trilha de fases

- **Modo História e Modo Quiz abrem direto no mapa**, em tela cheia e sem poluição visual. Saíram o cabeçalho com nível e barra de progresso, a lista de mundos, os títulos ao lado das fases, os atalhos e a lista de próximos mundos.
- **Fica só o essencial:**
  - botão redondo para voltar ao acampamento;
  - total de estrelas conquistadas;
  - no Modo Quiz, um botão para o treino livre.
- **Novo visual:**
  - campo claro com céu e montanhas ao longe;
  - caminho sinuoso listrado;
  - ilhas de grama com amendoeiras floridas, árvores, oliveiras, palmeiras, ovelhas, tendas, poço, pirâmide, torre e cidade;
  - flores, borboletas e nuvens.
- **Botões das fases:** redondos e brilhantes, com número grande. As fases concluídas alternam verde, azul, laranja e roxo e têm três estrelas embaixo. A fase atual é dourada e pulsa, e as bloqueadas são cinza com cadeado.
- Cada mundo e cada região tem suas cores e uma fita com o nome (`src/data/paletasMapa.ts`). O cenário é desenhado em código (`src/components/map/Prado.tsx`), sem imagens externas, e fica igual em todas as visitas.
- O título de cada fase continua no nome acessível do botão, lido pelos leitores de tela.
- Testes ajustados ao mapa novo: continuam 132.

## 0.12.0 — 13/11/2026 — Ícones ilustrados

- **Novo componente `GameIcon`** (`src/components/GameIcon.tsx`): 30 ícones coloridos desenhados em SVG, com contorno escuro, brilho e volume, no estilo de jogo de aventura. Exemplos: tenda, túnica, troféu, pilha de livros, pessoa, estrela, chama, baú, pergaminho, mapa, calendário, louros, coroa, escudo, bússola, lamparina, pomba, cérebro, engrenagem, cadeado e coração.
- **Onde aparecem:**
  - menu inferior: o ícone da tela atual sobe e brilha;
  - barra superior;
  - acampamento: estrela, chama, engrenagem e nível no cabeçalho, rótulos dos objetos, botões dos modos e quadro de missões;
  - conquistas, perfil, resultado e modalidades do treino livre.
- Os ícones de ação (setas, fechar, marcar) continuam de traço. Quando não existe versão ilustrada, aparece o ícone de traço.
- **Testes:** 132 (2 novos para os ícones).

## 0.11.0 — 13/11/2026 — Visual de jogo em todas as telas

Todas as telas seguem agora o estilo da central do acampamento:

- **Céu no topo de cada página:** céu azul, pôr do sol, montanhas e colinas que se fundem ao chão escuro. Títulos com sombra para continuar legíveis.
- **Barra superior de madeira:** item ativo em ouro, nível em medalhão e botões redondos de pedra.
- **Painéis como placas de madeira:** borda dourada e relevo nos cartões, estatísticas, fichas da Biblioteca e histórico.
- **Títulos de seção em faixa vermelha com borda dourada.**
- **Botões grandes com relevo:** laranja-dourado (principal) e madeira (secundário), que afundam ao tocar.
- **Abas e opções:** fundo de madeira, com a opção escolhida em ouro.
- **Barras de progresso** douradas e mais grossas.
- **Avisos em pergaminho.**
- **Campos de texto** em papel claro.
- **Rodapé de madeira.**
- **Alto contraste:** desliga as texturas e volta às superfícies lisas.

## 0.10.1 — 13/11/2026 — Organização do repositório

- **README reescrito:** mais curto e com sumário. Reúne como jogar, funcionalidades, tecnologias, como executar, árvore de pastas comentada, como acrescentar conteúdo, testes, publicação, o que depende de servidor e licenças. Saíram as seções repetidas e as informações desatualizadas.
- **Histórico** movido do README para este arquivo (`CHANGELOG.md`). O README mostra só as versões mais recentes.
- **Documentação:**
  - planos em `docs/planos/`;
  - diagnósticos em `docs/auditorias/`;
  - índice em `docs/README.md`.
- **Código:**
  - `Layout` foi para `src/components/layout/`;
  - a tela de perguntas (`QuizRunner` e `QuestionView`) foi para `src/components/quiz/`.
- Nenhuma mudança no funcionamento do jogo.

## 0.10.0 — 13/11/2026 — Central do acampamento

- **Nova tela inicial:** o acampamento do jogador em 3D (Three.js), no lugar do painel.
  - O personagem é o mesmo modelo 3D do criador, no centro. Ele acena ao chegar, faz pequenos gestos, comemora quando há baú pronto e reage ao passar o mouse nos modos.
  - A cena tem tendas, fogueira com chamas, fumaça, faíscas e luz, baú que se abre e brilha quando há baú no mapa, quadro de missões, mesa de estudos, caminho de pedras, montanhas, nuvens e cidades antigas ao fundo.
  - Os objetos são clicáveis (com o mouse, o dedo ou o teclado) e levam às funções reais.
- **Cabeçalho de jogo:** retrato, nome, nível, barra de XP, estrelas, sequência de dias e configurações. Só dados reais: o jogo não tem moedas, então elas não aparecem.
- **Quadro de missões:** desafio diário com contagem regressiva até a meia-noite, próxima fase, baús prontos ou conquista recente, e a próxima melhoria do acampamento com a barra de andamento.
- **Acampamento evolutivo:** 8 elementos novos liberados por nível, fases, conquistas e baús. Não há compras.
- **Botões dos modos:** Modo História ("Explore as Escrituras") em dourado e Modo Quiz ("Teste seu conhecimento") em azul-esverdeado, com o andamento de cada um.
- **Menu inferior:** Início, Personagem, Conquistas, Biblioteca e Perfil, com ícones em medalhões. No acampamento, aparece também no computador.
- **Desempenho:**
  - a cena é gerada por código, sem arquivos extras (cerca de 20 KB, carregados só na tela inicial);
  - um único renderizador;
  - na qualidade leve: sem sombras, 30 quadros por segundo e menos partículas;
  - a animação para quando a tela não está visível;
  - "reduzir movimento" desliga as animações.
- **Testes:** 130 (5 novos para o acampamento; o teste da tela inicial foi refeito).

## 0.9.3 — 13/11/2026 — Novo visual da tela de perguntas

- **Topo:** uma marca por pergunta, verde para acerto e vermelha para erro; pontuação em moeda dourada; contador de acertos seguidos (a partir de 2) com chama.
- **Pergunta:** cartão emoldurado com medalhão do número da pergunta ("3/10").
- **Alternativas:**
  - botões de jogo com relevo e número em moeda dourada;
  - em duas colunas no computador quando as respostas são curtas;
  - animação ao acertar e tremida ao errar.
- **Companheiro:** no computador, o personagem do jogador fica ao lado da pergunta, num pedestal, com um balão de incentivo ("Leia com calma.", "Muito bem!", "Vamos aprender juntos."). O personagem acena quando você acerta e reage quando você erra. As frases são do jogador, não de personagens bíblicos.
- **Explicação:** selo de acerto ou erro e referência em destaque.
- **Acessibilidade:** respeita "reduzir movimento" e o alto contraste; atalhos 1 a 4 continuam valendo.

## 0.9.2 — 13/11/2026 — Novo visual do painel

- **Topo do painel:**
  - pintura de fundo em tom quente, com luz dourada;
  - personagem sobre um pedestal iluminado;
  - cartão translúcido com medalhão do nível, barras de XP mais visíveis e botão **Continuar jornada**, que leva direto à próxima fase.
- **Cartões do Modo História e do Modo Quiz:** botão "Jogar".
- **Atalhos:** ícones em medalhões dourados.
- **Celular:** topo compacto, com o personagem ao lado do cartão e as contagens numa linha só, sem ocupar a tela inteira.

## 0.9.1 — 13/11/2026 — Referências dos corpos base

- Imagens dos corpos base feminino e masculino (roupa justa simples, cabelo preso ou curto, descalços), enviadas pelo dono do projeto, salvas em `tools/personagem/estilizado/referencias/corpo-feminino.png` e `corpo-masculino.png` para virarem os modelos 3D do editor modular. Nenhuma mudança no jogo.

## 0.9.0 — 13/11/2026 — Editor de personagem: cores livres, expressão e troca ao vivo

Primeira entrega do editor modular (`docs/planos/EDITOR-3D-PLANO.md`, Etapas 4 e 6).

- **Cores livres por região:** nova aba **Cores** no guarda-roupa e na criação, para cabelo, túnica, manto, faixa e cinto, e couro.
  - Cada região tem uma paleta de época, a opção "cor original" e um seletor livre (`SeletorDeCor`).
  - A cor livre vale nos dois modelos (estilizado e v0.7) e tem prioridade sobre o tingimento.
- **Expressão de repouso:** Serena, Sorriso, Alegre ou Curiosa, na aba Rosto. Usa os morph targets do modelo.
- **Troca ao vivo:** no modelo estilizado, mudar uma cor só atualiza os uniforms do shader. O personagem não é remontado nem o GLB recarregado (`recolorir` no `Rig`, `soCores` em `heroi.ts`).
- **Shader:** a suavização de claridade agora é por região (forte na pele, leve nas outras). Assim um cabelo escuro pode virar loiro.
- **Interface:** categorias em coluna lateral nas telas largas. Botões **Restaurar aparência original** e **Salvar personagem**.
- **Salvamento:** os campos novos `cores` e `expressao` em `CharacterAppearance` guardam apenas cores (#rrggbb) e identificadores. Valores inválidos vindos do armazenamento são descartados. Perfis antigos mantêm a mesma chave visual.
- **Lógica do editor:** fica em `src/services/game/aparencia.ts` (`definirCor`, `definirExpressao`, `restaurarOriginal`).
- **Testes:** 125 no total. Novos:
  - `editor.test.ts`: cabelo, cores, roupas, acessórios, expressão, salvamento, recuperação, dados corrompidos e restauração;
  - fluxo de ponta a ponta das cores e da expressão.
  - O teste do guarda-roupa passou a usar os novos nomes dos botões.
- **Ainda falta:** cor dos olhos e formatos de olhos, cortes de cabelo, roupas e calçados como peças 3D estilizadas. Dependem do corpo base estilizado (veja o plano).

## 0.8.5 — 13/11/2026 — Plano do editor de personagens modular

- `docs/planos/EDITOR-3D-PLANO.md`: análise do que já existe, arquitetura proposta e lista dos modelos 3D necessários para o editor modular pedido (Etapas 1 a 3). Nenhuma mudança no jogo.

## 0.8.4 — 13/11/2026 — Interface em tons quentes

- O azul-marinho da interface virou marrom-terra quente (variáveis `--navy-*` e as cores fixas equivalentes em `global.css`), combinando com o estilo de animação. O texto continua claro sobre fundo escuro, com o mesmo contraste. O modo de alto contraste não mudou.
- Cantos mais arredondados (cartões com 18 px, botões e campos com 12 px).
- Palco 3D com luz quente: o contraluz azulado virou âmbar, e a luz principal ficou mais quente.
- `theme-color` do navegador acompanha o novo fundo.

## 0.8.3 — 13/11/2026 — Um modelo por personagem

- O jogo agora carrega o modelo próprio de cada personagem (`heroi-<base>.glb`), quando existir, listado em `MODELOS_POR_BASE` (`src/character3d/heroi.ts`). Se o jogador trocar o corpo, ou se o arquivo faltar ou falhar, usa o modelo do corpo, como antes. Novo teste.
- Referências em pose neutra (braços um pouco abertos, mãos vazias) de 6 personagens, geradas no Canva a partir dos desenhos do dono do projeto, em `tools/personagem/estilizado/referencias/`. Os modelos 3D saem um por dia (cota gratuita).

## 0.8.2 — 13/11/2026 — Referências dos outros personagens

- Folha com os 8 personagens enviada pelo dono do projeto: cada figura foi recortada para `tools/personagem/estilizado/referencias/` (com `LEIA-ME.md`), para virar modelo 3D, um por dia, conforme a cota gratuita. Nenhuma mudança no jogo.

## 0.8.1 — 13/11/2026 — Tons de pele do herói estilizado

- O tingimento usa a luminância da textura sobre a cor escolhida, com a diferença de claridade suavizada (expoente 0,5).
- Os tons claros de pele ganham saturação proporcional à claridade (`saturacaoPele`), porque a luz azulada do palco os deixava acinzentados. Os tons médios e escuros ficam como estão.

## 0.8.0 — 13/11/2026 — Herói masculino no estilo de animação 3D

- **Novo herói masculino** publicado: modelo gerado de imagem com o TRELLIS.2 (gratuito), com esqueleto, as seis animações, quatro expressões e acessórios de mão.
- `tools/personagem/estilizado/acabar.py`: separa seis regiões de cor pela textura e pela posição (pele, cabelo, túnica, manto, faixa, couro), aumenta um pouco os olhos, cria as expressões e exporta. O piscar fecha o olho para cima, com a pele da bochecha cobrindo. `montar.sh` faz o processo inteiro.
- **Jogo:** `heroi.ts` reconhece o modelo estilizado (`estilo: animacao` nos extras da cena) e tinge cada região por um shader. Só mudam os texels parecidos com a cor de base; a claridade da cor nova é suavizada, para tons muito claros não estourarem. A cor de base de cada material agora é preservada na conversão para MeshStandardMaterial.
- **Limitações:** a estrutura feminina continua com o modelo v0.7 até a referência feminina ser gerada (a cota gratuita diária do Hugging Face permite poucos modelos por dia). Troca de corte de cabelo, manto, cinto, calçado e barba não aparece no herói estilizado.
- **Testes:** o teste do GLB publicado aceita o modelo estilizado (regiões com cor de base e acessórios); novo teste das cores por região.

## 0.7.4 — 13/11/2026 — Esqueleto e animações no personagem estilizado

- Primeiro modelo estilizado (masculino) gerado da imagem de referência aprovada.
- `tools/personagem/estilizado/preparar.py`: une vértices, reduz para 40 mil faces e põe a malha em metros.
- `tools/personagem/estilizado/rigar.py`: esqueleto com os mesmos nomes de ossos do modelo v0.7 (juntas em `juntas-m.json`), pesos calculados numa cópia fechada da malha e transferidos, saia dividida entre tronco e pernas, braços baixados para a pose de repouso e os mesmos clipes (Idle, Walk, Run, Victory, Greeting, Discovery).
- Correção em `animacoes.py`: canais constantes só são removidos quando estão no valor de repouso (antes, um braço erguido o clipe inteiro podia perder parte da rotação).
- Ainda não integrado ao jogo.

## 0.7.3 — 13/11/2026 — Primeiro teste de imagem para 3D

- `gerar3d.py` agora usa a chave do Hugging Face injetada pelo ambiente (cabeçalho `x-hf-authorization`), sem guardar a chave no código. Teste completo: modelo 3D com textura gerado em cerca de 37 segundos, de graça. O modelo de teste fica fora do Git; nenhuma mudança no jogo.

## 0.7.2 — 13/11/2026 — Início do personagem no estilo de animação

- Regra de imagens do `CLAUDE.md` atualizada, com autorização do dono do projeto: além das obras em domínio público, também são permitidos recursos gerados por IA e recursos CC0, com origem e licença registradas.
- `tools/personagem/estilizado/gerar3d.py`: gera um modelo 3D a partir de uma imagem com o TRELLIS.2 (Microsoft, licença MIT), pela demonstração gratuita do Hugging Face. Precisa de uma chave gratuita de leitura do Hugging Face. Nenhuma mudança no jogo.

## 0.7.1 — 13/11/2026 — Plano do estilo de animação 3D

- Registrado em `docs/planos/PROXIMOS-PASSOS-3D.md` o plano para deixar personagens e interface no estilo de filme de animação 3D, pelo caminho gratuito (imagens de referência, TRELLIS, Blender), com as decisões pendentes. Nenhuma mudança no jogo.

## 0.7.0 — 12/11/2026 — Personagem 3D reconstruído (modelo GLB)

- **Etapas 1 e 2:** diagnóstico do personagem anterior e escolha da tecnologia (`docs/auditorias/AUDITORIA-v0.7.md`).
- **Modelo principal:** pipeline reprodutível no Blender (`tools/personagem/`), com recursos CC0 do MakeHuman.
  - Corpo humano contínuo, com targets de sexo, idade, musculatura e proporções.
  - Esqueleto de 163 ossos (com rig facial) e pesos.
  - Olhos, sobrancelhas, cílios, dentes e língua.
  - 7 cabelos texturizados e textura de pele real.
  - Estruturas masculina e feminina.
- **Roupas:**
  - Túnica, com saia longa e curta drapeada por **simulação de tecido**.
  - Mantos (padrão, longo, xale, capuz), também simulados.
  - Cintos de couro, corda e faixa; sandálias simples e de tiras; botas.
  - Barba curta e cheia; lenço.
  - Bolsa, odre e colar.
  - Cajado, pergaminho, lamparina, cesto e coroa de folhas, presos aos ossos.
- **Animações:** Idle, Walk, Run, Victory, Greeting e Discovery. **Expressões:** Piscar, Sorriso, Surpresa e Alegria.
- **No jogo** (`src/character3d/heroi.ts`):
  - Cada peça é ligada ou desligada conforme a aparência salva.
  - Cores e tingimentos por item; cabelo, barba e sobrancelhas tingidos no shader.
  - Listras e barras bordadas desenhadas no shader.
  - Mão fechada ao segurar objetos; piscar automático; expressões combinadas com as animações.
  - O mesmo modelo aparece ao vivo e como imagem (miniaturas) em todas as telas.
- **Criador reformulado:**
  - 9 categorias: Rosto, Cabelo, Cor do cabelo, Barba, Túnica, Manto, Cinto, Sandálias e Acessórios.
  - Cada opção mostra uma prévia no próprio personagem.
  - Botões Confirmar, Cancelar, Restaurar aparência anterior, Remover acessórios e Voltar à aparência padrão.
- **Desempenho:**
  - Compressão meshopt e texturas WebP (cerca de 4,8 MB por corpo, carregado sob demanda).
  - Materiais simplificados para compilar rápido; compilação assíncrona de shaders quando o navegador permite.
  - A renderização por software é detectada e usa a qualidade leve, limitada a 30 quadros por segundo.
  - A recompensa usa imagem do modelo em vez de um segundo visualizador ao vivo.
- **Testes:** 115 automatizados (2 novos: correspondência item → peça do modelo; o GLB publicado contém peças, animações e expressões). Auditoria no navegador com o GLB, em celular e computador.

## 0.6.0 — 12/11/2026 — Acabamento do personagem e lacunas do pedido

- **Cabelo:** centenas de mechas afinando até a ponta, saindo do redemoinho (ou da risca) até a linha do cabelo, que agora é irregular. Mechas soltas nos cabelos longos; cachos em espiral; com manto, o cabelo longo fica por dentro.
- **Rosto:**
  - Lábios com volume e cor que acompanha o tom de pele.
  - Vinco da pálpebra e abertura dos olhos amendoada.
  - Branco dos olhos com sombra e íris maior.
  - Sobrancelhas fio a fio.
  - Barba cheia com mechas e borda suave.
- **Pele e tecidos:** brilho de pele que imita a luz atravessando a pele; sombra nas reentrâncias das dobras da túnica e do manto; gola enrolada; luz principal mais lateral, para dar volume ao rosto.
- **Lacunas do pedido:**
  - Boas-vindas com o personagem do jogador acenando.
  - **Contexto histórico** nas fichas de personagens (eventos da linha do tempo, com o tipo de datação).
  - Partículas discretas no acerto e tremor no erro.
  - Transição suave entre telas. Tudo respeita "reduzir animações".
- 2 testes novos (113 no total).

## 0.5.0 — 11/11/2026 — Personagem 3D

- **Etapa 1:** auditoria e decisão técnica em `docs/auditorias/AUDITORIA-v0.5.md` (Three.js puro, modelo construído no código, sem arquivos de terceiros).
- **Etapa 2 — personagem 3D:**
  - Cabeça esculpida com nariz, lábios, maçãs do rosto e queixo; olhos com íris, pálpebras que piscam e cílios.
  - Sobrancelhas, orelhas e três expressões.
  - 7 estilos de cabelo com volume e mechas (cachos, coque, trança e cortina de fios); barba curta ou cheia.
  - Mãos com cinco dedos e pés com dedos.
  - Túnica com dobras e trama, mangas largas, mantos (com capuz e xale), cintos, sandálias e botas.
  - Todos os acessórios do jogo em 3D.
  - Iluminação de três pontos e sombras.
  - Animações: espera, caminhada, comemoração, descoberta, saudação e piscar.
- **Etapa 3 — integração:**
  - Ao vivo na Home, no guarda-roupa (rotação 360°, zoom e vistas), na chegada (entra caminhando e acena), na recompensa e no resultado.
  - Como imagem do mesmo modelo nos mapas, no topo, nos cartões, nas fases, nas conquistas e no perfil.
- **Novas opções:**
  - Estrutura do corpo, barba e 8 tingimentos naturais para túnica e manto.
  - Qualidade gráfica (Automática, Alta, Leve e 2D).
- **Desempenho:**
  - Three.js num pacote separado, carregado só quando o personagem aparece.
  - Um renderizador compartilhado e cache para as miniaturas.
  - Cache de geometrias.
  - A animação pausa fora da tela.
- **Compatibilidade:** perfis antigos continuam iguais (corpo e barba são deduzidos da base e do rosto).
- 3 testes novos (111 no total); auditoria no navegador com WebGL.

## 0.4.0 — 11/11/2026 — Personagem, mapas e progressão

- **Etapas 2 a 5:**
  - **Home em cena** com o personagem em corpo inteiro, nível, XP, progresso geral e os textos dos dois modos.
  - **Modo Quiz** (antigo Modo Livre):
    - Mapa próprio com 4 regiões e 24 desafios, trilha de pedras, estandartes e escudos.
    - Tela de introdução de cada desafio, com bônus de primeira conclusão.
    - O antigo hub virou "Treino livre"; endereços `#/livre` redirecionam.
  - **Tela de recompensa de item** (Equipar / Guardar para depois / Guardar todos), em Home, resultado e mapas.
  - **Estatísticas** (`#/estatisticas`).
  - Biblioteca com **Acontecimentos** e **Temas**.
  - Revisão com **personagens para revisar** e livros com baixo desempenho.
  - Ranking com o mapa do Quiz e aba "Multiplayer (futuro)".
- **Etapa 6:** 15 testes novos (108 no total) e auditoria de consistência da aparência no navegador, inclusive após recarregar.
- **Etapa 0:** auditoria e plano em `docs/planos/PLANO-v0.4.md`.
- **Entrada em 5 passos:** boas-vindas → identificação (nome ou apelido e faixa etária) → escolha do personagem (8 bases diversas) → personalização com prévia em corpo inteiro → chegada ao universo Bible Quest.
- **Personagem único e centralizado:**
  - Aparência (`CharacterAppearance`) com base, pele, rosto, estilo e cor de cabelo e itens equipados (túnica, manto, calçado, cinto e acessórios).
  - Um só renderizador SVG por camadas (`Character`), usado em todas as telas via `PlayerCharacter`.
- **Guarda-roupa** (`/guarda-roupa`): 36 itens de época; itens bloqueados mostram o requisito (nível, estrelas, conquista, livro concluído, baú, região do Quiz). Também é possível descartar alterações e restaurar a aparência anterior.
- **Migração:** personagens da v0.3 são convertidos automaticamente e nenhum progresso é perdido.

## 0.3.0 — 11/11/2026 — A aventura

- **Personagem do jogador:**
  - Aventureiro em SVG por camadas, com 4 estilos, 6 tons de pele, 6 cabelos, 6 cores de cabelo, 4 vestimentas, 6 cores e 5 acessórios.
  - Animações de respiração e caminhada.
  - Obrigatório antes da jornada e editável sem perder progresso.
  - Aparece no mapa, no painel, nas fases, nas cenas e no resultado.
- **Mapa de fases:**
  - Caminho sinuoso por mundo, com cenário desenhado, fases numeradas, estrelas, fase atual em destaque e fases bloqueadas com aviso.
  - O avatar caminha até a nova fase, com animação de desbloqueio.
  - Baús de recompensa finitos, abertura animada dos mundos e navegação entre os 10 mundos.
- **Gênesis em 20 fases** com 5 a 10 perguntas cada: entraram "Noé, um homem justo", "A promessa de Deus" e "Jacó e sua família"; "Moriá" foi unida a "Isaque" e "Os sonhos de Faraó" a "José no Egito". O progresso salvo é migrado.
- **Fases:**
  - Nova tela da fase.
  - Cena narrativa em quadros, com os personagens bíblicos entrando em cena.
  - Novas estrelas: 1 ao concluir, 2 com 70%, 3 com 90%. As fases não têm mais vidas.
  - Resultado com recompensas e os botões "Continuar a jornada" e "Revisar conteúdo".
- **Perguntas:** 19 novas (197 no total), incluindo perguntas com pintura e o novo exercício "Relacione".
- **Biblioteca Bíblica:** 35 personagens, 19 lugares, 66 livros e linha do tempo com 22 marcos e tipo de datação.
- **Revisão inteligente:** histórico de erros, assuntos fracos e dominados, desempenho por livro, evolução e sessões de revisão.
- **Modo Livre:** 10 modalidades (novas: por personagem, por tema e por dificuldade), 4 níveis, escolha da quantidade de perguntas e Especialista com cronômetro.
- **Rankings:** 5 categorias, só com recordes locais reais. O ranking de exemplo foi removido.
- **Conquistas:** 7 novas (26 no total), como Conhecedor das Escrituras, Memória bíblica, Persistência, Desafiante, Tesouro no caminho e Colecionador de histórias.
- Painel inicial redesenhado com o personagem em destaque.
- 93 testes automatizados.

## 0.2.0 — 11/11/2026 — Dois modos de jogo

- **Modo História:**
  - Cânon de 66 livros com mapa por testamento e grupo.
  - Progressão Testamento → Livro → Experiência, começando em Gênesis.
  - Gênesis reorganizado em 19 experiências, 6 delas novas: o homem e a mulher, o Éden, Caim e Abel, a corrupção da humanidade, Babel, Jacó e Esaú.
  - Êxodo com 4 experiências.
  - 7 etapas por experiência (com a nova etapa "Aprendizado").
  - Porcentagens por livro, testamento e jornada; continuar de onde parou; medalhas por livro.
- **Modo Livre:**
  - 7 modalidades, com pistas progressivas em "Quem sou eu?" e cronômetro com bônus de velocidade em "Contra o tempo".
  - 34 novas perguntas de toda a Bíblia.
- **Multiplayer** movido para o Modo Livre, com status de servidor, cronômetro por pergunta, vencedor e ranking da partida (demonstração).
- **Desafio diário:** registro dos desafios, proteção contra relógio retroativo e contrato `DailyService` para validação futura no servidor.
- **Progressão única entre os modos**, com regras contra acúmulo infinito de XP:
  - a repetição só rende pela melhora;
  - limite diário de 300 XP de prática.
- **Painel administrativo:** 8 seções, com editor local de perguntas e de rascunhos de experiências e importação e exportação em JSON.
- **Correções:**
  - O desafio de memória agora tolera um erro por par. O limite antigo (2 erros para 4 pares) reprovava 13% das partidas jogadas com memória perfeita.
  - Ao trocar de modalidade diretamente, a partida anterior não continua mais.
- **Migração automática** do progresso salvo na v0.1, e endereços antigos (`#/mapa`, `#/jornada/...`) redirecionam para o Modo História.
- 7 novas obras em domínio público (Bruegel, Tissot, David Roberts, John Martin). 72 testes automatizados.

## 0.1.0 — 11/11/2026

- Primeira versão jogável: 5 jornadas, 20 capítulos e 113 perguntas em 7 modalidades.
- XP, níveis, estrelas, tentativas, medalhas, 14 conquistas, sequência diária, desafio diário, histórico e desbloqueio progressivo.
- Perfil local com exportação e exclusão de dados; camada de serviços pronta para trocar por Supabase.
- Ranking e multiplayer em modo demonstração; protótipo administrativo somente leitura.
- Acessibilidade: tamanho de texto, alto contraste, redução de animações, leitura em voz alta e atalhos de teclado.
- 22 obras de arte em domínio público, otimizadas em WebP.
- 46 testes automatizados; publicação automática no GitHub Pages via GitHub Actions.

---

© Kzann Tech. Bible Quest é um produto Kzann Tech.
