import { networkInterfaces } from 'os'
import { randomBytes } from 'crypto'

export const getNetworkAddresses = () =>
  Object.values(networkInterfaces())
    .flatMap((a) => a)
    .filter((iface) => iface?.family === 'IPv4')
    .map((iface) => iface?.address)

export const createId = (prefix: string, bytes: number) =>
  prefix + randomBytes(bytes).toString('hex')

export const cloneJson = <T>(json: T): T => JSON.parse(JSON.stringify(json))
