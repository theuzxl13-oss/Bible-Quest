import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { QuizRunner } from '../components/QuizRunner'
import { getChapter, getJourney } from '../data/journeys'
import { questionsForChapter } from '../data/questions'
import { shuffle } from '../services/game/random'
import { isChapterUnlocked } from '../services/game/unlock'
import { useGame } from '../state/GameContext'
import NotFound from './NotFound'

export default function Challenge() {
  const { chapterId } = useParams()
  const chapter = getChapter(chapterId)
  const { progress } = useGame()
  // Embaralha a ordem uma única vez por montagem; memória e ordenação vão para o fim.
  const questions = useMemo(() => {
    if (!chapter) return []
    const qs = shuffle(questionsForChapter(chapter.id))
    return [...qs.filter((q) => q.type !== 'memory' && q.type !== 'order'), ...qs.filter((q) => q.type === 'memory' || q.type === 'order')]
  }, [chapter])

  if (!chapter) return <NotFound />
  if (!isChapterUnlocked(chapter.id, progress)) return <Navigate to={`/jornada/${chapter.journeyId}`} replace />
  const journey = getJourney(chapter.journeyId)!

  return (
    <QuizRunner
      key={chapter.id}
      questions={questions}
      title={`${journey.title} · Cap. ${chapter.order}`}
      mode="capitulo"
      journeyId={journey.id}
      chapterId={chapter.id}
      exitTo={`/capitulo/${chapter.id}`}
    />
  )
}
