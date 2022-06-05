import EventEmitter from 'events'

const bus = new EventEmitter()

export function subscribe(
  event: string | symbol,
  listener: (...args: any[]) => void
) {
  bus.addListener(event, listener)
}

export function unsubscribe(
  event: string | symbol,
  listener: (...args: any[]) => void
) {
  bus.removeListener(event, listener)
}

export function emit(event: string | symbol, ...args: any[]) {
  bus.emit(event, ...args)
}
