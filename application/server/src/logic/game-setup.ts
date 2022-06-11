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
  // TODO
  return false
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
