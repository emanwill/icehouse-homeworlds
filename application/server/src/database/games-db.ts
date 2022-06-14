import { GameState } from '@icehouse-homeworlds/api/game'
import { asyncTimeout } from '../util'

const games = new Map<string, GameState>()

const gameIdsByPlayerIds = new Map<string, string>()

export async function addGame(game: GameState): Promise<void> {
  await asyncTimeout()

  games.set(game.gameId, game)
  updatePlayerIdsMap(game)
}

export async function findGameById(
  gameId: string
): Promise<GameState | undefined> {
  await asyncTimeout()

  return games.get(gameId)
}

export async function findGameByPlayerId(playerId: string) {
  await asyncTimeout()

  const gameId = gameIdsByPlayerIds.get(playerId)

  return gameId ? findGameById(gameId) : undefined
}

export async function updateGameById(gameId: string, game: GameState) {
  await asyncTimeout()

  games.set(gameId, game)
  updatePlayerIdsMap(game)
}

function updatePlayerIdsMap({ gameId, players }: GameState) {
  players.forEach(({ playerId }) => gameIdsByPlayerIds.set(playerId, gameId))
}

function removePlayersOfGame({ players }: GameState) {
  players.forEach(({ playerId }) => gameIdsByPlayerIds.delete(playerId))
}
