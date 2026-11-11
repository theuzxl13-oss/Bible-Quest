import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AgeRange, Profile, Progress, Question, Settings } from '../types'
import { createLocalServices, type Services } from '../services'
import { emptyProgress } from '../services/storage/repositories'
import { applyMatch, type MatchInput, type MatchOutcome } from '../services/game/engine'
import type { DailyContext } from '../services/game/daily'
import type { CustomContent } from '../services/content'
import { QUESTIONS } from '../data/questions'

interface GameContextValue {
  profile: Profile | null
  progress: Progress
  settings: Settings
  lastOutcome: MatchOutcome | null
  /** Banco de perguntas do Modo Livre (oficial + local, se habilitado no painel). */
  questionPool: Question[]
  customContent: CustomContent
  saveCustomContent(content: CustomContent): void
  dailyContext(): DailyContext
  /** Registra a última experiência aberta (continuar de onde parou). */
  markVisited(experienceId: string): void
  createProfile(input: { nickname: string; avatar: string; ageRange: AgeRange }): Profile
  updateProfile(profile: Profile): void
  recordMatch(input: MatchInput): MatchOutcome
  updateSettings(patch: Partial<Settings>): void
  deleteAllData(): void
  exportData(): string
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children, services: injected }: { children: ReactNode; services?: Services }) {
  const services = useMemo(() => injected ?? createLocalServices(), [injected])
  const [profile, setProfile] = useState<Profile | null>(() => services.auth.current())
  const [progress, setProgress] = useState<Progress>(() => services.progress.load())
  const [settings, setSettings] = useState<Settings>(() => services.settings.load())
  const [lastOutcome, setLastOutcome] = useState<MatchOutcome | null>(null)
  const [customContent, setCustomContent] = useState<CustomContent>(() => services.content.load())

  const questionPool = useMemo(
    () => (customContent.includeInFreeMode ? [...QUESTIONS, ...customContent.questions] : QUESTIONS),
    [customContent],
  )

  const saveCustomContent = useCallback(
    (c: CustomContent) => {
      services.content.save(c)
      setCustomContent(c)
    },
    [services],
  )

  const dailyContext = useCallback(() => services.daily.context(services.progress.load()), [services])

  const markVisited = useCallback(
    (experienceId: string) => {
      const p = services.progress.load()
      if (p.lastExperienceId === experienceId) return
      const next = { ...p, lastExperienceId: experienceId }
      services.progress.save(next)
      setProgress(next)
    },
    [services],
  )

  useEffect(() => {
    const root = document.documentElement
    root.dataset.font = settings.fontScale
    root.dataset.contrast = settings.highContrast ? 'alto' : 'normal'
    root.dataset.motion = settings.reduceMotion ? 'reduzido' : 'normal'
  }, [settings])

  const createProfile = useCallback(
    (input: { nickname: string; avatar: string; ageRange: AgeRange }) => {
      const p = services.auth.createLocalProfile(input)
      setProfile(p)
      return p
    },
    [services],
  )

  const updateProfile = useCallback(
    (p: Profile) => {
      setProfile(services.auth.update(p))
    },
    [services],
  )

  const recordMatch = useCallback(
    (input: MatchInput) => {
      const current = services.progress.load()
      const outcome = applyMatch(current, input, services.daily.context(current).day)
      services.progress.save(outcome.progress)
      setProgress(outcome.progress)
      setLastOutcome(outcome)
      return outcome
    },
    [services],
  )

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch }
        services.settings.save(next)
        return next
      })
    },
    [services],
  )

  const deleteAllData = useCallback(() => {
    services.auth.signOut()
    services.progress.clear()
    setProfile(null)
    setProgress(emptyProgress())
    setLastOutcome(null)
  }, [services])

  const exportData = useCallback(
    () => JSON.stringify({ app: 'Bible Quest', exportedAt: new Date().toISOString(), profile, progress, settings }, null, 2),
    [profile, progress, settings],
  )

  const value: GameContextValue = {
    profile,
    progress,
    settings,
    lastOutcome,
    questionPool,
    customContent,
    saveCustomContent,
    dailyContext,
    markVisited,
    createProfile,
    updateProfile,
    recordMatch,
    updateSettings,
    deleteAllData,
    exportData,
  }
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame precisa estar dentro de <GameProvider>')
  return ctx
}
