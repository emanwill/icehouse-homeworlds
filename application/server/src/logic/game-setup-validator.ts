import {
  GameState,
  HomeworldShipSetupAction,
  HomeworldStar1SetupAction,
  HomeworldStar2SetupAction,
  SetupAction,
  TokenColor,
  TokenSize,
} from '@icehouse-homeworlds/api/game'
import { log } from '../util'

export default function isValidSetupAction(
  game: GameState,
  action: SetupAction
): boolean {
  switch (action.type) {
    case 'HOMEWORLD_STAR1_SETUP':
      return isValidSetup1Action(game, action)
    case 'HOMEWORLD_STAR2_SETUP':
      return isValidSetup2Action(game, action)
    case 'HOMEWORLD_SHIP_SETUP':
      return isValidSetup3Action(game, action)
  }
}

function isValidSetup1Action(
  game: GameState,
  { type, newStarColor, newStarSize }: HomeworldStar1SetupAction
): boolean {
  log.debug(`Validation: ${game.gameId} for action ${type}`)

  if (game.status !== 'SETUP1') {
    log.debug(
      `Validation error: ${game.gameId} status ${game.status} is not "SETUP1`
    )
    return false
  }

  if (!bankHasPiece(game, newStarColor, newStarSize)) {
    log.debug(
      `Validation error: ${game.gameId} bank lacks ${newStarSize} ${newStarColor}`
    )
    return false
  }

  const hw = game.board.homeworlds.find((hw) => hw.playerId === game.turnOf)

  if (hw && hw.stars.length !== 0) {
    log.debug(
      `Validation error: ${game.gameId} player ${game.turnOf} HW system already exists`
    )
    return false
  }

  log.debug(`Validation: ${game.gameId} for action ${type}: passed`)
  return true
}

function isValidSetup2Action(
  game: GameState,
  action: HomeworldStar2SetupAction
): boolean {
  if (game.status !== 'SETUP2') {
    log.debug(`Validation: ${game.gameId} status ${game.status} is not "SETUP2`)
    return false
  }

  if (!bankHasPiece(game, action.newStarColor, action.newStarSize)) {
    return false
  }

  const hw = game.board.homeworlds.find((hw) => hw.playerId === game.turnOf)

  if (!hw || hw.stars.length !== 1) {
    return false
  }

  return true
}

function isValidSetup3Action(
  game: GameState,
  action: HomeworldShipSetupAction
): boolean {
  if (game.status !== 'SETUP3') {
    log.debug(`Validation: ${game.gameId} status ${game.status} is not "SETUP3`)
    return false
  }

  if (!bankHasPiece(game, action.newShipColor, action.newShipSize)) {
    return false
  }

  const hw = game.board.homeworlds.find((hw) => hw.playerId === game.turnOf)

  if (!hw || hw.ships.length !== 0) {
    return false
  }

  return true
}

function bankHasPiece(game: GameState, color: TokenColor, size: TokenSize) {
  return game.board.bank[color][size] > 0
}
