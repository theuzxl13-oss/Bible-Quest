# Bible Quest — Diretrizes da versão 1.0 (Android)

**Primeiro registro:** 24/11/2026 ("Definição da versão 1.0 e próxima etapa").
**Atualizado em:** 24/11/2026 ("Avaliação do planejamento e decisões preliminares").
**Situação:** documento de planejamento. Ele **não altera** nenhum documento oficial (ROADMAP, README, CHANGELOG, índice de documentos), que só será atualizado com autorização.

**Documentos relacionados:**
- auditoria: `docs/relatorios/AUDITORIA_PRONTIDAO_1_0.md`;
- planejamento: `docs/relatorios/PLANEJAMENTO_1_0_TESTES_FISICOS.md`, que inclui o plano de revisão bíblica e a estimativa para completar Gênesis e Êxodo;
- roteiro de teste físico: `docs/relatorios/ANDROID_TESTE_APARELHOS_FISICOS.md`.

**As três categorias usadas aqui:**

| Categoria | Significado |
|---|---|
| **APROVADO** | decidido por vocês |
| **PROPOSTO** | sugestão minha, aguardando avaliação |
| **PENDENTE** | depende de uma decisão de vocês |

## 1. Decisões APROVADAS

### 1.1 Direção do lançamento

- A1. Versão 1.0 **enxuta, bonita, estável e bem testada**.
- A2. **Preservar a Central 3D.**
- A3. **Dois personagens selecionáveis:** um masculino e um feminino.
  - Os dois com **o mesmo padrão artístico e técnico**: identidade, proporções e acabamento.
- A4. **Manter a personalização existente:** guarda-roupa, roupas e baús de recompensa, **preservando a progressão atual**.
- A5. **Não criar** novos personagens nem novos sistemas de personalização nesta etapa. Novos personagens e personalizações ficam para atualizações futuras.
- A6. **Não iniciar a implementação do personagem feminino** ainda.

### 1.2 Funcionalidades fora da 1.0

- A7. Sem monetização: anúncios, compras internas e assinatura Premium ficam para o futuro.
- A8. Multiplayer online, sincronização na nuvem e leitura em voz alta nativa ficam para atualizações.

### 1.3 Conteúdo

- A9. **Gênesis e Êxodo só serão considerados completos quando nenhum capítulo estiver sem conteúdo.**
- A10. **Planejar a conclusão dos capítulos ausentes.** A estimativa está no planejamento, seção 13.
- A11. **Manter os outros 64 livros** como conteúdo em preparação. Ver a pendência P8.
- A12. **Preservar as perguntas gerais do Modo Livre:** 34 perguntas de vários livros, em `src/data/questions/geral.ts`.
- A13. **Revisão humana obrigatória** dos trechos bíblicos e de **todas** as perguntas antes de considerá-los revisados. O plano está no planejamento, seção 12.

### 1.4 Telas

- A14. As melhorias visuais de **Perfil, Quiz e História** podem ficar para depois da 1.0, **desde que** não prejudiquem a experiência nem o funcionamento.

### 1.5 Testes físicos

- A15. **Prioridade:** testes em aparelhos Android reais, **antes do vencimento do APK de diagnóstico** (01/12/2026, 15h39 UTC).
- A16. **Incluir os grupos complementares A** (compatibilidade), **B** (acessibilidade), **C** (telas) **e D** (persistência).
- A17. **ANR:** separar a inicialização do WebView da criação da Central 3D. **Não alterar o código** para corrigir ANR ou compatibilidade **antes da análise das evidências**.
- A18. **Não definir a versão mínima do Android** antes de analisar os resultados.

### 1.6 Branches e documentação

- A19. **Não integrar branches nem modificar o `main`.**
- A20. **Branch de lançamento em aberto** até a avaliação das versões 0.17.8, 0.17.9 e Android.
- A21. **Não atualizar documentos oficiais** por enquanto.
- A22. **Não gerar AAB, não publicar** e não iniciar procedimentos de lançamento.

## 2. PROPOSTAS (aguardando avaliação)

- **PR1. O que é um livro "completo":** todo capítulo coberto por pelo menos uma fase. Uma fase pode reunir capítulos vizinhos. Capítulos de genealogia (Gênesis 36) e capítulos sensíveis para o público infantil (Gênesis 34 e 38) entram com resumo adequado à faixa etária, sem detalhes impróprios. Ver P2.
- **PR2. Fases novas sugeridas.** Planejamento, seção 13:
  - Gênesis: cerca de 4 fases novas e 2 ampliações de fases existentes;
  - Êxodo: cerca de 5 fases novas e 1 ampliação.
- **PR3. Plano de revisão bíblica em lotes,** com três papéis (textual, teológico e pedagógico) e um registro por item. Planejamento, seção 12.
- **PR4. Ordem de trabalho depois dos testes físicos:**
  1. diagnóstico físico;
  2. revisão bíblica do conteúdo existente, que pode começar em paralelo;
  3. conteúdo dos capítulos ausentes;
  4. personagem feminino;
  5. estabilidade;
  6. privacidade e loja.
- **PR5. Critérios de leitura dos testes:**
  - ANR confirmado: linha `ANR in` no registro ou o aviso visto na tela;
  - travamento grave: 5 s ou mais;
  - meta de abertura da Central: até cerca de 3 s no aparelho intermediário.
- **PR6. Se os testes passarem de 01/12/2026:** gerar de novo o mesmo APK de diagnóstico, sem mudança no jogo, com mais 7 dias.

## 3. PENDÊNCIAS (dependem de vocês)

- **P1. Revisão bíblica:**
  - quem são os revisores (textual, teológico e pedagógico);
  - qual exemplar da Almeida 1911 será a fonte de referência;
  - quantas aprovações cada item precisa.
- **P2. Capítulos sensíveis e de genealogia** (Gênesis 34, 36 e 38): como tratar, considerando que a faixa etária do jogo inclui crianças.
- **P3. Fases novas:** aprovar a lista e a divisão por capítulos de PR2 e a definição de PR1.
- **P4. Aparelhos de teste:** quais modelos; se haverá um terceiro com Android 7 a 9 (grupo A) e um tablet (grupo C).
- **P5. Critérios de leitura dos testes** (PR5).
- **P6. Versões 0.17.8 e 0.17.9 e branch de lançamento:** quando serão avaliadas.
- **P7. Documentos oficiais:** quando atualizar CHANGELOG, README, ROADMAP e o índice com estas diretrizes.
- **P8. Livros em preparação no Modo História.** A decisão A11 fala em manter os 64 livros "na Biblioteca como conteúdo em preparação". Hoje eles aparecem também na lista de livros do **Modo História**, marcados "em preparação". Confirmar:
  - **opção A:** manter também no Modo História, como está hoje;
  - **opção B:** mostrar no Modo História só os livros com fases.
- **P9. Personagem feminino:** quando começar e de que forma (depois dos testes físicos).
- **P10. Atualizar as ações do GitHub Actions** baseadas no Node 20: quando fazer.
