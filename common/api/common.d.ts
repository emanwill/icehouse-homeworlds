type ErrorPacket = {
  code: number
  message: string
}

export type SocketAck<T> = (err: ErrorPacket | null, data?: T) => void

export type TupleToUnion<T extends unknown[]> = T[number]
