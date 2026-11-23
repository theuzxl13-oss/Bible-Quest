import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Aplicativo Android do Bible Quest (Capacitor 8).
 * - O jogo inteiro vem dos arquivos locais de `dist` (gerados por
 *   `npm run build:android`): nada é carregado de um site remoto e tudo
 *   funciona sem internet. Não há `server.url`.
 * - appId é permanente: não mudar depois da primeira publicação.
 */
const config: CapacitorConfig = {
  appId: 'com.kzanntech.biblequest',
  appName: 'Bible Quest',
  webDir: 'dist',
  // fundo do aplicativo atrás da página: o terra-900 do jogo
  backgroundColor: '#22160D',
  android: {
    // nada de conteúdo http dentro do aplicativo
    allowMixedContent: false,
  },
  plugins: {
    // Barras do sistema: o Capacitor encaixa a página entre elas (o HTML do
    // aplicativo não usa viewport-fit=cover), com ícones claros sobre o fundo escuro.
    SystemBars: {
      insetsHandling: 'native',
      style: 'DARK',
    },
    // Tela de abertura (API de splash do Android 12+): fundo terra com o ícone;
    // o jogo a esconde quando o primeiro quadro já foi desenhado.
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#22160D',
      showSpinner: false,
    },
  },
}

export default config
