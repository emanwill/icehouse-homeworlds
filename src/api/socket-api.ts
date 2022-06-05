export const SocketEvents = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
}

export const UserEvents = {
  client: {
    CREATE_USER: 'user:create',
  },
  server: {
    USER_CREATED: 'user:created',
  },
}

export const LobbyEvents = {
  client: {
    JOIN: 'lobby:join',
    LEAVE: 'lobby:leave',
    MESSAGE: 'lobby:message',
  },
  server: {
    jOIN_SUCCESS: 'lobby:joinSuccess',
    ERR_JOIN_FAILED: 'lobby:joinFailed',
    USER_JOINED: 'lobby:userJoined',
    USER_MESSAGE: 'lobby:userMessage',
    ERR_MESSAGE_FAILED: 'lobby:errMessageFailed',
  },
}
