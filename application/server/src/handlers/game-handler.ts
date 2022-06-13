import { SocketAck } from '@icehouse-homeworlds/api/common'
import {
  CreateGameOptions,
  GameState,
  PlayerGameplayPayload,
  PlayerSetupPayload,
} from '@icehouse-homeworlds/api/game'
import { addGame, findGameById } from '../dao/games-dao'
import { createPlayer } from '../dao/player-dao'
import { findUserBySocketId } from '../dao/user-dao'
import { IceworldsIOServer, IceworldsIOSocket } from '../express-io-server'
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

    const playerId = createPlayer(socket)

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

    const playerId = createPlayer(socket)

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

  const onGameMove = (
    payload: PlayerGameplayPayload,
    cb: SocketAck<boolean>
  ) => {
    //
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
