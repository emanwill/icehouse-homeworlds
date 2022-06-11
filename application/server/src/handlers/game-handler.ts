import {SocketAck} from '@icehouse-homeworlds/api/common'
import { IceworldsIOServer, IceworldsIOSocket } from '../express-io-server'

export default function registerGameHandler(
  io: IceworldsIOServer,
  socket: IceworldsIOSocket
) {
  
  
  socket
    .on('game:create')
    .on('game:join')
    .on('game:begin')
    .on('game:leave')
    .on('game:setup')
    .on('game:move')
}
