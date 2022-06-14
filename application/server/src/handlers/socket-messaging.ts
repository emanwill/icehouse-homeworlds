import { ErrorPacket } from '@icehouse-homeworlds/api/common'

const USER_NOT_FOUND: ErrorPacket = {
  code: 401,
  message: 'User Not Found',
}

const PLAYER_NOT_FOUND: ErrorPacket = {
  code: 402,
  message: 'Player Not Found',
}

const GAME_NOT_FOUND: ErrorPacket = {
  code: 411,
  message: 'Game Not Found',
}

const GAME_FULL: ErrorPacket = {
  code: 419,
  message: 'Game is Full',
}

export const Errors = {
  USER_NOT_FOUND,
  PLAYER_NOT_FOUND,
  GAME_NOT_FOUND,
  GAME_FULL,
}
