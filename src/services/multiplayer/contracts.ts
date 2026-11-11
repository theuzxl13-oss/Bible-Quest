
/*
 * CONTRATOS DO MULTIPLAYER
 * Implementações:
 *  - DemoMultiplayerService: apenas demonstração local (versão GitHub Pages).
 *  - SupabaseMultiplayerService (futuro): Realtime + PostgreSQL + RLS.
 *
 * Regras de segurança previstas para a versão online:
 *  - Sem chat livre: apenas reações predefinidas (QuickReaction).
 *  - Salas privadas por código de convite; partidas públicas somente para 13+.
 *  - Respostas validadas no servidor (Edge Function), nunca confiando no cliente.
 *  - Denúncia de apelidos ofensivos e bloqueio de jogadores.
 */

export type RoomVisibility = 'private'
export type RoomStatus = 'waiting' | 'playing' | 'finished'

export interface RoomPlayer {
  id: string
  nickname: string
  isHost: boolean
  /** true para participantes fictícios do modo demonstração. */
  isDemoBot: boolean
  score: number
  answered: number
}

export interface Room {
  id: string
  /** Código de convite (6 caracteres, sem letras ambíguas). */
  code: string
  visibility: RoomVisibility
  status: RoomStatus
  /** Tema: 'todas' ou o id de um livro bíblico. */
  theme: string
  questionIds: string[]
  players: RoomPlayer[]
  createdAt: string
}

export const QUICK_REACTIONS = ['Boa resposta!', 'Quase!', 'Parabéns!', 'Vamos lá!'] as const
export type QuickReaction = (typeof QUICK_REACTIONS)[number]

export type RoomEvent =
  | { type: 'room-updated'; room: Room }
  | { type: 'answer-submitted'; playerId: string; questionId: string; correct: boolean }
  | { type: 'reaction'; playerId: string; reaction: QuickReaction }
  | { type: 'match-finished'; room: Room }

export interface CreateRoomInput {
  hostNickname: string
  theme: string
  questionCount: number
}

export interface MultiplayerService {
  readonly mode: 'demo' | 'online'
  createRoom(input: CreateRoomInput): Promise<Room>
  joinRoom(code: string, nickname: string): Promise<Room>
  subscribe(roomId: string, listener: (e: RoomEvent) => void): () => void
  startMatch(roomId: string): Promise<Room>
  submitAnswer(roomId: string, playerId: string, questionId: string, correct: boolean, points: number): Promise<void>
  react(roomId: string, playerId: string, reaction: QuickReaction): Promise<void>
  leaveRoom(roomId: string): Promise<void>
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateRoomCode(rand: () => number = Math.random): string {
  let code = ''
  for (let i = 0; i < 6; i++) code += CODE_ALPHABET[Math.floor(rand() * CODE_ALPHABET.length)]
  return code
}

export function isValidRoomCode(code: string): boolean {
  return new RegExp(`^[${CODE_ALPHABET}]{6}$`).test(code)
}
