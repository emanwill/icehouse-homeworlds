import { io, Socket } from 'socket.io-client'
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@icehouse-homeworlds/api'

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io()

socket.on('lobby:chatMessage', (chatMsg) => {
  console.log(chatMsg.message)
})
