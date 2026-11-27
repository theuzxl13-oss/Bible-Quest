// Resume os tempos de entrada e saída por faixa de visitas.
const f = process.argv[2]; const d = require(require('path').resolve(f))
const med = (a) => { const o = a.filter((x) => x != null).sort((x, y) => x - y); return o.length ? o[Math.floor(o.length / 2)] : null }
const faixa = (a, b) => d.visitas.filter((v) => v.visita >= a && v.visita <= b)
const maxL = (l) => Math.max(0, ...l.map((x) => x[1]))
for (const [a, b] of [[1, 1], [2, 5], [6, 10], [11, 24]].filter(([a]) => a <= d.visitas.length)) {
  const vs = faixa(a, b)
  console.log(`${f.replace(/^.*\//, '').padEnd(34)} visitas ${a}-${b}: entrada mediana ${med(vs.map((v) => v.entrada.ms))} ms (maior tarefa longa ${med(vs.map((v) => maxL(v.entrada.tarefas_longas)))} ms, quadros>50ms ${med(vs.map((v) => v.entrada.quadros_acima_50ms))}) | saída até a tela nova ${med(vs.map((v) => v.saida.ms))} ms, maior bloqueio na saída ${med(vs.map((v) => maxL(v.saida.tarefas_longas)))} ms`)
}
