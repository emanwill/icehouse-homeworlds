type ErrorPacket = {
  status: number
  errorCode?: number
  message: string
}

export type SocketAck<T> = (err: ErrorPacket | null, data?: T) => void