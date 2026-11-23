# Publicação e ponto de retorno (Etapa 1 do roadmap oficial)

Data: 14/11/2026. Referência: `BIBLE_QUEST_AUDITORIA_GERAL.pdf` e `docs/auditorias/AUDITORIA-GERAL-v0.16.md` (versão auditada: 0.16.1).

## 1. Ponto de retorno

| Item | Valor |
| --- | --- |
| Versão auditada | 0.16.1 |
| Commit | `5a1a21f1e4b386bcdccf9046cc5923e5139dd441` ("Auditoria geral e plano oficial de evolução (v0.16.1)") |
| Tag | `v0.16.1` no GitHub, com o release "v0.16.1 — versão auditada" (pre-release), criado pelo dono do projeto em 14/11/2026 às 17:00 (UTC). Conferido: a tag aponta para `5a1a21f` |
| Situação no GitHub | **Confirmada.** A sessão de desenvolvimento não pode enviar tags (o envio foi recusado), por isso a tag foi criada pelo site, seguindo o passo a passo abaixo |

**Como a tag foi criada no GitHub** (o mesmo vale para os próximos pontos de retorno):
1. Abra **Releases → Draft a new release**.
2. Em **Choose a tag**, digite `v0.16.1` e escolha **Create new tag**.
3. Em **Target**, escolha o commit `5a1a21f` (aba **Recent commits**).
4. Título: "v0.16.1: versão auditada". Marque **Set as a pre-release** e publique.

**Como voltar a esse ponto:** com a tag criada, crie um ramo a partir dela (`git switch -c retorno-v0.16.1 v0.16.1`) e faça a publicação por um pull request para o `main`. Não é preciso reescrever o histórico.

## 2. Problema encontrado na publicação

Evidências: execuções do workflow (GitHub Actions) e o histórico de implantações do ambiente `github-pages` (API pública de deployments do repositório).

| Execução | Ramo | Versão | Resultado | Motivo |
| --- | --- | --- | --- | --- |
| 37, 39, 41 | `main` | 0.14.0, 0.15.0, 0.16.0 | Build concluído, **publicação recusada** | O job de publicação ficou "waiting" e passou a "failure" em 2 segundos, sem rodar nenhum passo. Isso é a regra de ramos do ambiente `github-pages`: hoje só `claude/dazzling-johnson-mig8ai` e `claude/loving-carson-8mrbjo` podem publicar |
| 38 (1ª tentativa), 40 | `claude/loving-carson-8mrbjo` | 0.15.0, 0.16.0 | **Cancelada** | As duas execuções usavam o mesmo grupo `pages` com `cancel-in-progress: true`. O envio ao `main`, feito logo depois, cancelou a publicação válida do outro ramo, e a do `main` foi recusada |
| 42 | `main` | 0.16.1 | Cancelada | Cancelada pela execução 43 (mesmo grupo) |
| 43 | `claude/loving-carson-8mrbjo` | 0.16.1 | Publicada | Implantação de sucesso às 15:54 (UTC) |

**Consequência:** a versão 0.16.0 **nunca foi publicada sozinha**. Entre 15:25 e 15:54 (UTC) o site continuou na 0.15.0, e o código da 0.16.0 só foi ao ar junto com a 0.16.1.

**Correção:** a conferência feita naquela hora procurou o texto `av-cena` no JavaScript publicado. Esse texto já existia na 0.15 (é a classe do cenário do mapa, em `Cena.tsx`), então o resultado foi um **falso positivo**. A partir desta etapa, a conferência compara o nome do arquivo JavaScript publicado com o gerado no build do mesmo commit.

**Diferença entre build e publicação:** "build concluído" quer dizer só que o pacote `dist/` foi gerado e enviado como artefato. A publicação efetiva é o job `deploy`/`publicar` terminar com sucesso **e** o site passar a servir os arquivos novos.

## 3. Estratégia única de publicação

- **Produção:** ramo `main`, o ramo padrão do repositório. Só ele publica. Uma versão chega ao `main` quando é aprovada pelo dono do projeto.
- **Desenvolvimento:** ramos `claude/**` e pull requests para o `main` só verificam tipos, testes e build. Não publicam.
- **Concorrência:**
  - **Verificação:** um grupo por ramo (`verificacao-<ramo>`). Fora do `main`, uma verificação nova cancela a anterior do mesmo ramo. No `main`, nunca cancela.
  - **Publicação:** grupo único `pages-producao`, com `cancel-in-progress: false`. Uma publicação em andamento nunca é cancelada, e a seguinte espera na fila.
- **Permissões mínimas:**
  - `contents: read` no workflow;
  - `pages: write` e `id-token: write` só no job de publicação.
- **Artefato:** o pacote do Pages (`upload-pages-artifact`) só é gerado no `main`.
- **Conferência dos arquivos gerados:** existência de `dist/index.html`, dos scripts em `dist/assets/` e dos modelos 3D, e caminhos relativos (`./assets/`) no `index.html`.
- **Funcionamento local:** não muda. `npm run dev`, `npm test` e `npm run build` continuam iguais, e `base: './'` foi mantido.

**Configuração necessária no GitHub (só o dono do projeto pode fazer):**
1. Abra **Settings → Environments → github-pages → Deployment branches and tags**.
2. Adicione o ramo `main`.
3. Recomendado: remova `claude/dazzling-johnson-mig8ai` e `claude/loving-carson-8mrbjo`, para que só o `main` possa publicar.
4. **Settings → Pages:** a origem continua **GitHub Actions**.

## 4. Como publicar uma versão

1. Desenvolvimento e verificação no ramo `claude/...`. O workflow só verifica.
2. Depois da aprovação, a versão vai para o `main` (envio direto pela sessão, com autorização, ou pull request).
3. O workflow do `main` verifica e publica.
4. **Conferência:** o nome do arquivo `assets/index-*.js` em `https://theuzxl13-oss.github.io/Bible-Quest/` deve ser igual ao do `dist/index.html` gerado no mesmo commit.
5. Também é possível publicar de novo pelo botão **Run workflow** (aba Actions), escolhendo o `main`.

## 5. Verificação da correção (14/11/2026)

O ramo `main` foi liberado no ambiente `github-pages` pelo dono do projeto.

| # | Execução | Gatilho | Commit | Verificação | Publicação | Implantação | Site depois |
| --- | --- | --- | --- | --- | --- | --- | --- |
| — | 44 | envio a `claude/loving-carson-8mrbjo` | `e8bd523` | sucesso | **pulada** (como previsto) | — | sem mudança |
| 1 | 45 | envio ao `main` | `e8bd523` | sucesso | sucesso | 7790588720: `success` às 16:44:35 (UTC) | `last-modified` de 15:54:47 para 16:44:29; serve `assets/index-CKNufloV.js` |
| 2 | 46 | "Run workflow" no `main` | `e8bd523` | sucesso | sucesso | 7790604371: `success` às 16:45:46 (UTC) | `last-modified` 16:45:39; serve `assets/index-CKNufloV.js` |

- **O jogo não mudou:** `assets/index-CKNufloV.js` e `assets/index-DjzVP5wM.css` são os mesmos arquivos da versão auditada (0.16.1), gerados pelo build local e servidos pelo site.
- **Site publicado no navegador** (Chromium, 390 px): as 23 telas da auditoria abriram sem erro de JavaScript e sem rolagem lateral. O 3D ficou pronto em 2,7 s, e os modelos `.glb` e o manifesto responderam com status 200.

## 6. Limitações conhecidas

- **Tags:** a sessão de desenvolvimento não pode enviar tags. Os próximos pontos de retorno também serão criados pelo dono do projeto, pelo site.
- **Ambiente `github-pages`:** a regra de ramos é configurada em Settings, e esta sessão não tem acesso a essa configuração.
- **Regras antigas do ambiente:** as regras dos ramos `claude/...` ainda podem existir no ambiente. O workflow já não publica por eles, mas removê-las garante que só o `main` publique.
- **Envio ao `main`:** é feito pela sessão de desenvolvimento, com autorização do dono do projeto. Não há revisão obrigatória por pull request, nem proteção do ramo `main` (possível evolução).
