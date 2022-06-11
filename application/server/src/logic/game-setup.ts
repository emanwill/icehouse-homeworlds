import {
  GameState,
  PlayerDetails,
  SetupAction,
  TokenBank,
  TokenColor,
  TokenSize,
} from '@icehouse-homeworlds/api/game'
import { cloneJson, createId } from '../util'

const colorsTuple = <T extends TokenColor[]>(...args: T) => args
const allColors = colorsTuple('red', 'yellow', 'green', 'blue')

const sizesTuple = <T extends TokenSize[]>(...args: T) => args
const allSizes = sizesTuple('small', 'medium', 'large')

declare type InitGameSetupOptions = {
  firstPlayer: PlayerDetails
  playerSlots: number
}

/**
 * Instantiates a new GameState object
 */
export function createNewGame(options: InitGameSetupOptions): GameState {
  const unitCount = options.playerSlots + 1

  const createSizes = (): { [T in TokenSize]: number } =>
    Object.assign({}, ...allSizes.map((s) => ({ [s]: unitCount })))

  const bank: TokenBank = Object.assign(
    {},
    ...allColors.map((c) => ({ [c]: createSizes() }))
  )

  const newGame: GameState = {
    gameId: createId('gam', 6),
    version: 0,
    playerSlots: options.playerSlots,
    players: [options.firstPlayer],
    status: 'AWAIT_PLAYERS',
    board: {
      bank,
      homeworlds: [],
      systems: [],
    },
    turnOf: options.firstPlayer.playerId,
  }

  return newGame
}

export function canAddPlayer(game: GameState) {
  return game.players.length < game.playerSlots
}

export function addPlayer(game: GameState, newPlayer: PlayerDetails) {
  game = cloneJson(game)

  game.players.push(newPlayer)

  return game
}

export function removePlayer(game: GameState, playerId: string) {
  game = cloneJson(game)

  const idx = game.players.findIndex((p) => p.playerId === playerId)

  if (idx < 0) return game

  game.players.splice(idx, 1)

  return game
}

export function applySetupActions(
  game: GameState,
  playerId: string,
  setupActions: SetupAction[]
) {
  game = cloneJson(game)

  if (game.turnOf !== playerId) throw Error('ASDF!')

  const applyAction = (g: GameState, a: SetupAction) =>
    applySetupAction(g, playerId, a)

  return setupActions.reduce(applyAction, game)
}

function isValidSetupAction(
  game: GameState,
  playerId: string,
  action: SetupAction
): boolean {
  // Check whether requester can even act here
  if (game.turnOf !== playerId) return false

  const stage = game.status

  switch (action.type) {
    case 'HOMEWORLD_STAR1_SETUP':
      if (stage !== 'SETUP1') return false
      if (!bankHasPiece(game, action.newStarColor, action.newStarSize))
        return false
      break
    case 'HOMEWORLD_STAR2_SETUP':
      if (stage !== 'SETUP2') return false
      if (!bankHasPiece(game, action.newStarColor, action.newStarSize))
        return false
      break
    case 'HOMEWORLD_SHIP_SETUP':
      if (stage !== 'SETUP3') return false
      if (!bankHasPiece(game, action.newShipColor, action.newShipSize))
        return false
      break
  }

  return true
}

function applySetupAction(
  game: GameState,
  playerId: string,
  action: SetupAction
): GameState {
  // Assumes the action is valid

  // Perform requested action
  switch (action.type) {
    case 'HOMEWORLD_STAR1_SETUP':
      break
    case 'HOMEWORLD_STAR2_SETUP':
      break
    case 'HOMEWORLD_SHIP_SETUP':
      break
  }

  return game
}

function bankHasPiece(
  game: GameState,
  color: TokenColor,
  size: TokenSize
): boolean {
  return game.board.bank[color][size] > 0
}

function removeBankPiece(game: GameState, color: TokenColor, size: TokenSize) {
  game.board.bank[color][size]--
}

function restoreBankPiece(game: GameState, color: TokenColor, size: TokenSize) {
  game.board.bank[color][size]++
}
