import { SocketAck } from '@icehouse-homeworlds/api/common'
import {
  CreateGameOptions,
  GameState,
  GameStateUpdate,
  PlayerGameplayPayload,
  PlayerSetupPayload,
} from '@icehouse-homeworlds/api/game'
import { addGame, findGameById, updateGameById } from '../dao/games-dao'
import {
  createPlayer,
  findPlayerSocketByPlayerId,
  findPlayerSocketBySocketId,
} from '../dao/player-dao'
import { findUserBySocketId } from '../dao/user-dao'
import { IceworldsIOServer, IceworldsIOSocket } from '../express-io-server'
import applyGameStateUpdate from '../logic/game-play'
import { addPlayer, canAddPlayer, createNewGame } from '../logic/game-setup'

export default function registerGameHandler(
  io: IceworldsIOServer,
  socket: IceworldsIOSocket
) {
  const onGameCreate = async (
    options: CreateGameOptions,
    cb: SocketAck<GameState>
  ) => {
    const user = findUserBySocketId(socket.id)
    if (!user) {
      cb({ status: 401, errorCode: 401, message: 'Unregistered user' })
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
    const user = findUserBySocketId(socket.id)
    if (!user) {
      cb({ status: 401, errorCode: 401, message: 'Unregistered user' })
      return
    }

    const game = await findGameById(gameId)
    if (!game) {
      cb({ status: 404, message: 'Unknown game ID' })
      return
    }

    if (!canAddPlayer(game)) {
      cb({ status: 409, message: 'Game is full' })
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
    gameplayPayload: PlayerGameplayPayload,
    cb: SocketAck<boolean>
  ) => {
    const user = findUserBySocketId(socket.id)
    if (!user) {
      cb({ status: 401, message: 'Unregistered user' })
      return
    }

    const playerSocket = await findPlayerSocketBySocketId(socket.id)
    if (!playerSocket) {
      cb({ status: 401, message: 'User is not a registered player' })
      return
    }

    const prevGameState = await findGameById(gameplayPayload.gameId)
    if (!prevGameState) {
      cb({ status: 404, message: 'Unknown game ID' })
      return
    }

    const [effects, nextGameState] = applyGameStateUpdate(
      prevGameState,
      playerSocket.playerId,
      gameplayPayload
    )

    if (effects.length === 0) {
      cb(null, false)
      return
    }

    await updateGameById(gameplayPayload.gameId, nextGameState)

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

  const onDisconnect = () => {
    //
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
