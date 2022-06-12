import {
  GameState,
  HomeworldShipSetupAction,
  HomeworldShipSetupEffect,
  HomeworldStar1SetupAction,
  HomeworldStar1SetupEffect,
  HomeworldStar2SetupAction,
  HomeworldStar2SetupEffect,
  HomeworldSystem,
  Ship,
  Star,
} from '@icehouse-homeworlds/api/game'
import { cloneGame, GameObjectIds, getNextTurnPlayerId } from '../util'

export function applyHwStar1SetupAction(
  game: GameState,
  action: HomeworldStar1SetupAction
): [HomeworldStar1SetupEffect, GameState] {
  game = cloneGame(game)

  // Create the new star
  const star: Star = {
    starId: GameObjectIds.star(),
    color: action.newStarColor,
    size: action.newStarSize,
  }

  // Remove its token from the bank
  game.board.bank[action.newStarColor][action.newStarSize]--

  // Create the new homeworld system
  const hwSystem: HomeworldSystem = {
    systemId: GameObjectIds.homeworldSystem(),
    playerId: game.turnOf,
    stars: [star],
    ships: [],
  }

  // Apply the new homeworld system to the game board
  game.board.homeworlds.push(hwSystem)

  // Document the effect of the action
  const effect: HomeworldStar1SetupEffect = {
    ...action,
    newStarId: star.starId,
    newHomeSystemId: hwSystem.systemId,
  }

  // Determine the next player's turn
  const haveAllFinishedSetup1 =
    game.board.homeworlds.length === game.players.length &&
    game.board.homeworlds.every((hw) => hw.stars.length > 0)

  if (haveAllFinishedSetup1) {
    // Last player to finish Setup 1 starts Setup 2
    // NO ACTION
  } else {
    // Proceed in normal turn order
    game.turnOf = getNextTurnPlayerId(game)
  }

  return [effect, game]
}

export function applyHwStar2SetupAction(
  game: GameState,
  action: HomeworldStar2SetupAction
): [HomeworldStar2SetupEffect, GameState] {
  game = cloneGame(game)

  // Create new star
  const star: Star = {
    starId: GameObjectIds.star(),
    color: action.newStarColor,
    size: action.newStarSize,
  }

  // Remove its token from the bank
  game.board.bank[action.newStarColor][action.newStarSize]--

  // Apply the new star to the player's homeworld system
  const hwSystem = game.board.homeworlds.find(
    (hw) => hw.playerId === game.turnOf
  )
  hwSystem.stars.push(star)

  // Document the effect of the action\
  const effect: HomeworldStar2SetupEffect = {
    ...action,
    homeSystemId: hwSystem.systemId,
    newStarId: star.starId,
  }

  // Determine the next player's turn
  const haveAllFinishedSetup2 = game.board.homeworlds.every(
    (hw) => hw.stars.length > 1
  )

  if (haveAllFinishedSetup2) {
    // Last player to finish Setup 2 starts Setup 3
    // Switch to next game status
    game.status = 'SETUP2'
  } else {
    // Proceed in reverse turn order
    game.turnOf = getNextTurnPlayerId(game, true)
  }

  return [effect, game]
}

export function applyHwShipSetupAction(
  game: GameState,
  action: HomeworldShipSetupAction
): [HomeworldShipSetupEffect, GameState] {
  game = cloneGame(game)

  // Create new ship
  const ship: Ship = {
    shipId: GameObjectIds.ship(),
    playerId: game.turnOf,
    color: action.newShipColor,
    size: action.newShipSize,
  }

  // Remove its token from the bank
  game.board.bank[action.newShipColor][action.newShipSize]--

  // Attach the new ship to the player's Homeworld system
  const hwSystem = game.board.homeworlds.find(
    (hw) => hw.playerId === game.turnOf
  )
  hwSystem.ships.push(ship)

  // Document the effect of the action
  const effect: HomeworldShipSetupEffect = {
    ...action,
    homeSystemId: hwSystem.systemId,
    newShipId: ship.shipId,
  }

  const haveAllFinishedSetup3 = game.board.homeworlds.every(
    (hw) => hw.ships.length > 0
  )

  if (haveAllFinishedSetup3) {
    // Setup has completed; ready to begin gameplay
    game.status = 'PLAY'
  }

  // Turn order is normal both in Setup 3 and afterward
  game.turnOf = getNextTurnPlayerId(game)

  return [effect, game]
}
