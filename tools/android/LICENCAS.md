# Ícones e tela de abertura do aplicativo Android — origem e licença

| Arquivo | Origem | Ferramenta | Data | Licença |
| --- | --- | --- | --- | --- |
| `tools/android/icone-frente.svg` | Desenho original feito em código para o Bible Quest (medalhão de ouro, cruz e Bíblia aberta), nas cores da paleta do jogo (`src/styles/tokens.css`) | Escrito à mão em SVG (Claude, para a Kzann Tech) | 23/11/2026 | Do projeto Bible Quest (Kzann Tech) |
| `tools/android/icone-monocromatico.svg` | Versão em uma cor do mesmo desenho, para os ícones temáticos do Android 13+ | Escrito à mão em SVG | 23/11/2026 | Do projeto Bible Quest (Kzann Tech) |
| `tools/android/icone-abertura.svg` | Cópia do desenho original de `icone-frente.svg`, no tamanho aprovado na etapa 1, usada só na tela de abertura | Escrito à mão em SVG | 24/11/2026 | Do projeto Bible Quest (Kzann Tech) |
| `android/app/src/main/res/mipmap-*/ic_launcher*.png` | Gerados a partir de `icone-frente.svg` e `icone-monocromatico.svg`, com o medalhão reduzido a 88 % em 24/11/2026 | `node tools/android/gerar-recursos.cjs` (Chromium/Playwright) | 23/11/2026 e 24/11/2026 | Do projeto Bible Quest (Kzann Tech) |
| `android/app/src/main/res/mipmap-*/ic_splash.png` e `drawable*/splash.png` | Tela de abertura: mesmas imagens da etapa 1, sem mudança (`ic_splash.png` é cópia exata da antiga camada da frente do ícone) | `node tools/android/gerar-recursos.cjs --abertura` | 23/11/2026 | Do projeto Bible Quest (Kzann Tech) |

Nenhuma imagem de terceiros, nenhuma imagem gerada por IA e nenhum recurso de banco de imagens foi usado nos ícones.
Os ícones padrão do Capacitor foram substituídos.
