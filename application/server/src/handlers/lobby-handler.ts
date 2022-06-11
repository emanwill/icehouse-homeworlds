import { SocketAck } from '@icehouse-homeworlds/api/common'
import { LobbyState } from '@icehouse-homeworlds/api/lobby'
// import { getUser } from '../dao/user-dao'
import { IceworldsIOServer, IceworldsIOSocket } from '../express-io-server'

// const LOBBY_ROOM = 'lobby'

export default function registerLobbyHandler(
  io: IceworldsIOServer,
  socket: IceworldsIOSocket
) {
  const onJoinLobby = (username: string, cb: SocketAck<LobbyState>) => {
    console.log('user %s wants to join the lobby', username)
    cb(null, { users: [] })
  }

  const onLeaveLobby = () => {
    console.log('user %s wants to leave the lobby', username)
  }

  const onSendChat = (message: string) => {
    console.log('got a chat message: %s', message)
  }

  socket
    .on('lobby:join', onJoinLobby)
    .on('lobby:leave', onLeaveLobby)
    .on('lobby:sendChat', onSendChat)
}
