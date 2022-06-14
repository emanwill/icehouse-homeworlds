import { asyncTimeout, log } from '../util'
import events from '../events'

export type User = {
  name: string
}

const socketUserMap = new Map<string, User>()

export async function addUser(socketId: string, user: User) {
  await asyncTimeout()
  socketUserMap.set(socketId, user)
}

export async function findUserBySocketId(id: string) {
  await asyncTimeout()
  return socketUserMap.get(id)
}

export async function deleteUserBySocketId(id: string) {
  await asyncTimeout()
  socketUserMap.delete(id)
}

events.on('socket:disconnected', (socket) => {
  deleteUserBySocketId(socket.id).catch(log.error)
})
