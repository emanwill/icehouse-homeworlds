import {
  GameState,
  GameStateUpdate,
  PlayerDetails,
  SetupAction,
  SetupEffect,
  TokenBank,
  TokenColor,
  TokenSize,
} from '@icehouse-homeworlds/api/game'
import { cloneGame, createId } from '../util'
import {
  applyHwShipSetupAction,
  applyHwStar1SetupAction,
  applyHwStar2SetupAction,
} from './game-setup-actions'

declare type InitGameSetupOptions = {
  firstPlayer: PlayerDetails
  playerSlots: number
}

/**
 * Instantiates a new GameState object
 */
export function createNewGame(options: InitGameSetupOptions): GameState {
  const unitCount = options.playerSlots + 1

  const createSizes = (): { [S in TokenSize]: number } => ({
    small: unitCount,
    medium: unitCount,
    large: unitCount,
  })

  const bank: TokenBank = {
    red: createSizes(),
    yellow: createSizes(),
    green: createSizes(),
    blue: createSizes(),
  }

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
  game = cloneGame(game)

  game.players.push(newPlayer)

  return game
}

export function removePlayer(game: GameState, playerId: string) {
  game = cloneGame(game)

  const idx = game.players.findIndex((p) => p.playerId === playerId)

  if (idx < 0) return game

  game.players.splice(idx, 1)

  return game
}

export function applySetupActions(
  game: GameState,
  setupActions: SetupAction[]
): GameStateUpdate {
  const oldGameState = game

  type SetupAccumulator = {
    game: GameState
    effects: SetupEffect[]
  }

  const setupActionReducer = (acc: SetupAccumulator, action: SetupAction) => {
    const [effect, newState] = applySetupAction(acc.game, action)
    acc.effects.push(effect)
    acc.game = newState
    return acc
  }

  const acc = setupActions.reduce(setupActionReducer, { game, effects: [] })

  const update: GameStateUpdate = {
    ...acc.game,
    previousBoard: oldGameState.board,
    previousTurnEffects: acc.effects,
    previousTurnOf: oldGameState.turnOf,
    version: oldGameState.version + 1,
  }

  return update
}

export function isValidSetupAction(
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

export function applySetupAction(
  game: GameState,
  action: SetupAction
): [SetupEffect, GameState] {
  game = cloneGame(game)

  let result: [SetupEffect, GameState] | [] = []
  switch (action.type) {
    case 'HOMEWORLD_STAR1_SETUP':
      result = applyHwStar1SetupAction(game, action)
      break
    case 'HOMEWORLD_STAR2_SETUP':
      result = applyHwStar2SetupAction(game, action)
      break
    case 'HOMEWORLD_SHIP_SETUP':
      result = applyHwShipSetupAction(game, action)
      break
  }

  return result
}

function bankHasPiece(
  game: GameState,
  color: TokenColor,
  size: TokenSize
): boolean {
  return game.board.bank[color][size] > 0
}
