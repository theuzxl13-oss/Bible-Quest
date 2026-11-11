# Instruções do projeto Bible Quest

- **Sempre atualize o `README.md` a cada mudança no projeto**, no mesmo commit:
  - acrescente uma entrada no topo da seção "Histórico de atualizações" (versão, data e o que mudou);
  - ajuste as seções afetadas (funcionalidades, estrutura, testes, limitações, publicação).
- Quando a mudança afetar planos futuros, atualize também o `ROADMAP.md`.
- Antes de enviar: `npm run typecheck`, `npm test` e `npm run build` devem passar.
- Texto bíblico: só trechos curtos da Almeida Revista e Corrigida 1911 (domínio público), com referência, marcados para revisão contra a fonte. Narrativa dramatizada deve ficar identificada e não pode atribuir falas aos personagens.
- Imagens: apenas obras em domínio público do Wikimedia Commons, com crédito em `src/data/images.ts`.
- Textos da interface e da documentação em português do Brasil.
