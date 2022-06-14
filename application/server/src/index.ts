import { socketServer } from './express-io-server'
// import registerUserHandler from './handlers/user-handler'
import registerLobbyHandler from './handlers/lobby-handler'

socketServer.on('connect', (socket) => {
  // Register socket
  // registerUserHandler(socketServer, socket)
  registerLobbyHandler(socketServer, socket)
})
