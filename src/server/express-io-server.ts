import express from 'express'
import http from 'http'
import { Server as IOServer } from 'socket.io'
import { getNetworkAddresses } from './util'

const PORT = 7000

export const expressApp = express()

expressApp.use(express.static('dist'))

export const httpServer = http.createServer(expressApp)

httpServer.listen(PORT, () => {
  console.log(`Listening at:\nhttp://localhost:${PORT}`)
  getNetworkAddresses().forEach((addr) => console.log(`http://${addr}:${PORT}`))
})

export const socketServer = new IOServer(httpServer)
