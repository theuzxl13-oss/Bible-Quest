import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GameIcon } from '../components/GameIcon'
import { ProgressBar } from '../components/ui'
import { STORY_SEQUENCE } from '../data/story'
import { levelProgress, levelTitle } from '../services/game/levels'
import { continueExperience } from '../services/game/progression'
import { visibleStreak } from '../services/game/streak'
import { useGame } from '../state/GameContext'
import { PlayerCharacter } from '../components/character/PlayerCharacter'
import { weakTopics } from '../services/game/review'
import { phaseNumber } from '../services/game/journeyMap'
import { quizAvatarNode, quizCompletion } from '../services/game/quizMap'
import { DAILY_BONUS } from '../services/game/scoring'
import { bausDisponiveis, conquistaRecente, elementosLiberados, formatarTempo, minutosAteAmanha, proximaMelhoria } from '../services/game/acampamento'
import { textoCondicao } from '../data/acampamento'
import { CenaAcampamento, type CenaApi, type RotuloAcampamento } from '../components/camp/CenaAcampamento'
import type { AlvoAcampamento } from '../character3d/acampamento'
import type { Progress } from '../types'
import { PainelMissoes, type ItemMissao } from '../components/camp/PainelMissoes'
import { AcoesAcampamento } from '../components/camp/AcoesAcampamento'

export const MODE_LABEL = { historia: 'Modo História', livre: 'Modo Quiz · treino', quiz: 'Modo Quiz', diario: 'Desafio diário', revisao: 'Revisão', 'demo-multiplayer': 'Multiplayer (demo)' } as const

/** Progresso geral: fases publicadas do Modo História + desafios do mapa do Quiz. */
export function overallProgress(p: Progress) {
  const story = STORY_SEQUENCE.filter((e) => p.experiences[e.id]?.completed).length
  const quiz = quizCompletion(p)
  return { done: story + quiz.done, total: STORY_SEQUENCE.length + quiz.total, story, quiz }
}

/** Contagem regressiva até o próximo desafio diário, atualizada a cada minuto. */
function useMinutosAteAmanha() {
  const [min, setMin] = useState(() => minutosAteAmanha())
  useEffect(() => {
    const t = window.setInterval(() => setMin(minutosAteAmanha()), 30000)
    return () => window.clearInterval(t)
  }, [])
  return min
}

/**
 * CENTRAL DO JOGADOR (Etapa 2, tela piloto): o Acampamento de Aventura.
 * Cena em tela cheia com o personagem em destaque, HUD com dados reais, painel
 * de missões recolhível e as ações (Continuar, Modo História, Modo Quiz).
 * Revisão, estatísticas, ranking e histórico ficam no painel de missões e no Perfil.
 */
export default function Dashboard() {
  const { profile, progress, dailyContext, questionPool } = useGame()
  const navigate = useNavigate()
  const cena = useRef<CenaApi>(null)
  const character = profile!.character!
  const lp = levelProgress(progress.xp)
  const today = dailyContext().day
  const streak = visibleStreak(progress.streak, today)
  const dailyDone = progress.daily.lastCompletedDay === today
  const cont = continueExperience(progress)
  const overall = overallProgress(progress)
  const quizNext = quizAvatarNode(progress)
  const stars = Object.values(progress.experiences).reduce((s, e) => s + e.bestStars, 0) + overall.quiz.stars
  const baus = bausDisponiveis(progress)
  const recente = conquistaRecente(progress)
  const melhoria = proximaMelhoria(progress)
  const elementos = elementosLiberados(progress)
  const weak = weakTopics(progress, questionPool)
  const minutos = useMinutosAteAmanha()

  const rotulos: RotuloAcampamento[] = [
    { id: 'tenda', label: 'Personagem', detalhe: 'roupas e acessórios na tenda', icon: 'tunica' },
    { id: 'mesa', label: 'Biblioteca', detalhe: 'mesa de estudos', icon: 'book' },
    { id: 'quadro', label: 'Desafio diário', detalhe: dailyDone ? 'concluído hoje' : `5 perguntas, +${DAILY_BONUS} XP, uma vez por dia`, icon: 'scroll', badge: dailyDone ? undefined : 1 },
    { id: 'bau', label: 'Recompensas', detalhe: baus ? `${baus} baú(s) pronto(s) para abrir no mapa` : 'conquistas e baús', icon: 'bau', badge: baus || undefined },
  ]
  const destino: Record<AlvoAcampamento, string> = {
    personagem: '/guarda-roupa',
    tenda: '/guarda-roupa',
    mesa: '/biblioteca',
    quadro: '/diario',
    bau: baus ? '/historia' : '/conquistas',
  }

  const missoes: ItemMissao[] = [
    { id: 'diario', icon: dailyDone ? 'check' : 'calendar', titulo: 'Desafio diário', to: '/diario', estado: dailyDone ? 'feito' : undefined, detalhe: dailyDone ? `Concluído. Próximo em ${formatarTempo(minutos)}` : `5 perguntas · +${DAILY_BONUS} XP de bônus · termina em ${formatarTempo(minutos)}` },
    { id: 'jornada', icon: 'map', titulo: 'Continuar jornada', to: cont ? `/historia/${cont.bookId}/${cont.id}` : '/historia', detalhe: cont ? `Fase ${phaseNumber(cont.id)} · ${cont.title}` : 'Todas as fases publicadas concluídas' },
    { id: 'baus', icon: 'bau', titulo: baus ? `${baus} ${baus === 1 ? 'baú pronto' : 'baús prontos'} para abrir` : 'Baús de recompensa', to: baus ? '/historia' : '/conquistas', estado: baus ? 'destaque' : undefined, detalhe: baus ? 'Abra no mapa do Modo História.' : recente ? `Conquista recente: ${recente.title}` : 'Conclua fases para liberar baús no mapa.' },
    { id: 'revisao', icon: 'cerebro', titulo: 'Revisão inteligente', to: '/revisao', detalhe: weak.length ? `${weak.length} assunto(s) para revisar · ${weak[0].title}: ${Math.round(weak[0].ratio * 100)}% de acertos` : 'Erros, assuntos dominados e evolução.' },
  ]
  if (melhoria) {
    missoes.push({ id: 'upgrade', icon: 'tenda', titulo: `Próximo no acampamento: ${melhoria.elemento.nome}`, detalhe: `${textoCondicao(melhoria.elemento.condicao)} (${melhoria.atual}/${melhoria.meta})`, progresso: { valor: melhoria.atual, max: melhoria.meta, rotulo: `Andamento até liberar ${melhoria.elemento.nome}` } })
  }
  missoes.push({ id: 'geral', icon: 'compass', titulo: 'Progresso geral', detalhe: `${overall.done} de ${overall.total} fases e desafios · ${progress.xp} XP no total · próximo desafio do Quiz: ${quizNext.title}`, progresso: { valor: overall.done, max: overall.total, rotulo: 'Progresso geral' } })
  const pendentes = (dailyDone ? 0 : 1) + (baus ? 1 : 0)

  return (
    <div className="camp">
      <section className="camp-stage" aria-labelledby="home-name">
        <CenaAcampamento ref={cena} appearance={character} elementos={elementos} bauPronto={baus > 0} rotulos={rotulos} onSelect={(a) => navigate(destino[a])} />

        <header className="camp-hud">
          <Link to="/perfil" className="hud-player" aria-label={`Perfil de ${profile!.nickname}`}>
            <span className="hud-portrait"><PlayerCharacter size={56} portrait pose="still" /></span>
            <span className="hud-player-info">
              <span className="hud-name">
                <h1 id="home-name">{character.name}</h1>
              </span>
              <span className="hud-level"><GameIcon name="shield" size={18} /> <span className="hud-level-texto">Nível {lp.level} · {levelTitle(lp.level)}</span></span>
              <span className="hud-xp">
                <ProgressBar value={lp.current} max={lp.needed} label="Progresso para o próximo nível" />
                <span className="hud-xp-text">{lp.current} / {lp.needed} XP</span>
              </span>
            </span>
          </Link>
          <div className="hud-resources">
            <span className="hud-res" aria-label={`${stars} estrelas conquistadas`} title="Estrelas das fases e desafios">
              <span className="hud-res-icon" aria-hidden="true"><GameIcon name="star" size={30} /></span>
              {stars}
            </span>
            <span className="hud-res" aria-label={`Sequência de ${streak} ${streak === 1 ? 'dia' : 'dias'}`} title="Dias seguidos jogando">
              <span className="hud-res-icon" aria-hidden="true"><GameIcon name="flame" size={30} /></span>
              {streak}
            </span>
            <Link to="/configuracoes" className="hud-settings" aria-label="Configurações"><GameIcon name="settings" size={30} /></Link>
          </div>
        </header>

        <PainelMissoes itens={missoes} pendentes={pendentes} />

        <AcoesAcampamento
          proxima={cont}
          historia={{ feitas: overall.story, total: STORY_SEQUENCE.length }}
          quiz={{ feitos: overall.quiz.done, total: overall.quiz.total }}
          onGesto={(m) => cena.current?.gesto(m === 'historia' ? 'celebrate' : 'react', 2.4)}
        />
      </section>
    </div>
  )
}
