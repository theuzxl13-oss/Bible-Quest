# Bible Quest — Diretrizes da versão 1.0 (Android)

**Registrado em:** 24/11/2026, a partir da mensagem "Definição da versão 1.0 e próxima etapa" do dono do projeto.
**Situação:** diretrizes em avaliação. Este documento **não altera** nenhum documento oficial (ROADMAP, README, CHANGELOG, planos anteriores); ele só registra as decisões e o que ainda falta confirmar.
**Base:** auditoria `docs/relatorios/AUDITORIA_PRONTIDAO_1_0.md` (24/11/2026).

## 1. Direção do lançamento

- Versão 1.0 **enxuta, bonita, estável e bem testada**.
- **Preservar a Central 3D.**
- **Dois personagens selecionáveis:** um masculino e um feminino.
  - Os dois devem ter **a mesma identidade artística, as mesmas proporções e o mesmo nível de acabamento**.
- **Para atualizações futuras:**
  - novos personagens;
  - novas personalizações (ver o conflito 2 do relatório de planejamento).

## 2. Funcionalidades

**Fora da 1.0, ficam para atualizações:**
- monetização: anúncios, compras internas e assinatura Premium;
- multiplayer online;
- sincronização na nuvem;
- leitura em voz alta nativa.

## 3. Conteúdo

- **Proposta:** a 1.0 começa com **Gênesis e Êxodo completos e revisados**.
- **Não remover os outros livros** sem antes apresentar o impacto. A análise das opções está no relatório de planejamento, seção 6.

## 4. Telas e identidade visual

As melhorias visuais pendentes de **Perfil, Quiz e História** (passo 1.7) **podem ficar para depois da 1.0**, desde que não prejudiquem a experiência nem o funcionamento.

## 5. Próxima etapa: testes físicos

- **Prioridade:** testes em aparelhos Android reais.
- **ANR:** separar os problemas de **inicialização do WebView** dos de **criação da Central 3D**.
- **Também avaliar:** compatibilidade, desempenho, acessibilidade e funcionamento offline.
- **Versão mínima do Android:** **não definir** antes de analisar os resultados.

## 6. Regras de trabalho nesta fase

- Não alterar código.
- Não integrar branches nem modificar o `main`.
- Não gerar AAB, não publicar e não iniciar procedimentos de lançamento.
- **Não iniciar a implementação do personagem feminino** ainda.
- Não avançar para outras etapas sem avaliação e autorização.

## 7. Ainda depende de confirmação

Lista completa e comentada no relatório `docs/relatorios/PLANEJAMENTO_1_0_TESTES_FISICOS.md`, seção 7.

1. O que significa "Êxodo completo" (hoje: capítulos 1 a 20, em 4 fases).
2. O que fazer com a personalização atual (guarda-roupa e itens de recompensa).
3. O que fazer com os outros 64 livros (manter "em preparação", ocultar no Modo História ou remover).
4. Quem faz a revisão bíblica e qual o critério de "revisado".
5. Quais aparelhos serão usados, e se haverá um terceiro com Android 7 a 9.
6. A integração das versões 0.17.8 e 0.17.9 e a branch de lançamento.
7. Quando o CHANGELOG, o README, o ROADMAP e o índice de documentos podem ser atualizados para refletir estas diretrizes.
