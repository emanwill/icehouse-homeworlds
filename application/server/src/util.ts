import { networkInterfaces } from 'os'
import { randomBytes } from 'crypto'

export const getNetworkAddresses = (): string[] =>
  Object.values(networkInterfaces())
    .flatMap((a) => a)
    .filter((iface) => iface?.family === 'IPv4')
    .map((iface) => iface?.address)
    .filter((addr) => !!addr)

export const createId = (prefix: string, bytes: number) =>
  prefix + randomBytes(bytes).toString('hex')

export const cloneJson = <T>(json: T): T => JSON.parse(JSON.stringify(json))

export const awaitTimeout = (delay = 0) =>
  new Promise<void>((resolve) => setTimeout(resolve, delay))
