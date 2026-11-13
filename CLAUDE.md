# Instruções do projeto Bible Quest

- **Sempre atualize o `README.md` a cada mudança no projeto**, no mesmo commit:
  - acrescente uma entrada no topo da seção "Histórico de atualizações" (versão, data e o que mudou);
  - ajuste as seções afetadas (funcionalidades, estrutura, testes, limitações, publicação).
- Quando a mudança afetar planos futuros, atualize também o `ROADMAP.md`.
- Antes de enviar: `npm run typecheck`, `npm test` e `npm run build` devem passar.
- Texto bíblico: só trechos curtos da Almeida Revista e Corrigida 1911 (domínio público), com referência, marcados para revisão contra a fonte. Narrativa dramatizada deve ficar identificada e não pode atribuir falas aos personagens.
- Imagens e modelos 3D (autorizado pelo dono do projeto em 13/11/2026):
  - pinturas e fotos: obras em domínio público do Wikimedia Commons, com crédito em `src/data/images.ts`;
  - também são permitidos recursos gerados por IA (imagens de referência, modelos 3D) e recursos CC0. Registre a origem, a ferramenta, a data e a licença de cada arquivo (para o personagem, em `public/models/personagem/LICENCAS.md`).
- Textos da interface e da documentação em português do Brasil.
