import { QUESTIONS } from '../../data/questions'
import { hashString, seededRandom, shuffle } from '../game/random'
import {
  generateRoomCode,
  isValidRoomCode,
  type CreateRoomInput,
  type MultiplayerService,
  type QuickReaction,
  type Room,
  type RoomEvent,
} from './contracts'

/**
 * MODO DEMONSTRAÇÃO — nada aqui usa rede. Os "participantes" são fictícios,
 * gerados e controlados pelo próprio dispositivo, e identificados como tal na
 * interface. Serve para avaliar a experiência visual das salas e partidas.
 */
export const DEMO_BOT_NAMES = ['Participante fictício A', 'Participante fictício B', 'Participante fictício C']

/** Probabilidade de acerto de cada participante fictício. */
const BOT_ACCURACY = [0.8, 0.6, 0.45]

export class DemoMultiplayerService implements MultiplayerService {
  readonly mode = 'demo' as const
  private rooms = new Map<string, Room>()
  private listeners = new Map<string, Set<(e: RoomEvent) => void>>()

  async createRoom(input: CreateRoomInput): Promise<Room> {
    const seed = hashString(`${input.hostNickname}:${Date.now()}`)
    const rand = seededRandom(seed)
    const pool = QUESTIONS.filter(
      (q) => (input.journeyId === 'todas' || q.journeyId === input.journeyId) && q.type !== 'memory' && q.type !== 'order',
    )
    const room: Room = {
      id: `demo-${seed.toString(36)}`,
      code: generateRoomCode(rand),
      visibility: 'private',
      status: 'waiting',
      journeyId: input.journeyId,
      questionIds: shuffle(pool, rand)
        .slice(0, input.questionCount)
        .map((q) => q.id),
      players: [
        { id: 'you', nickname: input.hostNickname, isHost: true, isDemoBot: false, score: 0, answered: 0 },
        ...DEMO_BOT_NAMES.map((nickname, i) => ({
          id: `bot-${i}`,
          nickname,
          isHost: false,
          isDemoBot: true,
          score: 0,
          answered: 0,
        })),
      ],
      createdAt: new Date().toISOString(),
    }
    this.rooms.set(room.id, room)
    return structuredClone(room)
  }

  async joinRoom(code: string, _nickname: string): Promise<Room> {
    if (!isValidRoomCode(code.toUpperCase())) throw new Error('Código inválido. Use 6 letras ou números.')
    throw new Error(
      'Entrar em salas de outras pessoas exige conexão com o servidor, que ainda não está disponível nesta versão de demonstração.',
    )
  }

  subscribe(roomId: string, listener: (e: RoomEvent) => void) {
    const set = this.listeners.get(roomId) ?? new Set()
    set.add(listener)
    this.listeners.set(roomId, set)
    return () => set.delete(listener)
  }

  private emit(roomId: string, e: RoomEvent) {
    this.listeners.get(roomId)?.forEach((l) => l(e))
  }

  private room(roomId: string): Room {
    const r = this.rooms.get(roomId)
    if (!r) throw new Error('Sala não encontrada.')
    return r
  }

  async startMatch(roomId: string) {
    const r = this.room(roomId)
    r.status = 'playing'
    this.emit(roomId, { type: 'room-updated', room: structuredClone(r) })
    return structuredClone(r)
  }

  async submitAnswer(roomId: string, playerId: string, questionId: string, correct: boolean, points: number) {
    const r = this.room(roomId)
    const me = r.players.find((p) => p.id === playerId)
    if (!me) return
    me.answered++
    if (correct) me.score += points
    this.emit(roomId, { type: 'answer-submitted', playerId, questionId, correct })
    // Participantes fictícios respondem de forma determinística.
    r.players
      .filter((p) => p.isDemoBot)
      .forEach((bot, i) => {
        const rand = seededRandom(hashString(`${r.id}:${questionId}:${bot.id}`))
        const ok = rand() < BOT_ACCURACY[i % BOT_ACCURACY.length]
        bot.answered++
        if (ok) bot.score += points
        this.emit(roomId, { type: 'answer-submitted', playerId: bot.id, questionId, correct: ok })
      })
    if (r.players.every((p) => p.answered >= r.questionIds.length)) {
      r.status = 'finished'
      this.emit(roomId, { type: 'match-finished', room: structuredClone(r) })
    } else {
      this.emit(roomId, { type: 'room-updated', room: structuredClone(r) })
    }
  }

  async react(roomId: string, playerId: string, reaction: QuickReaction) {
    this.emit(roomId, { type: 'reaction', playerId, reaction })
  }

  async leaveRoom(roomId: string) {
    this.rooms.delete(roomId)
    this.listeners.delete(roomId)
  }
}
