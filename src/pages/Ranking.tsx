import { useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Notice, PageHeader } from '../components/ui'
import { STORY_SEQUENCE } from '../data/story'
import { FREE_MODES } from '../services/game/freeModes'
import { levelFromXp, levelTitle } from '../services/game/levels'
import { dayKey } from '../services/game/dates'
import { visibleStreak } from '../services/game/streak'
import { useGame } from '../state/GameContext'
import { quizCompletion } from '../services/game/quizMap'

type Tab = 'geral' | 'historia' | 'livre' | 'diario' | 'multiplayer'
const TABS: { id: Tab; label: string }[] = [
  { id: 'geral', label: 'XP geral' },
  { id: 'historia', label: 'Modo História' },
  { id: 'livre', label: 'Modo Quiz' },
  { id: 'diario', label: 'Desafio diário' },
  { id: 'multiplayer', label: 'Multiplayer (futuro)' },
]

/**
 * Rankings. Sem servidor não existe classificação entre jogadores; a tela
 * mostra somente os recordes reais deste aparelho e informa que o ranking
 * online está indisponível. Nenhum jogador ou posição é inventado.
 */
export default function Ranking() {
  const [params, setParams] = useSearchParams()
  const tab = (TABS.find((t) => t.id === params.get('aba'))?.id ?? 'geral') as Tab
  const { progress, profile } = useGame()
  const name = profile?.character?.name ?? profile?.nickname
  const stars = Object.values(progress.experiences).reduce((s, e) => s + e.bestStars, 0)
  const done = STORY_SEQUENCE.filter((e) => progress.experiences[e.id]?.completed).length
  const level = levelFromXp(progress.xp)

  const rows: Record<Tab, [string, string][]> = {
    geral: [['XP total', `${progress.xp}`], ['Nível', `${level} · ${levelTitle(level)}`], ['Respostas certas', `${progress.stats.correct} de ${progress.stats.answered}`], ['Maior sequência de acertos', `${progress.bestAnswerStreak}`]],
    historia: [['Fases concluídas', `${done} de ${STORY_SEQUENCE.length}`], ['Estrelas', `${stars} de ${STORY_SEQUENCE.length * 3}`], ['Fases com 3 estrelas', `${Object.values(progress.experiences).filter((e) => e.bestStars === 3).length}`], ['Baús abertos', `${Object.keys(progress.chests).length}`]],
    livre: [['Desafios do mapa concluídos', `${quizCompletion(progress).done} de ${quizCompletion(progress).total}`], ['Estrelas no mapa do Quiz', `${quizCompletion(progress).stars} de ${quizCompletion(progress).maxStars}`], ['Partidas', `${progress.free.matches}`], ...FREE_MODES.filter((m) => progress.free.byMode[m.id]).map((m) => [`Recorde · ${m.title}`, `${progress.free.byMode[m.id]!.best} pts`] as [string, string]), ['Acertos no Contra o tempo (recorde)', `${progress.free.bestTimeAttack}`]],
    diario: [['Desafios concluídos', `${progress.daily.completedCount}`], ['Sequência atual', `${visibleStreak(progress.streak, dayKey())} dias`], ['Melhor sequência', `${progress.streak.best} dias`], ['Último desafio', progress.daily.lastCompletedDay ?? '—']],
    multiplayer: [['Partidas de demonstração', `${progress.multiplayer.demoMatches}`], ['Vitórias em demonstração', `${progress.multiplayer.demoWins}`]],
  }

  return (
    <div className="container section stack-lg narrow">
      <PageHeader eyebrow="Rankings" title="Seus recordes">
        Classificações por categoria.
      </PageHeader>
      <Notice tone="info" icon="info" title="Ranking online indisponível">
        Comparar resultados com outros jogadores exige um servidor, que ainda não existe nesta versão. Por isso, aqui
        aparecem apenas os seus recordes, salvos neste aparelho. Nenhum jogador ou posição é inventado.
      </Notice>
      <div className="tabs" role="tablist" aria-label="Categorias de ranking">
        {TABS.map((t) => (
          <button key={t.id} role="tab" id={`rk-${t.id}`} aria-selected={tab === t.id} aria-controls="rk-panel" className={`tab ${tab === t.id ? 'is-on' : ''}`} onClick={() => setParams({ aba: t.id }, { replace: true })}>
            {t.label}
          </button>
        ))}
      </div>
      <section id="rk-panel" role="tabpanel" aria-labelledby={`rk-${tab}`} className="panel stack">
        <h2><Icon name="trophy" /> {name}</h2>
        <div className="table-wrap">
          <table className="simple-table">
            <caption className="sr-only">Recordes de {name} em {TABS.find((t) => t.id === tab)?.label}</caption>
            <tbody>{rows[tab].map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody>
          </table>
        </div>
        {tab === 'multiplayer' && <p className="small muted">As partidas multiplayer desta versão são demonstrações contra participantes fictícios e não rendem XP.</p>}
      </section>
    </div>
  )
}
