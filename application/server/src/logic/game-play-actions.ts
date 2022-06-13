import {
  BlueExploreAction,
  BlueExploreEffect,
  BlueTransitAction,
  BlueTransitEffect,
  CatastropheAction,
  CatastropheEffect,
  EndTurnAction,
  EndTurnEffect,
  GameplayAction,
  GameplayEffect,
  GameState,
  GreenAction,
  GreenEffect,
  HomeworldSystem,
  NormalAction,
  NormalEffect,
  RedAction,
  RedEffect,
  SacrificeAction,
  SacrificeEffect,
  Ship,
  Star,
  StarSystem,
  TokenSize,
  YellowAction,
  YellowEffect,
} from '@icehouse-homeworlds/api/game'
import { cloneGame, GameObjectIds } from '../util'

export function applyPlayerAction(
  game: GameState,
  action: GameplayAction
): [GameplayEffect, GameState] {
  game = cloneGame(game)

  switch (action.type) {
    case 'CATASTROPHE':
      return applyCatastropheAction(game, action)
    case 'SACRIFICE':
      return applySacrificeAction(game, action)
    case 'NORMAL':
      return applyNormalAction(game, action)
    case 'END_TURN':
      return applyEndTurnAction(game, action)
  }
}

export function applyEndTurnAction(
  game: GameState,
  action: EndTurnAction
): [EndTurnEffect, GameState] {
  // Discard any remaining sacrifice-granted actions
  delete game.sacrificePlay

  // TODO: transition to next player's turn
  const startAt = game.players.findIndex((p) => p.playerId === game.turnOf)

  if (startAt < 0) throw Error('What the Casper? Player turn matches no player')

  let idx = startAt + 1

  // Determine next available player in rotation
  while (game.players[idx].status !== 'PLAYING') {
    idx++
    if (idx >= game.players.length) idx -= game.players.length

    if (idx === startAt) throw Error('No other available players')
  }

  game.turnOf = game.players[idx].playerId

  return [action, game]
}

export function applyNormalAction(
  game: GameState,
  action: NormalAction
): [NormalEffect, GameState] {
  // TODO

  switch (action.color) {
    case 'red':
      return applyRedAction(game, action)
    case 'yellow':
      return applyYellowAction(game, action)
    case 'green':
      return applyGreenAction(game, action)
    case 'blue':
      if (action.isExplore) return applyBlueExploreAction(game, action)
      else return applyBlueTransitAction(game, action)
  }
}

export function applyCatastropheAction(
  game: GameState,
  action: CatastropheAction
): [CatastropheEffect, GameState] {
  // TODO
  const system = findSystemById(game, action.systemId)

  let systemDestroyed = false
  const starsLost: string[] = []
  const shipsLost: string[] = []

  // First, destroy any directly affected ships

  // Different conditions depending on whether is homeworld system
  if (system.isHomeworld) {
  } else if (system.star.color === action.color) {
  }

  const effect: CatastropheEffect = {
    ...action,
    systemDestroyed,
    starsLost,
    shipsLost,
  }

  return [effect, game]
}

export function applySacrificeAction(
  game: GameState,
  action: SacrificeAction
): [SacrificeEffect, GameState] {
  const system = findSystemById(game, action.systemId)

  const shipIdx = system.ships.findIndex((s) => s.shipId === action.shipId)

  if (shipIdx < 0) throw Error('How did we get here?! Ship does not exist!')

  const ship = system!.ships[shipIdx]

  // Remove ship from board and return its token to the bank
  system!.ships.splice(shipIdx, 1)
  game.board.bank[ship.color][ship.size]++

  // Grant the player a corresponding number of normal actions
  game.sacrificePlay = {
    actionsRemaining: numericSize(ship.size),
    color: ship.color,
  }

  const effect: SacrificeEffect = {
    ...action,
  }

  return [effect, game]
}

export function applyRedAction(
  game: GameState,
  action: RedAction
): [RedEffect, GameState] {
  const system = findSystemById(game, action.systemId)

  const victim = system.ships.find((s) => s.shipId === action.victimShipId)
  if (!victim) throw Error('How did we get here?! Ship does not exist!')

  victim.playerId = game.turnOf

  const effect: RedEffect = {
    ...action,
  }

  return [effect, game]
}

export function applyYellowAction(
  game: GameState,
  action: YellowAction
): [YellowEffect, GameState] {
  const system = findSystemById(game, action.systemId)

  const ship: Ship = {
    shipId: GameObjectIds.ship(),
    playerId: game.turnOf,
    color: action.newShipColor,
    size: action.newShipSize,
  }

  // Add new ship to the board, deduct its token from bank
  system.ships.push(ship)
  game.board.bank[ship.color][ship.size]--

  const effect: YellowEffect = {
    ...action,
    newShipId: ship.shipId,
  }

  return [effect, game]
}

export function applyGreenAction(
  game: GameState,
  action: GreenAction
): [GreenEffect, GameState] {
  const system = findSystemById(game, action.systemId)

  const oldShip = system.ships.find((s) => s.shipId === action.oldShipId)

  if (!oldShip) throw Error('How did we get here?! Ship does not exist!')

  const newShip: Ship = {
    ...oldShip,
    shipId: GameObjectIds.ship(),
    color: action.newShipColor,
  }

  const shipIdx = system.ships.indexOf(oldShip)
  system.ships[shipIdx] = newShip

  game.board.bank[oldShip.color][oldShip.size]++
  game.board.bank[newShip.color][newShip.size]--

  const effect: GreenEffect = {
    ...action,
    newShipId: newShip.shipId,
  }

  return [effect, game]
}

export function applyBlueExploreAction(
  game: GameState,
  action: BlueExploreAction
): [BlueExploreEffect, GameState] {
  const originSystem = findSystemById(game, action.systemId)
  const ship = originSystem.ships.find((s) => s.shipId === action.shipId)

  if (!ship) throw Error('How did we get here?! Ship does not exist!')

  // Remove ship from origin system
  const idxInOriginSystem = originSystem.ships.indexOf(ship)
  originSystem.ships.splice(idxInOriginSystem, 1)

  // Create new star for new system
  const newStar: Star = {
    starId: GameObjectIds.star(),
    color: action.newStarColor,
    size: action.newStarSize,
  }

  // Deduct new star's token from the bank
  game.board.bank[newStar.color][newStar.size]--

  // Create new star system and add star and ship to it
  const newSystem: StarSystem = {
    systemId: GameObjectIds.starSystem(),
    isHomeworld: false,
    star: newStar,
    ships: [ship],
  }

  // Tidy up origin system
  if (originSystem.ships.length === 0) {
    removeSystemById(game, originSystem.systemId)
  }

  // Document effects of action
  const effect: BlueExploreEffect = {
    ...action,
    newStarId: newStar.starId,
    newSystemId: newSystem.systemId,
  }

  return [effect, game]
}

export function applyBlueTransitAction(
  game: GameState,
  action: BlueTransitAction
): [BlueTransitEffect, GameState] {
  const originSystem = findSystemById(game, action.systemId)
  const destinationSystem = findSystemById(game, action.transitTo)

  const ship = originSystem.ships.find((s) => s.shipId === action.shipId)

  if (!ship) throw Error('How did we get here?! Ship does not exist!')

  // Remove ship from origin system
  const idxInOriginSystem = originSystem.ships.indexOf(ship)
  originSystem.ships.splice(idxInOriginSystem, 1)

  // Add ship to destination system
  destinationSystem.ships.push(ship)

  // Tidy up origin system
  if (originSystem.ships.length === 0) {
    removeSystemById(game, originSystem.systemId)
  }

  // Document effects of action
  const effect: BlueTransitEffect = {
    ...action,
  }

  return [action, game]
}

function findSystemById(
  game: GameState,
  systemId: string
): StarSystem | HomeworldSystem {
  let system: StarSystem | HomeworldSystem | undefined
  if (/^hw/.test(systemId)) {
    system = game.board.homeworlds.find((s) => s.systemId === systemId)
  } else {
    system = game.board.systems.find((s) => s.systemId === systemId)
  }

  if (!system) throw Error('How did we get here? The system cannot be found!')

  return system
}

function numericSize(size: TokenSize) {
  const sizes: TokenSize[] = ['small', 'medium', 'large']
  return sizes.indexOf(size) + 1
}

function removeSystemById(game: GameState, systemId: string) {
  const system = findSystemById(game, systemId)

  const starIds: string[] = []
  const shipIds: string[] = []

  // Return any ships' tokens to the bank
  system.ships
    .map((s) => removeShipById(game, systemId, s.shipId))
    .forEach((s) => (s ? shipIds.push(s.shipId) : null))

  if (system.isHomeworld) {
    system.stars.forEach(({ starId, color, size }) => {
      game.board.bank[color][size]++
      starIds.push(starId)
    })

    const sysIdx = game.board.homeworlds.indexOf(system)
    game.board.homeworlds.splice(sysIdx, 1)
  } else {
    const { starId, color, size } = system.star

    game.board.bank[color][size]++
    starIds.push(starId)

    const sysIdx = game.board.systems.indexOf(system)
    game.board.systems.splice(sysIdx, 1)
  }

  return {
    systemId: system.systemId,
    starIds,
    shipIds,
  }
}

/**
 *
 * @param game
 * @param systemId
 * @param shipId
 * @returns Ship that was found and removed
 */
function removeShipById(game: GameState, systemId: string, shipId: string) {
  const system = findSystemById(game, systemId)

  const shipIdx = system.ships.findIndex((s) => s.shipId === shipId)

  if (shipIdx > -1) {
    const ship = system.ships.splice(shipIdx, 1)[0]
    game.board.bank[ship.color][ship.size]++
    return { shipId: ship.shipId }
  }
}
