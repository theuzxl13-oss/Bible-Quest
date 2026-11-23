// Auditoria de contraste do texto por pixels: captura a tela inteira e registra
// a caixa, a cor e o tamanho de cada texto visível. O cálculo fica em auditoria.py.
const { chromium } = require('playwright');
const fs = require('fs');
const est = require('../estado.json').origins[0].localStorage;
const progresso = () => { const kp = 'bible-quest:v1:progress'; const p = JSON.parse(localStorage.getItem(kp) || '{}'); p.xp = Math.max(p.xp || 0, 640); p.experiences = p.experiences || {}; for (const [id, st] of [['gn-criacao', 3], ['gn-homem-mulher', 2], ['gn-eden', 3]]) p.experiences[id] = { completed: true, bestStars: st, bestScore: 80, attempts: 1 }; p.library = p.library || { characters: {}, places: {} }; for (const c of ['adao', 'eva', 'caim', 'abel']) p.library.characters[c] = '2026-11-15T10:00:00Z'; localStorage.setItem(kp, JSON.stringify(p)); };
const OUT = process.argv[2]; const BASE = process.argv[3]; const ALTO = process.argv[4] === 'alto';
fs.mkdirSync(OUT, { recursive: true });
const rotas = [['central', '/painel'], ['central-2d', '/painel', '2d'], ['historia-mapa', '/historia'], ['janela-fase', '/historia', 'janela'], ['livros', '/historia/livros'], ['livro', '/historia/genesis'], ['fase', '/historia/genesis/gn-queda'],
 ['cena', '/historia/genesis/gn-queda/historia'], ['desafio', '/historia/genesis/gn-queda/desafio', 'comecar'], ['quiz-mapa', '/quiz'], ['treino', '/quiz/treino'], ['modalidade', '/quiz/treino/aleatorias', 'comecar'],
 ['multiplayer', '/quiz/multiplayer'], ['diario', '/diario'], ['revisao', '/revisao'], ['biblioteca', '/biblioteca'], ['ficha', '/biblioteca/personagem/adao'], ['linha', '/linha-do-tempo'],
 ['perfil', '/perfil'], ['estatisticas', '/estatisticas'], ['ranking', '/ranking'], ['config', '/configuracoes'], ['conquistas', '/conquistas'], ['guarda-roupa', '/guarda-roupa'], ['sobre', '/sobre'], ['nao-encontrada', '/xyz'], ['entrar', '/entrar', 'vazio']];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [vw, vh, disp] of [[390, 844, 'cel'], [1280, 800, 'pc']]) for (const [nome, rota, extra] of rotas) { if (process.env.SO && !process.env.SO.split(',').includes(nome)) continue;
    const c = await b.newContext({ viewport: { width: vw, height: vh }, reducedMotion: 'reduce' });
    await c.addInitScript(() => { let x = 123456789; Math.random = () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 1e9) / 1e9; }; });
    if (extra !== 'vazio') { await c.addInitScript((i) => { if (!sessionStorage.getItem('ok')) { for (const { name, value } of i) localStorage.setItem(name, value); sessionStorage.setItem('ok', '1') } }, est); await c.addInitScript(progresso); }
    await c.addInitScript(([alto, d2]) => { const k = 'bible-quest:v1:settings'; const s = JSON.parse(localStorage.getItem(k) || '{}'); s.reduceMotion = true; s.highContrast = alto; if (d2) s.graphics = '2d'; localStorage.setItem(k, JSON.stringify(s)); }, [ALTO, extra === '2d']);
    const p = await c.newPage(); await p.clock.setFixedTime(new Date('2026-11-16T12:00:00'));
    await p.goto(BASE + '#' + rota); await p.waitForTimeout(rota === '/painel' ? 6000 : 2200);
    const entrar = p.getByRole('button', { name: /entrar no mundo/i }); if (await entrar.count()) { await entrar.first().click(); await p.waitForTimeout(600) }
    if (extra === 'janela') { const n = p.locator('.av-no.is-atual button, .av-no.is-disponivel button').first(); if (await n.count()) { await n.scrollIntoViewIfNeeded(); await n.click({ force: true }); await p.waitForTimeout(800) } }
    if (extra === 'comecar') { const cm = p.getByRole('button', { name: /^começar/i }); if (await cm.count()) { await cm.first().click(); await p.waitForTimeout(1000) } }
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
    const dados = await p.evaluate(() => {
      const out = []; const sx = scrollX, sy = scrollY;
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n; while ((n = w.nextNode())) {
        const t = n.textContent.trim(); if (t.length < 2) continue;
        const el = n.parentElement; if (!el || el.closest('.sr-only, .skip-link, [aria-hidden=true], script, style')) continue;
        const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none') continue;
        let op = 1, a = el; while (a) { op *= +getComputedStyle(a).opacity; a = a.parentElement; } if (op < 0.5) continue;
        const r = document.createRange(); r.selectNodeContents(n); const q = r.getBoundingClientRect(); if (q.width < 4 || q.height < 4) continue;
        out.push({ el, inativo: !!el.closest('button:disabled, [aria-disabled=true], fieldset:disabled'), t: t.slice(0, 40), x: q.x + sx, y: q.y + sy, w: q.width, h: q.height, cor: s.color, tam: parseFloat(s.fontSize), peso: +s.fontWeight, cls: el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0] });
      }
      const fixos = [...document.querySelectorAll('body *')].filter((e) => { const p = getComputedStyle(e).position; return p === 'fixed' || p === 'sticky'; }).map((e) => { const q = e.getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height, el: e }; }).filter((f) => f.w > 0 && f.h > 0 && f.w * f.h < 0.8 * innerWidth * innerHeight);
      for (const t of out) { t.sobFixo = fixos.some((f) => !f.el.contains(t.el) && !(t.x + t.w <= f.x || f.x + f.w <= t.x || t.y + t.h <= f.y || f.y + f.h <= t.y)); const jan = document.querySelector('[role=dialog][aria-modal=true], .av-janela'); if (jan && !jan.contains(t.el)) t.atrasDaJanela = true; delete t.el; }
      return { fixos: fixos.map(({ x, y, w, h }) => ({ x, y, w, h })), textos: out, alto: document.documentElement.dataset.contrast, motion: document.documentElement.dataset.motion };
    });
    await p.screenshot({ path: OUT + '/' + disp + '-' + nome + '.png', fullPage: true });
    fs.writeFileSync(OUT + '/' + disp + '-' + nome + '.json', JSON.stringify(dados));
    await c.close();
  }
  await b.close();
})();
