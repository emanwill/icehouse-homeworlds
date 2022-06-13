import { GameState } from '@icehouse-homeworlds/api'
import {
  BlueExploreAction,
  BlueTransitAction,
  CatastropheAction,
  GameplayAction,
  GreenAction,
  HomeworldSystem,
  NormalAction,
  RedAction,
  SacrificeAction,
  StarSystem,
  TokenSize,
  YellowAction,
} from '@icehouse-homeworlds/api/game'

export default function isValidGameplayAction(
  game: GameState,
  action: GameplayAction
): boolean {
  switch (action.type) {
    case 'END_TURN':
      return true
    case 'CATASTROPHE':
      return isValidCatastropheAction(game, action)
    case 'SACRIFICE':
      return isValidSacrificeAction(game, action)
    case 'NORMAL':
      return isValidNormalAction(game, action)
  }
}

function isValidCatastropheAction(
  game: GameState,
  action: CatastropheAction
): boolean {
  // Find the star system involved
  const system = findSystemById(game, action.systemId)
  if (!system) return false

  // Check whether the system is overcrowded in the given color
  let colorCount = 0
  if (system.isHomeworld) {
    colorCount += system.stars.filter((s) => s.color === action.color).length
  } else if (system.star.color === action.color) {
    colorCount++
  }
  colorCount += system.ships.filter((s) => s.color === action.color).length

  return colorCount >= 4
}

function isValidSacrificeAction(
  game: GameState,
  action: SacrificeAction
): boolean {
  // A sacrifice action isn't allowed while still dealing with the effects of another
  if (game.sacrificePlay) return false

  // Find the star system involved
  const system = findSystemById(game, action.systemId)
  if (!system) return false

  // Find the ship to be sacrificed
  const ship = findShipById(game, action.systemId, action.shipId)
  if (!ship) return false

  // Check whether the player owns the ship
  if (ship.playerId !== game.turnOf) return false

  return true
}

function isValidNormalAction(game: GameState, action: NormalAction): boolean {
  // Check whether we're on a sacrifice-granted action
  if (game.sacrificePlay) {
    // If sacrifice wasn't for action's color, then what are we doing here?
    if (game.sacrificePlay.color !== action.color) return false

    // Check whether user has any access to the requested system
    if (!canActInSystem(game, action)) return false
  } else {
    // Check whether use can access actions of this color in the requested system
    if (!canAccessColorInSystem(game, action)) return false
  }

  // Perform color-specific validation checks
  switch (action.color) {
    case 'red':
      return isValidRedAction(game, action)
    case 'yellow':
      return isValidYellowAction(game, action)
    case 'green':
      return isValidGreenAction(game, action)
    case 'blue':
      if (action.isExplore) return isValidBlueExploreAction(game, action)
      else return isValidBlueTransitAction(game, action)
  }
}

function isValidRedAction(game: GameState, action: RedAction): boolean {
  // Find the star system involved
  const system = findSystemById(game, action.systemId)
  if (!system) return false

  // Check whether the intended attacker exists
  const attacker = findShipById(game, action.systemId, action.attackerShipId)
  if (!attacker) return false

  // Check whether the player owns the intended attacker
  if (attacker.playerId !== game.turnOf) return false

  // Check whether the intended victim ship exists
  const victim = findShipById(game, action.systemId, action.victimShipId)
  if (!victim) return false

  // Check whether the attacker outguns the victim
  if (numericSize(victim.size) > numericSize(attacker.size)) return false

  return true
}

function isValidYellowAction(game: GameState, action: YellowAction): boolean {
  // Find the star system involved
  const system = findSystemById(game, action.systemId)
  if (!system) return false

  // Check whether the bank has the required token available
  const tokenCount = game.board.bank[action.newShipColor][action.newShipSize]
  if (tokenCount === 0) return false

  return true
}

function isValidGreenAction(game: GameState, action: GreenAction): boolean {
  // Find the star system involved
  const system = findSystemById(game, action.systemId)
  if (!system) return false

  // Find the trade-in ship involved
  const oldShip = findShipById(game, action.systemId, action.oldShipId)
  if (!oldShip) return false

  // Check whether player owns the trade-in ship
  if (oldShip.playerId !== game.turnOf) return false

  // Check whether the bank has the required token available
  const tokenCount = game.board.bank[action.newShipColor][oldShip.size]
  if (tokenCount === 0) return false

  return true
}

function isValidBlueExploreAction(
  game: GameState,
  action: BlueExploreAction
): boolean {
  // Find the origin star system
  const origin = findSystemById(game, action.systemId)
  if (!origin) return false

  // Find the ship
  const ship = findShipById(game, action.systemId, action.shipId)
  if (!ship) return false

  // Check whether player owns the ship
  if (ship.playerId !== game.turnOf) return false

  // Check whether the bank has the required token available
  const tokenCount = game.board.bank[action.newStarColor][action.newStarSize]
  if (tokenCount === 0) return false

  // Check whether travel between the two systems is possible
  const origStars = origin.isHomeworld ? origin.stars : [origin.star]
  const origStarSizes = origStars.map((s) => s.size)
  if (origStarSizes.includes(action.newStarSize)) return false

  return true
}

function isValidBlueTransitAction(
  game: GameState,
  action: BlueTransitAction
): boolean {
  // Find the origin star system
  const orig = findSystemById(game, action.systemId)
  if (!orig) return false

  // Find the destination star system
  const dest = findSystemById(game, action.transitTo)
  if (!dest) return false

  // Find the ship
  const ship = findShipById(game, action.systemId, action.shipId)
  if (!ship) return false

  // Check whether player owns the ship
  if (ship.playerId !== game.turnOf) return false

  // Check whether travel between the two systems is possible
  const origStars = orig.isHomeworld ? orig.stars : [orig.star]
  const destStars = dest.isHomeworld ? dest.stars : [dest.star]
  const origStarSizes = origStars.map((s) => s.size)
  const destStarSizes = destStars.map((s) => s.size)
  if (origStarSizes.some((s) => destStarSizes.includes(s))) return false

  return true
}

/**
 * Returns `true` if the player owns something in the system _and_ can use it or
 * the system itself to access the requested color action, `false` otherwise.
 * @param game
 * @param action
 * @returns
 */
function canAccessColorInSystem(game: GameState, action: NormalAction) {
  const system = findSystemById(game, action.systemId)

  // Can't act in a system that doesn't exist
  if (!system) return false

  // Get list of colors that can be accessed via player's ships in-system
  const accessibleColors = system.ships
    .filter((s) => s.playerId === game.turnOf)
    .map((s) => s.color)

  // If player owns no ships here, no luck
  if (accessibleColors.length === 0) return false

  // Add system's color(s) to the list
  if (system.isHomeworld) {
    accessibleColors.push(...system.stars.map((s) => s.color))
  } else {
    accessibleColors.push(system.star.color)
  }

  // Check whether requested color is in the list
  return accessibleColors.includes(action.color)
}

/**
 * Returns `true` if the player owns _something_ in the system, `false` otherwise.
 * @param game
 * @param action
 * @returns
 */
function canActInSystem(game: GameState, action: NormalAction) {
  const system = findSystemById(game, action.systemId)

  // Can't act in a system that doesn't exist
  if (!system) return false

  // Check whether player owns a ship here
  return system.ships.some((ship) => ship.playerId === game.turnOf)
}

function findSystemById(game: GameState, id: string) {
  let system: StarSystem | HomeworldSystem | undefined
  if (/^hw/.test(id)) {
    system = game.board.homeworlds.find((s) => s.systemId === id)
  } else {
    system = game.board.systems.find((s) => s.systemId === id)
  }
  return system
}

function findShipById(game: GameState, systemId: string, shipId: string) {
  const system = findSystemById(game, systemId)

  if (!system) return

  return system.ships.find((s) => s.shipId === shipId)
}

function numericSize(size: TokenSize) {
  const sizes: TokenSize[] = ['small', 'medium', 'large']
  return sizes.indexOf(size) + 1
}
