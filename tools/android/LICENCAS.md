# Ícones e tela de abertura do aplicativo Android — origem e licença

| Arquivo | Origem | Ferramenta | Data | Licença |
| --- | --- | --- | --- | --- |
| `tools/android/icone-frente.svg` | Desenho original feito em código para o Bible Quest (medalhão de ouro, cruz e Bíblia aberta), nas cores da paleta do jogo (`src/styles/tokens.css`) | Escrito à mão em SVG (Claude, para a Kzann Tech) | 23/11/2026 | Do projeto Bible Quest (Kzann Tech) |
| `tools/android/icone-monocromatico.svg` | Versão em uma cor do mesmo desenho, para os ícones temáticos do Android 13+ | Escrito à mão em SVG | 23/11/2026 | Do projeto Bible Quest (Kzann Tech) |
| `android/app/src/main/res/mipmap-*/ic_launcher*.png` e `drawable*/splash.png` | Gerados a partir dos SVGs acima | `node tools/android/gerar-recursos.cjs` (Chromium/Playwright) | 23/11/2026 | Do projeto Bible Quest (Kzann Tech) |

Nenhuma imagem de terceiros, nenhuma imagem gerada por IA e nenhum recurso de banco de imagens foi usado nos ícones.
Os ícones padrão do Capacitor foram substituídos.
