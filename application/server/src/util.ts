import { GameState } from '@icehouse-homeworlds/api/game'
import { randomBytes } from 'crypto'
import { networkInterfaces } from 'os'
import rfdc from 'rfdc'

const ID_LEN = 6

export const getNetworkAddresses = (): string[] =>
  Object.values(networkInterfaces())
    .flatMap((a) => a)
    .filter((iface) => iface?.family === 'IPv4')
    .map((iface) => iface?.address)
    .filter((addr) => !!addr)

export const createId = (prefix: string, bytes: number) =>
  prefix + randomBytes(bytes).toString('hex')

export const GameObjectIds = {
  homeworldSystem: () => createId('hws', ID_LEN),
  player: () => createId('plr', ID_LEN),
  ship: () => createId('shp', ID_LEN),
  star: () => createId('str', ID_LEN),
  starSystem: () => createId('sts', ID_LEN),
}

export const awaitTimeout = (delay = 0) =>
  new Promise<void>((resolve) => setTimeout(resolve, delay))

const cloneWithProtoNoCircle = rfdc({ proto: true, circles: false })

export const cloneGame = (game: GameState): GameState =>
  cloneWithProtoNoCircle(game)

export const getNextTurnPlayerId = (game: GameState, reverseOrder = false) => {
  let idx = game.players.findIndex((p) => p.playerId === game.turnOf)

  if (idx < 0) return

  if (reverseOrder) {
    idx--
    if (idx < 0) idx += game.players.length
  } else {
    idx++
    if (idx >= game.players.length) idx -= game.players.length
  }

  return game.players[idx].playerId
}
