import { Socket } from 'socket.io'
import { asyncTimeout, GameObjectIds } from '../util'

type PlayerRecord = {
  socketId: string
  playerName: string
  playerId: string
}

const recordsBySocketId = new Map<string, PlayerRecord>()

const recordsByPlayerId = new Map<string, PlayerRecord>()

export async function createPlayer(socket: Socket, name: string) {
  await asyncTimeout()

  const record: PlayerRecord = {
    socketId: socket.id,
    playerName: name,
    playerId: GameObjectIds.player(),
  }

  recordsByPlayerId.set(record.playerId, record)
  recordsBySocketId.set(record.socketId, record)

  return record
}

export async function findPlayerBySocketId(id: string) {
  await asyncTimeout()

  return recordsBySocketId.get(id)
}

export async function findPlayerByPlayerId(id: string) {
  await asyncTimeout()

  return recordsByPlayerId.get(id)
}

export async function deletePlayerBySocketId(id: string) {
  await asyncTimeout()

  const record = recordsBySocketId.get(id)
  if (record) {
    recordsByPlayerId.delete(record.playerId)
    recordsBySocketId.delete(record.socketId)
  }
}
