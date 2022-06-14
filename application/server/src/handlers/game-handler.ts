import { SocketAck } from '@icehouse-homeworlds/api/common'
import {
  CreateGameOptions,
  GameState,
  GameStateUpdate,
  PlayerGameplayPayload,
  PlayerSetupPayload,
} from '@icehouse-homeworlds/api/game'
import { addGame, findGameById, updateGameById } from '../database/games-db'
import {
  createPlayer,
  findPlayerSocketByPlayerId,
  findPlayerSocketBySocketId,
} from '../database/players-db'
import { deleteUserBySocketId, findUserBySocketId } from '../database/users-db'
import { IceworldsIOServer, IceworldsIOSocket } from '../express-io-server'
import applyGameStateUpdate from '../logic/game-play'
import { addPlayer, canAddPlayer, createNewGame } from '../logic/game-setup'
import { Errors } from './socket-messaging'

export default function registerGameHandler(
  io: IceworldsIOServer,
  socket: IceworldsIOSocket
) {
  const onGameCreate = async (
    options: CreateGameOptions,
    cb: SocketAck<GameState>
  ) => {
    const user = await findUserBySocketId(socket.id)
    if (!user) {
      cb({ code: 401, message: 'Unregistered user' })
      return
    }

    const playerId = await createPlayer(socket)

    const game = createNewGame({
      playerSlots: options.playerSlots,
      firstPlayer: {
        playerId,
        playerName: user.name,
        status: 'PLAYING',
      },
    })

    await addGame(game)

    cb(null, game)
  }

  const onGameJoin = async (gameId: string, cb: SocketAck<GameState>) => {
    const user = await findUserBySocketId(socket.id)
    if (!user) {
      cb(Errors.USER_NOT_FOUND)
      return
    }

    const game = await findGameById(gameId)
    if (!game) {
      cb(Errors.GAME_NOT_FOUND)
      return
    }

    if (!canAddPlayer(game)) {
      cb(Errors.GAME_FULL)
      return
    }

    const playerId = await createPlayer(socket)

    addPlayer(game, { playerId, playerName: user.name, status: 'PLAYING' })
  }

  const onGameBegin = (gameId: string, cb: SocketAck<GameState>) => {
    //
  }

  const onGameLeave = (gameId: string) => {
    //
  }

  const onGameSetup = (payload: PlayerSetupPayload, cb: SocketAck<boolean>) => {
    //
  }

  const onGameMove = async (
    playerPayload: PlayerGameplayPayload,
    cb: SocketAck<boolean>
  ) => {
    const user = await findUserBySocketId(socket.id)
    if (!user) {
      cb(Errors.USER_NOT_FOUND)
      return
    }

    const playerSocket = await findPlayerSocketBySocketId(socket.id)
    if (!playerSocket) {
      cb(Errors.PLAYER_NOT_FOUND)
      return
    }

    const prevGameState = await findGameById(playerPayload.gameId)
    if (!prevGameState) {
      cb(Errors.GAME_NOT_FOUND)
      return
    }

    const [effects, nextGameState] = applyGameStateUpdate(
      prevGameState,
      playerSocket.playerId,
      playerPayload
    )

    if (effects.length === 0) {
      cb(null, false)
      return
    }

    await updateGameById(playerPayload.gameId, nextGameState)

    cb(null, true)

    const updateResponse: GameStateUpdate = {
      ...nextGameState,
      previousBoard: prevGameState.board,
      previousTurnOf: prevGameState.turnOf,
      previousTurnEffects: effects,
    }

    for (const p of nextGameState.players) {
      const pSocket = await findPlayerSocketByPlayerId(p.playerId)
      if (pSocket) io.to(pSocket.socketId).emit('game:state', updateResponse)
    }
  }

  const onDisconnect = async () => {
    await deleteUserBySocketId(socket.id)

    const playerSocket = await findPlayerSocketBySocketId(socket.id)
    if (!playerSocket) return
  }

  socket
    .on('game:create', onGameCreate)
    .on('game:join', onGameJoin)
    .on('game:begin', onGameBegin)
    .on('game:leave', onGameLeave)
    .on('game:setup', onGameSetup)
    .on('game:move', onGameMove)
    .on('disconnect', onDisconnect)
}
