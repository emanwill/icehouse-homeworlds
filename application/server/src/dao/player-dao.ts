import { Socket } from 'socket.io'
import { GameObjectIds } from '../util'

type PlayerSocket = {
  socketId: string
  playerId: string
}

const mapBySocketId = new Map<string, PlayerSocket>()

const mapByPlayerId = new Map<string, PlayerSocket>()

export const createPlayer = (ioSocket: Socket) => {
  const socket: PlayerSocket = {
    socketId: ioSocket.id,
    playerId: GameObjectIds.player(),
  }

  mapBySocketId.set(socket.socketId, socket)
  mapByPlayerId.set(socket.playerId, socket)

  return socket.playerId
}

export const addPlayerSocket = (socket: PlayerSocket) => {
  mapBySocketId.set(socket.socketId, socket)
  mapByPlayerId.set(socket.playerId, socket)
}

export const findOneBySocketId = (socketId: string) => {
  return mapBySocketId.get(socketId)
}

export const findOneByPlayerId = (playerId: string) => {
  return mapByPlayerId.get(playerId)
}

export const deleteOneByPlayerId = (playerId: string) => {
  const socket = mapByPlayerId.get(playerId)

  if (!socket) return

  mapByPlayerId.delete(socket.playerId)
  mapBySocketId.delete(socket.socketId)
}

export const deleteOneBySocketId = (socketId: string) => {
  const socket = mapBySocketId.get(socketId)

  if (!socket) return

  mapByPlayerId.delete(socket.playerId)
  mapBySocketId.delete(socket.socketId)
}
