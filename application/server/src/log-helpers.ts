import { GameState, TokenColor, TokenSize } from '@icehouse-homeworlds/api'
import {
  CatastropheAction,
  HomeworldShipSetupAction,
  HomeworldStar1SetupAction,
  HomeworldStar2SetupAction,
  PlayerGameplayPayload,
  PlayerSetupPayload,
  SacrificeAction,
  Ship,
  Star,
} from '@icehouse-homeworlds/api/game'
import NestedPrintout from './nested-printout'

const COLORS: TokenColor[] = ['red', 'yellow', 'green', 'blue']
const SIZES: TokenSize[] = ['small', 'medium', 'large']

export const pieceNo = (color: TokenColor, size: TokenSize) => {
  const sizeNo = SIZES.findIndex((s) => s === size) + 1
  const colorChar = color.charAt(0).toUpperCase()
  return `${colorChar}${sizeNo}`
}

export const shortId = (id: string) =>
  /^(.{2}).*(.{4}$)/.exec(id)?.slice(1).join('..') ?? ''

const shipDesc = ({ color, size, playerId }: Ship) =>
  `${pieceNo(color, size)} owned by ${shortId(playerId)}`

const starDesc = (star: Star) => `(${pieceNo(star.color, star.size)})`

export function printableGameState({
  gameId,
  version,
  playerSlots,
  players,
  status,
  turnOf,
  board,
}: GameState) {
  const print = new NestedPrintout()

  // Game Summary and Status
  const moveNo = version.toString().padStart(3, '0')
  print.addLine(`GAME ${gameId}`)
  print
    .addNestedLevel()
    .addLine(`${playerSlots} players; move #${moveNo}; status: ${status}`)
    .addLine('')

  // Players
  const playersPrint = print.addNestedLevel().addLine('players:')
  players.forEach(({ playerId, status, playerName }) => {
    const pin = playerId === turnOf ? '>' : ' '
    const str = `${pin} ${playerId} ${status.padEnd(10)} ${playerName}`
    playersPrint.addLine(str)
  })
  playersPrint.addLine('')

  // Token Bank
  const colorInitials = COLORS.map((c) => c.charAt(0).toUpperCase())
  const bankPrint = print
    .addNestedLevel()
    .addLine('token bank:')
    .addLine(`    (${colorInitials.join(') (')})`)
  SIZES.forEach((s, idx) => {
    const counts = COLORS.map((c) => board.bank[c][s].toString()).join('   ')
    bankPrint.addLine(`(${idx + 1})  ${counts}`)
  })
  bankPrint.addLine('')

  // Homeworld Systems
  const homesPrint = print.addNestedLevel().addLine('homeworld systems:')
  board.homeworlds.forEach((hw) => {
    const hwId = shortId(hw.systemId)
    const plId = shortId(hw.playerId)
    const stars = hw.stars.map(starDesc).join(',')

    const homePrint = homesPrint
      .addNestedLevel()
      .addLine(`${shortId(hwId)} (${stars}) owned by ${plId}`)

    const shipsPrint = homePrint.addNestedLevel().addLine('ships:')
    hw.ships.forEach((ship) => shipsPrint.addLine(shipDesc(ship)))
    shipsPrint.addLine('')
  })

  // Other Systems
  const systemsPrinter = print.addNestedLevel().addLine('other star systems:')
  board.systems.forEach((sys) => {
    const sysDesc = `${shortId(sys.systemId)} ${starDesc(sys.star)})`
    const sysPrinter = systemsPrinter.addNestedLevel().addLine(sysDesc)
    const shipsPrinter = sysPrinter.addNestedLevel().addLine('ships:')
    sys.ships.forEach((ship) => shipsPrinter.addLine(shipDesc(ship)))
    shipsPrinter.addLine('')
  })

  return print
}

export function printableActionPayload(
  playerId: string,
  { gameId, version, actions }: PlayerSetupPayload | PlayerGameplayPayload
) {
  const printout = new NestedPrintout()

  printout
    .addLine('GAME UPDATE PAYLOAD')
    .addLine(`from player ${playerId} for game ${gameId} `)
    .addLine(`game state version #${version}`)

  const actionsPrint = printout.addNestedLevel().addLine('actions:')
  actions.forEach((action) => {
    const actPrint = actionsPrint.addNestedLevel().addLine(action.type)

    switch (action.type) {
      case 'HOMEWORLD_STAR1_SETUP':
      case 'HOMEWORLD_STAR2_SETUP':
        return printableHwStarSetup(actPrint, action)
      case 'HOMEWORLD_SHIP_SETUP':
        return printableHwShipSetup(actPrint, action)
      case 'CATASTROPHE':
        return printableCatastropheAction(actPrint, action)
      case 'SACRIFICE':
        return printableSacrificeAction(actPrint, action)
      case 'END_TURN':
        return actPrint.addLine('')
      case 'NORMAL':
        break
    }
  })

  return printout
}

function printableHwStarSetup(
  printout: NestedPrintout,
  {
    newStarColor,
    newStarSize,
  }: HomeworldStar1SetupAction | HomeworldStar2SetupAction
) {
  return printout
    .addLine(`add star (${pieceNo(newStarColor, newStarSize)})`)
    .addLine('')
}

function printableHwShipSetup(
  printout: NestedPrintout,
  { newShipColor, newShipSize }: HomeworldShipSetupAction
) {
  return printout
    .addLine(`add ship (${pieceNo(newShipColor, newShipSize)})`)
    .addLine('')
}

function printableCatastropheAction(
  printout: NestedPrintout,
  { color, systemId }: CatastropheAction
) {
  return printout
    .addLine(`destroy all ${color}s in system ${shortId(systemId)}`)
    .addLine('')
}

function printableSacrificeAction(
  printout: NestedPrintout,
  { shipId, systemId }: SacrificeAction
) {
  return printout
    .addLine(`sacrifice ship ${shortId(shipId)} in system ${shortId(systemId)}`)
    .addLine('')
}
