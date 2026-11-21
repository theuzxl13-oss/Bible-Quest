import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlayerCharacter } from '../../components/character/PlayerCharacter'
import { GameIcon } from '../../components/GameIcon'
import { CAMINHO_PEDRA, CenaMapa, caminhoSuave, type Ponto } from '../../components/map/aventura/Cena'
import { AjudaMapa, CabecalhoMapa, ContadorEstrelas, Medalhao } from '../../components/map/aventura/Interface'
import { JanelaFaseQuiz } from '../../components/map/aventura/JanelaFaseQuiz'
import { CENARIO_QUIZ, zonasPorNo } from '../../data/mapas/cenarios'
import { QUIZ_REGIONS, type QuizNode, type QuizRegion } from '../../data/quiz/regions'
import { getFreeMode } from '../../services/game/freeModes'
import { isQuizRegionUnlocked, quizAvatarNode, quizCompletion, quizNodeState } from '../../services/game/quizMap'
import { useGame } from '../../state/GameContext'

/*
 * MAPA DO MODO QUIZ — trilha própria de desafios (independente do Modo
 * História), com cenário de templos, bibliotecas, pergaminhos e enigmas.
 * Cada dificuldade é uma região; o seletor troca a região mostrada.
 */

const W = 400
const PASSO = 112
const BASE = 150
const TOPO = 270

const NIVEL_DA_REGIAO: Record<string, string> = { vale: 'Iniciante', planicie: 'Intermediário', montanhas: 'Avançado', torre: 'Especialista' }

function layout(region: QuizRegion) {
  const H = BASE + TOPO + (region.nodes.length - 1) * PASSO
  const pts: Ponto[] = region.nodes.map((n, i) => ({ id: n.id, x: W / 2 + (i % 2 === 0 ? -1 : 1) * (78 + (i % 3) * 18), y: H - BASE - i * PASSO }))
  return { H, pts, d: caminhoSuave(pts, H + 10, -10) }
}

const pct = (v: number, t: number) => `${(v / t) * 100}%`

const ATALHOS = [
  { to: '/quiz/treino/contra-o-tempo', label: 'Desafio por tempo', icone: 'clock' },
  { to: '/quiz/treino/tema', label: 'Desafio por tema', icone: 'users' },
  { to: '/quiz/treino/dificuldade', label: 'Desafio avançado', icone: 'trophy' },
  { to: '/quiz/treino/aleatorias', label: 'Perguntas aleatórias', icone: 'scroll' },
] as const

export default function QuizMap() {
  const { progress } = useGame()
  const [toast, setToast] = useState('')
  const [ajuda, setAjuda] = useState(false)
  const [aberto, setAberto] = useState<QuizNode | null>(null)
  const avatar = quizAvatarNode(progress)
  const comp = quizCompletion(progress)
  const [regiaoId, setRegiaoId] = useState(avatar.regionId)
  const regiao = QUIZ_REGIONS.find((r) => r.id === regiaoId) ?? QUIZ_REGIONS[0]
  const ri = QUIZ_REGIONS.indexOf(regiao)
  const open = isQuizRegionUnlocked(regiao.id, progress)
  const { H, pts, d } = layout(regiao)
  const pos = new Map(pts.map((p) => [p.id, p]))
  const av = pos.get(avatar.id)
  const zonas = zonasPorNo(CENARIO_QUIZ[regiao.id] ?? CENARIO_QUIZ.vale, regiao.nodes.map((_, i) => i + 1))
  const feitos = regiao.nodes.filter((n) => quizNodeState(n.id, progress) === 'concluido').length

  useEffect(() => {
    window.setTimeout(() => document.querySelector(`[data-qnode="${regiao.id === avatar.regionId ? avatar.id : regiao.nodes[0].id}"]`)?.scrollIntoView({ block: 'center' }), 60)
  }, [regiao.id, avatar.id, avatar.regionId, regiao.nodes])
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(t)
  }, [toast])

  return (
    <div className="av-mapa av-quiz quiz-map">
      <CabecalhoMapa titulo="Modo Quiz" subtitulo="Teste seu conhecimento" icone="cerebro" onAjuda={() => setAjuda(true)}>
        <label className="av-placa av-dificuldade">
          <span className="av-placa-rotulo">Dificuldade</span>
          <select value={regiao.id} onChange={(e) => setRegiaoId(e.target.value)} aria-label="Dificuldade (região do mapa)">
            {QUIZ_REGIONS.map((r) => (
              <option key={r.id} value={r.id}>{NIVEL_DA_REGIAO[r.id] ?? r.title}{isQuizRegionUnlocked(r.id, progress) ? '' : ' (bloqueada)'}</option>
            ))}
          </select>
          <span className="av-placa-num" aria-label={`${feitos} de ${regiao.nodes.length} concluídos nesta região`}><GameIcon name="flag" size={18} /> {feitos} / {regiao.nodes.length}</span>
        </label>
        <ContadorEstrelas estrelas={comp.stars} max={comp.maxStars} baus={0} onBau={() => setToast('No Modo Quiz, a recompensa vem ao concluir cada desafio pela primeira vez.')} />
      </CabecalhoMapa>

      <div className="av-coluna" role="region" aria-label="Mapa de desafios">
        <section id={regiao.id} className={`av-trecho ${open ? '' : 'is-locked'}`} aria-labelledby={`${regiao.id}-t`}>
          <div className="av-canvas" style={{ aspectRatio: `${W} / ${H}` }}>
            <CenaMapa W={W} H={H} pts={pts} d={d} zonas={zonas} passo={PASSO} caminho={CAMINHO_PEDRA} semente={`quiz-${regiao.id}`} horizonte={{ ceu: ['#86bdea', '#f3ead2'], montanhas: '#a49ab8' }} />
            <h2 id={`${regiao.id}-t`} className="av-fita-regiao"><span>{regiao.title}</span></h2>
            {!open && (
              <p className="av-aviso-bloqueio">
                <GameIcon name="lock" size={26} /> Conclua todos os desafios de {QUIZ_REGIONS[ri - 1]?.title} para abrir esta região.
              </p>
            )}
            {regiao.nodes.map((n, i) => {
              const p = pos.get(n.id)!
              const st = quizNodeState(n.id, progress)
              const np = progress.quiz.nodes[n.id]
              const mode = getFreeMode(n.mode)
              const estado = st === 'concluido' ? 'concluida' : st === 'atual' ? 'atual' : 'bloqueada'
              const label = `${regiao.title}, desafio ${i + 1}: ${n.title}. ${st === 'concluido' ? `Concluído, ${np?.bestStars ?? 0} de 3 estrelas` : st === 'atual' ? 'Disponível' : 'Bloqueado'}`
              return (
                <div key={n.id} data-qnode={n.id} className={`av-no av-no-quiz is-${estado}`} style={{ left: pct(p.x, W), top: pct(p.y, H) }}>
                  <button type="button" className="av-medalhao" aria-label={label} onClick={() => setAberto(n)}>
                    <Medalhao numero={i + 1} estado={estado} estrelas={np?.bestStars ?? 0} icone={mode?.icon} />
                  </button>
                </div>
              )
            })}
            {av && (
              <div className={`av-avatar ${av.x > W / 2 ? 'lado-esq' : 'lado-dir'}`} style={{ left: pct(av.x, W), top: pct(av.y, H) }} aria-hidden="true">
                <PlayerCharacter size={78} pose="idle" />
              </div>
            )}
          </div>
        </section>
      </div>

      <nav className="av-atalhos" aria-label="Treino livre">
        {ATALHOS.map((a) => (
          <Link key={a.to} to={a.to} className="av-atalho">
            <GameIcon name={a.icone} size={34} />
            <span>{a.label}</span>
          </Link>
        ))}
      </nav>

      {aberto && <JanelaFaseQuiz node={aberto} onFechar={() => setAberto(null)} />}
      {ajuda && (
        <AjudaMapa
          onFechar={() => setAjuda(false)}
          itens={[
            { icone: 'shield', texto: 'Cada dificuldade é uma região do mapa: Iniciante, Intermediário, Avançado e Especialista. Troque no seletor.' },
            { icone: 'flag', texto: 'A trilha começa embaixo. Toque num desafio para ver as regras e começar.' },
            { icone: 'star', texto: 'Cada desafio dá até 3 estrelas. A primeira conclusão rende XP extra e libera o próximo.' },
            { icone: 'lock', texto: 'A região seguinte abre quando todos os desafios da anterior forem concluídos.' },
            { icone: 'cerebro', texto: 'Os botões de baixo levam ao treino livre. O Modo Quiz tem progresso próprio, separado do Modo História.' },
          ]}
        />
      )}
      <p className="map-toast" role="status" aria-live="polite">{toast && <span>{toast}</span>}</p>
    </div>
  )
}
