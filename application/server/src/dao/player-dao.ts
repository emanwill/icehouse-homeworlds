import { Socket } from 'socket.io'
import { awaitTimeout, GameObjectIds } from '../util'

type PlayerSocket = {
  socketId: string
  playerId: string
}

const mapBySocketId = new Map<string, PlayerSocket>()

const mapByPlayerId = new Map<string, PlayerSocket>()

export const createPlayer = async (ioSocket: Socket) => {
  await awaitTimeout()

  const socket: PlayerSocket = {
    socketId: ioSocket.id,
    playerId: GameObjectIds.player(),
  }

  mapBySocketId.set(socket.socketId, socket)
  mapByPlayerId.set(socket.playerId, socket)

  return socket.playerId
}

export const addPlayerSocket = async (socket: PlayerSocket) => {
  await awaitTimeout()

  mapBySocketId.set(socket.socketId, socket)
  mapByPlayerId.set(socket.playerId, socket)
}

export const findPlayerSocketBySocketId = async (socketId: string) => {
  await awaitTimeout()

  return mapBySocketId.get(socketId)
}

export const findPlayerSocketByPlayerId = async (playerId: string) => {
  await awaitTimeout()

  return mapByPlayerId.get(playerId)
}

export const deleteOneByPlayerId = async (playerId: string) => {
  await awaitTimeout()

  const socket = mapByPlayerId.get(playerId)

  if (!socket) return

  mapByPlayerId.delete(socket.playerId)
  mapBySocketId.delete(socket.socketId)
}

export const deleteOneBySocketId = async (socketId: string) => {
  await awaitTimeout()

  const socket = mapBySocketId.get(socketId)

  if (!socket) return

  mapByPlayerId.delete(socket.playerId)
  mapBySocketId.delete(socket.socketId)
}
