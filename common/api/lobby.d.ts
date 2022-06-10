import { SocketAck } from './common'

type LobbyState = {
  users: LobbyUser[]
}

type LobbyUser = {
  id: string
  username: string
}

type LobbyChatMessage = {
  senderId: string
  senderName: string
  message: string
}

type LobbySystemMessage = {
  message: string
}

export type ctosJoinLobby = (
  username: string,
  cb: SocketAck<LobbyState>
) => void
export type ctosSendChatMessage = (message: string) => void
export type ctosLeaveLobby = () => void

export type stocUpdateLobby = (state: LobbyState) => void
export type stocLobbyChatMessage = (message: LobbyChatMessage) => void
export type stocLobbySystemMessage = (message: LobbySystemMessage) => void
