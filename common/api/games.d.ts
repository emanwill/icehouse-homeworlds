type GameSummary = {
  gameId: string
  createdById: string
  createdByName: string
  playerSlots: number
  playerSlotsFilled: number
}

type CreateGameOptions = {
  playerSlots: number
}

export type ServerToClientGamesEvents = {
  'games:list': (games: GameSummary[]) => void
}

export type ClientToServerGamesEvents = {
  'games:getList': (cb: (err: any, games: GameSummary[]) => void) => void
  'games:create': (options: CreateGameOptions) => void
  'games:join': (
    gameId: string,
    cb: (err: any, game: GameSummary) => void
  ) => void
}
