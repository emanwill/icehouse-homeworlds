export type User = {
  name: string
}

const socketUserMap = new Map<string, User>()

export function addUser(id: string, user: User) {
  socketUserMap.set(id, user)
}

export function getUser(id: string) {
  return socketUserMap.get(id)
}

export function deleteUser(id: string) {
  socketUserMap.delete(id)
}
