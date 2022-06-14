import { GameStateUpdate, GameSummary } from '@icehouse-homeworlds/api/game'
import { EventEmitter } from 'events'
import { Socket } from 'socket.io'
import { User } from './database/users-db'

type ServerEvents = {
  'socket:connected': Socket
  'socket:disconnected': Socket
  'user:registered': User
  'lobby:user-joined': User
  'game:user-left': { playerId: string }
  'game:created': GameSummary
  'game:updated': GameStateUpdate
  'game:deleted': { gameId: string }
}

type EventMap = Record<string, unknown>
type EventKey<T extends EventMap> = string & keyof T
type EventReceiver<T> = (params: T) => void

interface TypedEmitter<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void
  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void
  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void
}

function createEmitter<T extends EventMap>(): TypedEmitter<T> {
  return new EventEmitter()
}

const eventer = createEmitter<ServerEvents>()

export default eventer
