import { networkInterfaces } from 'os'

export const getNetworkAddresses = () =>
  Object.values(networkInterfaces())
    .flatMap((a) => a)
    .filter((iface) => iface?.family === 'IPv4')
    .map((iface) => iface?.address)
