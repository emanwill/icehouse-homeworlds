import { AbstractSystem, GameState } from '@icehouse-homeworlds/api/game'
import { randomBytes } from 'crypto'
import { networkInterfaces } from 'os'
import rfdc from 'rfdc'
import { createLogger, format, transports } from 'winston'

const ID_LEN = 6

export const log = createLogger({
  level: 'info',
  format: format.simple(),
  transports: [
    new transports.Console({ level: 'info' }),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'service.log' }),
  ],
})

export const getNetworkAddresses = (): string[] =>
  Object.values(networkInterfaces())
    .flatMap((a) => a)
    .filter((iface) => iface?.family === 'IPv4')
    .map((iface) => iface?.address ?? '')

export const createId = (prefix: string, bytes: number) =>
  prefix + randomBytes(bytes).toString('hex')

export const GameObjectIds = {
  game: () => createId('gm:', ID_LEN),
  homeworldSystem: () => createId('hw:', ID_LEN),
  player: () => createId('pl:', ID_LEN),
  ship: () => createId('sp:', ID_LEN),
  star: () => createId('st:', ID_LEN),
  starSystem: () => createId('sy:', ID_LEN),
}

export const awaitTimeout = (delay = 0) =>
  new Promise<void>((resolve) => setTimeout(resolve, delay))

const cloneWithProtoNoCircle = rfdc({ proto: true, circles: false })

export const cloneGame = (game: GameState): GameState =>
  cloneWithProtoNoCircle(game)
