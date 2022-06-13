import { GameState } from '@icehouse-homeworlds/api'
import {
  GameplayAction,
  GameplayEffect,
  GameStateUpdate,
  PlayerGameplayPayload,
} from '@icehouse-homeworlds/api/game'
import applyGameplayAction from './game-play-actions'
import isValidGameplayAction from './game-play-validator'

function performGameUpdate(
  game: GameState,
  playerId: string,
  update: PlayerGameplayPayload
) {
  // TODO check validity of overall request (player is in the game; versions match; etc.)

  /*
  Strategy:
  validate an action
  apply the action
  perform post-action cleanup
  continue to next action in the list
  ...
  update player statuses
  */

  type ActionState = [boolean, GameplayEffect[], GameState]

  const actionReducer = (
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

  const [isValid, effects, newState] = update.actions.reduce(actionReducer, [
    true,
    [],
    game,
  ])

  if (isValid) {
    // The update was successful; all actions were valid
    // TODO: ???
  } else {
    // The update failed; one or more actions were invalid
    // TODO: ???
  }
}
