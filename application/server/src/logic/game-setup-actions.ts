import {
  GameState,
  HomeworldShipSetupAction,
  HomeworldShipSetupEffect,
  HomeworldStar1SetupAction,
  HomeworldStar1SetupEffect,
  HomeworldStar2SetupAction,
  HomeworldStar2SetupEffect,
  HomeworldSystem,
  SetupAction,
  SetupEffect,
  Ship,
  Star,
} from '@icehouse-homeworlds/api/game'
import { cloneGame, GameObjectIds } from '../util'

const getNextTurnPlayerId = (game: GameState, reverseOrder = false) => {
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

export function applySetupAction(
  game: GameState,
  action: SetupAction
): [SetupEffect, GameState] {
  game = cloneGame(game)

  switch (action.type) {
    case 'HOMEWORLD_STAR1_SETUP':
      return applyHwStar1SetupAction(game, action)
    case 'HOMEWORLD_STAR2_SETUP':
      return applyHwStar2SetupAction(game, action)
    case 'HOMEWORLD_SHIP_SETUP':
      return applyHwShipSetupAction(game, action)
  }
}

export function applyHwStar1SetupAction(
  game: GameState,
  action: HomeworldStar1SetupAction
): [HomeworldStar1SetupEffect, GameState] {
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
    isHomeworld: true,
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
    game.turnOf = getNextTurnPlayerId(game) ?? ''
  }

  return [effect, game]
}

export function applyHwStar2SetupAction(
  game: GameState,
  action: HomeworldStar2SetupAction
): [HomeworldStar2SetupEffect, GameState] {
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
  hwSystem?.stars.push(star)

  // Document the effect of the action\
  const effect: HomeworldStar2SetupEffect = {
    ...action,
    homeSystemId: hwSystem?.systemId ?? '',
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
    game.turnOf = getNextTurnPlayerId(game, true) ?? ''
  }

  return [effect, game]
}

export function applyHwShipSetupAction(
  game: GameState,
  action: HomeworldShipSetupAction
): [HomeworldShipSetupEffect, GameState] {
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
  hwSystem?.ships.push(ship)

  // Document the effect of the action
  const effect: HomeworldShipSetupEffect = {
    ...action,
    homeSystemId: hwSystem?.systemId ?? '',
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
  game.turnOf = getNextTurnPlayerId(game) ?? ''

  return [effect, game]
}
