import { Server, Socket } from 'socket.io'
import { LobbyEvents } from '../../api/socket-api'
import { getUser } from '../dao/user-dao'

const LOBBY_ROOM = 'lobby'

export default function registerLobbyHandler(io: Server, socket: Socket) {
  const onJoinLobbyRequest = () => {
    const user = getUser(socket.id)

    if (user) {
      socket.join(LOBBY_ROOM)
      socket.in(LOBBY_ROOM).emit(LobbyEvents.server.USER_JOINED, user)
    } else {
      io.to(socket.id).emit(LobbyEvents.server.ERR_JOIN_FAILED, {
        code: 401,
        reason: 'unauthenticated',
      })
    }
  }

  const onLeaveLobbyRequest = () => {
    socket.leave(LOBBY_ROOM)
  }

  const onMessageRequest = (message: string) => {
    const user = getUser(socket.id)

    if (!user) {
      io.to(socket.id).emit(LobbyEvents.server.ERR_MESSAGE_FAILED, {
        code: 401,
        reason: 'unauthenticated',
      })
      return
    }

    if (!io.of('').adapter.rooms.has(LOBBY_ROOM)) {
      console.log('client attempted to message empty lobby')
      return
    }

    if (!io.of('').adapter.rooms.get(LOBBY_ROOM)!.has(socket.id)) {
      console.log('client attempted to message lobby from outside')
      return
    }

    socket.to(LOBBY_ROOM).emit(LobbyEvents.server.USER_MESSAGE, message)
  }

  socket
    .on(LobbyEvents.client.JOIN, onJoinLobbyRequest)
    .on(LobbyEvents.client.LEAVE, onLeaveLobbyRequest)
    .on(LobbyEvents.client.MESSAGE, onMessageRequest)
}
