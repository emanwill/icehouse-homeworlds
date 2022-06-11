import { GameState } from '@icehouse-homeworlds/api/game'

const games = new Map<string, GameState>()

const asyncDelay = async (delay = 0): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, delay))

export async function addGame(game: GameState): Promise<void> {
  await asyncDelay()

  games.set(game.gameId, game)
}

export async function findGameById(
  gameId: string
): Promise<GameState | undefined> {
  await asyncDelay()

  return games.get(gameId)
}
