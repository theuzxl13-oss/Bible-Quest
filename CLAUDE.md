# Instruções do projeto Bible Quest

- **Sempre atualize a documentação a cada mudança no projeto**, no mesmo commit:
  - acrescente uma entrada no topo do `CHANGELOG.md` (versão, data e o que mudou) e uma linha de resumo no topo de "Histórico de atualizações" do `README.md` (mantenha só as 4 mais recentes);
  - ajuste as seções afetadas do `README.md` (funcionalidades, pastas, testes, limitações, publicação);
  - documentos técnicos ficam em `docs/planos/` ou `docs/auditorias/`, listados em `docs/README.md`.
- Quando a mudança afetar planos futuros, atualize também o `ROADMAP.md`.
- Antes de enviar: `npm run typecheck`, `npm test` e `npm run build` devem passar.
- Texto bíblico: só trechos curtos da Almeida Revista e Corrigida 1911 (domínio público), com referência, marcados para revisão contra a fonte. Narrativa dramatizada deve ficar identificada e não pode atribuir falas aos personagens.
- Imagens e modelos 3D (autorizado pelo dono do projeto em 13/11/2026):
  - pinturas e fotos: obras em domínio público do Wikimedia Commons, com crédito em `src/data/images.ts`;
  - também são permitidos recursos gerados por IA (imagens de referência, modelos 3D) e recursos CC0. Registre a origem, a ferramenta, a data e a licença de cada arquivo (para o personagem, em `public/models/personagem/LICENCAS.md`).
- Textos da interface e da documentação em português do Brasil.
- Relatórios em PDF: publique sempre em `docs/relatorios/` (commit só de documentação, inclusive em etapas de análise que proíbem mudanças no código) e informe o link público (`https://raw.githubusercontent.com/theuzxl13-oss/Bible-Quest/main/docs/relatorios/<arquivo>.pdf`). Junto do PDF, publique uma versão em texto (`.md`, mesmo nome), porque ferramentas como o ChatGPT não leem o PDF pelo GitHub. Informe os dois links. Autorizado pelo dono do projeto em 14/11/2026, sem precisar perguntar.
