import { Server, Socket } from 'socket.io'
import { addUser, deleteUser, User } from '../dao/user-dao'

export default function registerUserHandler(_io: Server, socket: Socket) {
  const createUser = (userPayload: User) => {
    addUser(socket.id, userPayload)
  }

  const removeUser = () => {
    deleteUser(socket.id)
  }
}
