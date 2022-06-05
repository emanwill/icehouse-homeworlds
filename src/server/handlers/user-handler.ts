import { Server, Socket } from 'socket.io'
import { SocketEvents, UserEvents } from '../../api/socket-api'
import { addUser, deleteUser, User } from '../dao/user-dao'

export default function registerUserHandler(_io: Server, socket: Socket) {
  const createUser = (userPayload: User) => {
    addUser(socket.id, userPayload)
  }

  const removeUser = () => {
    deleteUser(socket.id)
  }

  socket
    .on(UserEvents.client.CREATE_USER, createUser)
    .on(SocketEvents.DISCONNECT, removeUser)
}
