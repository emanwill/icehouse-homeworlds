import { TokenColor, TokenSize } from '@icehouse-homeworlds/api'
import {
  GameState,
  PlayerDetails,
  TokenBank,
} from '@icehouse-homeworlds/api/game'
import { cloneJson, createId } from '../util'

const colorsTuple = <T extends TokenColor[]>(...args: T) => args
const allColors = colorsTuple('blue', 'green', 'red', 'yellow')

const sizesTuple = <T extends TokenSize[]>(...args: T) => args
const allSizes = sizesTuple('small', 'medium', 'large')

const gamesMap = new Map<string, GameState>()

function createBank(unitCount: number): TokenBank {
  const createSizes = (): { [T in TokenSize]: number } =>
    Object.assign({}, ...allSizes.map((s) => ({ [s]: unitCount })))

  const bank: TokenBank = Object.assign(
    {},
    ...allColors.map((c) => ({ [c]: createSizes() }))
  )

  return bank
}

declare type InitGameSetupOptions = {
  firstPlayer: PlayerDetails
  playerSlots: number
}

/**
 * Creates a new Game instance and puts it in a 'AWAIT_PLAYERS' state
 * @param options
 */
export async function createGame(options: InitGameSetupOptions) {
  const unitCount = options.playerSlots + 1

  const newGame: GameState = {
    gameId: createId('gam', 6),
    version: 0,
    playerSlots: options.playerSlots,
    players: [options.firstPlayer],
    status: 'AWAIT_PLAYERS',
    board: {
      bank: createBank(unitCount),
      homeworlds: [],
      systems: [],
    },
    turnOf: options.firstPlayer.playerId,
  }

  gamesMap.set(newGame.gameId, newGame)

  return cloneJson(newGame)
}

export async function getGameById(gameId: string) {
  const g = gamesMap.get(gameId)
  return g ? cloneJson(g) : undefined
}

export async function addPlayerToWaitingGame(
  gameId: string,
  player: PlayerDetails
) {
  const game = await getGameById(gameId)

  if (!game) throw Error('FOO!')

  if (game.players.length >= game.playerSlots) throw Error('BAR!')

  game.players.push(player)
  game.version++
}

export async function removePlayerFromWaitingGame(
  gameId: string,
  playerId: string
) {
  const game = await getGameById(gameId)

  if (!game) return

  const playerIdx = game.players.findIndex((p) => p.playerId === playerId)

  if (playerIdx < 0) return

  game.players.splice(playerIdx, 1)
  game.version++

  if (game.players.length === 0) {
    gamesMap.delete(gameId)
  }
}
