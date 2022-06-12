import {
  GameState,
  HomeworldStar1SetupAction,
  PlayerSetupRequest,
  SetupAction,
  TokenColor,
  TokenSize,
} from '@icehouse-homeworlds/api/game'

export function isPlayerInGame(game: GameState, playerId: string) {
  return game.players.some((p) => p.playerId === playerId)
}

export function isPlayersTurn(game: GameState, playerId: string): boolean {
  return game.turnOf === playerId
}

export function isValidRequestVersion(
  game: GameState,
  request: PlayerSetupRequest
): boolean {
  return request.version === game.version
}

export function isValidSetupRequest(
  game: GameState,
  requesterPlayerId: string,
  request: PlayerSetupRequest
): boolean {
  if (!isValidRequestVersion(game, request)) return false

  if (!isPlayerInGame(game, requesterPlayerId)) return false

  if (!isPlayersTurn(game, requesterPlayerId)) return false
}

export function isValidSetupAction(
  game: GameState,
  action: SetupAction
): boolean {
  switch (action.type) {
    case 'HOMEWORLD_STAR1_SETUP':
  }
}

export function isValidSetup1Action(
  game: GameState,
  action: HomeworldStar1SetupAction
): boolean {
  if (game.status !== 'SETUP1') return false

  if (!bankHasPiece(game, action.newStarColor, action.newStarSize)) return false

  return true
}

function bankHasPiece(game: GameState, color: TokenColor, size: TokenSize) {
  return game.board.bank[color][size] > 0
}
