// Plataforma do build, definida no vite.config.ts ("define").
// false no site (o código exclusivo do aplicativo é eliminado do pacote);
// true só no build do aplicativo Android (`vite build --mode android`).
// Onde o código precisa SAIR do pacote (importações), use a constante global
// __ANDROID__ diretamente: ela vira um literal antes da compilação.
export const ANDROID: boolean = __ANDROID__
