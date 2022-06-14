import { GameState } from '@icehouse-homeworlds/api'
import {
  GameplayAction,
  GameplayEffect,
  PlayerGameplayPayload,
} from '@icehouse-homeworlds/api/game'
import applyGameplayAction from './game-play-actions'
import isValidGameplayAction from './game-play-validator'

type ActionState = [boolean, GameplayEffect[], GameState]

export function performGameUpdate(
  oldState: GameState,
  playerId: string,
  update: PlayerGameplayPayload
): [GameplayEffect[], GameState] {
  if (!isValidTurnForPlayer(oldState, playerId)) {
    return [[], oldState]
  }

  const actionReducer = actionReducerFor(playerId)

  const [isValid, effects, newState] = update.actions.reduce(actionReducer, [
    true,
    [],
    oldState,
  ])

  if (isValid) {
    updatePlayerStatuses(newState)
    return [effects, newState]
  } else {
    return [[], oldState]
  }
}

function isValidTurnForPlayer(game: GameState, playerId: string) {
  if (!game.players.some((p) => p.playerId === playerId)) {
    // TODO: player isn't part of this game; abandon ship!
    return false
  }

  if (game.turnOf !== playerId) {
    // TODO: player is acting out-of-turn; abandon ship!
    return false
  }

  if (game.status !== 'PLAY') {
    // TODO: game is in the wrong phase for this kind of action
    return false
  }

  return true
}

function actionReducerFor(playerId: string) {
  return (
    [isValid, effects, oldState]: ActionState,
    action: GameplayAction
  ): ActionState => {
    isValid =
      isValid &&
      oldState.turnOf === playerId &&
      isValidGameplayAction(oldState, action)

    if (!isValid) return [isValid, effects, oldState]

    const [effect, postActionState] = applyGameplayAction(oldState, action)

    effects.push(effect)

    return [isValid, effects, postActionState]
  }
}

function updatePlayerStatuses(game: GameState): GameState {
  // Perform post-actions cleanup of player state
  game.players
    .filter((p) => p.status === 'PLAYING')
    .forEach((p) => {
      const hw = game.board.homeworlds.find((hw) => hw.playerId === p.playerId)

      if (hw && hw.ships.some((s) => s.playerId === p.playerId)) {
        p.status = 'PLAYING'
      } else {
        p.status = 'LOST'
      }
    })

  const stillActivePlayers = game.players.filter((p) => p.status == 'PLAYING')

  if (stillActivePlayers.length < 2) {
    stillActivePlayers[0].status = 'WON'
    game.status = 'END'
  }

  return game
}
