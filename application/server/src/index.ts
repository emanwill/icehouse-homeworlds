import { socketServer } from './express-io-server'
import events from './events'
import registerGameHandler from './handlers/game-handler'
import registerLobbyHandler from './handlers/lobby-handler'
// import registerUserHandler from './handlers/user-handler'

socketServer.on('connect', (socket) => {
  // Announce socket on the event bus
  events.emit('socket:connected', socket)
  socket.on('disconnect', () => events.emit('socket:disconnected', socket))

  // Register handlers for socket events
  registerGameHandler(socketServer, socket)
  registerLobbyHandler(socketServer, socket)
  // registerUserHandler(socketServer, socket)
})
