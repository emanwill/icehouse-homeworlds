import {
  ctosBeginGame,
  ctosCommitGameAction,
  ctosCommitSetupAction,
  ctosCreateGame,
  ctosGetGames,
  ctosJoinGame,
  ctosLeaveGame,
} from './game'
import {
  ctosJoinLobby,
  ctosLeaveLobby,
  ctosSendChatMessage,
  stocLobbyChatMessage,
  stocLobbySystemMessage,
  stocUpdateLobby,
} from './lobby'

export {
  TokenColor,
  TokenSize,
  GameStatus,
  PlayerStatus,
  GameState,
} from './game'

export interface ClientToServerEvents {
  'lobby:join': ctosJoinLobby
  'lobby:leave': ctosLeaveLobby
  'lobby:sendChat': ctosSendChatMessage
  'game:list': ctosGetGames
  'game:create': ctosCreateGame
  'game:join': ctosJoinGame
  'game:begin': ctosBeginGame
  'game:leave': ctosLeaveGame
  'game:setup': ctosCommitSetupAction
  'game:move': ctosCommitGameAction
}

export interface ServerToClientEvents {
  'lobby:update': stocUpdateLobby
  'lobby:chatMessage': stocLobbyChatMessage
  'lobby:systemMessage': stocLobbySystemMessage
}
