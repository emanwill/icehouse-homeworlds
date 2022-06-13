import {
  GameState,
  HomeworldShipSetupAction,
  HomeworldStar1SetupAction,
  HomeworldStar2SetupAction,
  PlayerSetupPayload,
  TokenColor,
  TokenSize,
} from '@icehouse-homeworlds/api/game'

export default function isValidSetupRequest(
  game: GameState,
  requesterPlayerId: string,
  request: PlayerSetupPayload
): boolean {
  // Check whether request is for this game
  if (game.gameId !== request.gameId) return false

  // Check whether request is for this game state version
  if (game.version !== request.version) return false

  // Check whether requester is in this game
  if (!game.players.some((p) => p.playerId === requesterPlayerId)) return false

  // Check whether it's requester's turn
  if (game.turnOf !== requesterPlayerId) return false

  // Check requested action's validity
  switch (request.action.type) {
    case 'HOMEWORLD_STAR1_SETUP':
      return isValidSetup1Action(game, request.action)
    case 'HOMEWORLD_STAR2_SETUP':
      return isValidSetup2Action(game, request.action)
    case 'HOMEWORLD_SHIP_SETUP':
      return isValidSetup3Action(game, request.action)
  }
}

function isValidSetup1Action(
  game: GameState,
  action: HomeworldStar1SetupAction
): boolean {
  if (game.status !== 'SETUP1') return false

  if (!bankHasPiece(game, action.newStarColor, action.newStarSize)) return false

  const hw = game.board.homeworlds.find((hw) => hw.playerId === game.turnOf)

  if (hw && hw.stars.length !== 0) return false

  return true
}

function isValidSetup2Action(
  game: GameState,
  action: HomeworldStar2SetupAction
): boolean {
  if (game.status !== 'SETUP2') return false

  if (!bankHasPiece(game, action.newStarColor, action.newStarSize)) return false

  const hw = game.board.homeworlds.find((hw) => hw.playerId === game.turnOf)

  if (!hw || hw.stars.length !== 1) return false

  return true
}

function isValidSetup3Action(
  game: GameState,
  action: HomeworldShipSetupAction
): boolean {
  if (game.status !== 'SETUP3') return false

  if (!bankHasPiece(game, action.newShipColor, action.newShipSize)) return false

  const hw = game.board.homeworlds.find((hw) => hw.playerId === game.turnOf)

  if (!hw || hw.ships.length !== 0) return false

  return true
}

function bankHasPiece(game: GameState, color: TokenColor, size: TokenSize) {
  return game.board.bank[color][size] > 0
}
