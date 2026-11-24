/*
 * Monta o BUILD TEMPORÁRIO DE DIAGNÓSTICO da Central 3D.
 *
 * Roda SÓ dentro do executor do GitHub Actions (fluxo android-diagnostico.yml),
 * numa cópia descartável do repositório. Nada disto é commitado: o APK oficial
 * (android.yml) continua sem nenhuma instrumentação, e o fluxo oficial confere isso.
 *
 * Mudanças aplicadas (apenas registro; a lógica, os quatro valores, a cena e o
 * visual não mudam):
 *   src/__diagnostico.ts                    cópia de tools/android/diagnostico/registro.ts
 *   src/main.tsx                            importa o registro antes de tudo
 *   src/components/camp/CenaAcampamento.tsx registra os valores em cada renderização,
 *                                           execução e limpeza do efeito, e a cena pronta
 *   android/.../MainActivity.java           vigia que mede bloqueios da thread principal (logcat BQDiag)
 *   android/app/build.gradle                versionName "0.17.9-diagnostico"
 *
 * Uso: node tools/android/diagnostico/instrumentar.cjs
 */
const fs = require('fs')
const path = require('path')

const RAIZ = path.resolve(__dirname, '../../..')
const arq = (p) => path.join(RAIZ, p)

function trocar(rel, de, para) {
  const p = arq(rel)
  const s = fs.readFileSync(p, 'utf8')
  const n = s.split(de).length - 1
  if (n !== 1) throw new Error(`${rel}: trecho esperado ${n} vezes (precisa ser 1): ${de.slice(0, 80)}`)
  fs.writeFileSync(p, s.replace(de, para))
  console.log('instrumentado:', rel)
}

// 1. registro na página
fs.copyFileSync(path.join(__dirname, 'registro.ts'), arq('src/__diagnostico.ts'))
console.log('copiado: src/__diagnostico.ts')
trocar('src/main.tsx', "import { StrictMode } from 'react'", "import './__diagnostico'\nimport { StrictMode } from 'react'")

// 2. efeito da cena 3D: valores antes e depois de cada execução
const CENA = 'src/components/camp/CenaAcampamento.tsx'
trocar(
  CENA,
  "  const chaveElementos = elementos.join(',')\n",
  `  const chaveElementos = elementos.join(',')
  // [DIAGNÓSTICO] valores de que o efeito depende (só no build de diagnóstico)
  const diagValores = {
    qualidade: quality,
    animacoesReduzidas: reduced,
    reduceMotionConfiguracao: Boolean(settings.reduceMotion),
    prefersReducedMotion: typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches),
    configuracaoGraficos: String(settings.graphics),
    elementos: chaveElementos,
    bauPronto,
    estado,
  }
  ;(window as unknown as { __bqDiag?: { render(v: typeof diagValores): void } }).__bqDiag?.render(diagValores)
`,
)
trocar(
  CENA,
  "  useEffect(() => {\n    if (quality === '2d' || !palco.current) return\n",
  "  useEffect(() => {\n    ;(window as unknown as { __bqDiag?: { efeito(f: string, v: typeof diagValores): void } }).__bqDiag?.efeito('executa', diagValores)\n    if (quality === '2d' || !palco.current) return\n",
)
trocar(
  CENA,
  "          onReady: () => !cancelado && setEstado('pronto'),",
  "          onReady: () => {\n            ;(window as unknown as { __bqDiag?: { marca(t: string): void } }).__bqDiag?.marca(cancelado ? 'cena pronta (execução já cancelada)' : 'cena pronta')\n            if (!cancelado) setEstado('pronto')\n          },",
)
trocar(
  CENA,
  "    return () => {\n      cancelado = true\n      handle.current?.dispose()",
  "    return () => {\n      ;(window as unknown as { __bqDiag?: { efeito(f: string, v: typeof diagValores): void } }).__bqDiag?.efeito('limpeza', diagValores)\n      cancelado = true\n      handle.current?.dispose()",
)

// 3. vigia da thread principal do Android (duração dos bloqueios que causam ANR)
const ATIVIDADE = 'android/app/src/main/java/com/kzanntech/biblequest/MainActivity.java'
trocar(ATIVIDADE, 'import android.os.Bundle;', `import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.util.Log;
import java.util.concurrent.atomic.AtomicLong;`)
trocar(ATIVIDADE, '        ajustarOrientacao(getResources().getConfiguration());\n    }\n', `        ajustarOrientacao(getResources().getConfiguration());
        iniciarVigia();
    }

    // [DIAGNÓSTICO] mede quanto tempo a thread principal fica sem responder (logcat, etiqueta BQDiag)
    private void iniciarVigia() {
        final Handler principal = new Handler(Looper.getMainLooper());
        Thread vigia = new Thread(() -> {
            while (true) {
                final long enviado = SystemClock.uptimeMillis();
                final AtomicLong atendido = new AtomicLong(0);
                principal.post(() -> atendido.set(SystemClock.uptimeMillis()));
                try {
                    Thread.sleep(200);
                    while (atendido.get() == 0) Thread.sleep(20);
                } catch (InterruptedException e) {
                    return;
                }
                long atraso = atendido.get() - enviado;
                if (atraso >= 500) Log.w("BQDiag", "thread principal bloqueada por " + atraso + " ms (fim do bloqueio)");
            }
        }, "bq-vigia");
        vigia.setDaemon(true);
        vigia.start();
    }
`)

// 4. identificação do build
trocar('android/app/build.gradle', 'versionName "0.17.9"', 'versionName "0.17.9-diagnostico"')

console.log('build de diagnóstico pronto para compilar (NÃO é o APK oficial)')
