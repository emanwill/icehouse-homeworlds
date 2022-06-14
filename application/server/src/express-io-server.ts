import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@icehouse-homeworlds/api'
import express from 'express'
import http from 'http'
import { Server as IOServer, Socket as IOSocket } from 'socket.io'
import { getNetworkAddresses } from './util'

const PORT = 7000

export const expressApp = express()

expressApp.use(express.static('../client/dist'))

export const httpServer = http.createServer(expressApp)

httpServer.listen(PORT, () => {
  console.log(`Listening at:\nhttp://localhost:${PORT}`)
  getNetworkAddresses().forEach((addr) => console.log(`http://${addr}:${PORT}`))
})

export type IceworldsIOServer = IOServer<
  ClientToServerEvents,
  ServerToClientEvents
>

export type IceworldsIOSocket = IOSocket<
  ClientToServerEvents,
  ServerToClientEvents
>

export const socketServer = new IOServer<
  ClientToServerEvents,
  ServerToClientEvents
>(httpServer)
