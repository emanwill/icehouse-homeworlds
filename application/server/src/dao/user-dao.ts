export type User = {
  name: string
}

const socketUserMap = new Map<string, User>()

export function addUser(socketId: string, user: User) {
  socketUserMap.set(socketId, user)
}

export function findUserBySocketId(id: string) {
  return socketUserMap.get(id)
}

export function deleteUserBySocketId(id: string) {
  socketUserMap.delete(id)
}
