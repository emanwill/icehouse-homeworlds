/* eslint-ignore */
// @ts-check
const { randomBytes } = require('crypto')
const NestedPrintout = require('./print-nester')

/** @typedef {import('@icehouse-homeworlds/api/game').GameState} GameState */
/** @typedef {import('@icehouse-homeworlds/api/game').TokenColor} TokenColor */
/** @typedef {import('@icehouse-homeworlds/api/game').TokenSize} TokenSize */

/** @type {TokenColor[]} */
const colors = ['red', 'yellow', 'green', 'blue']

/** @type {TokenSize[]} */
const sizes = ['small', 'medium', 'large']

const ID_LEN = 8

const createId = (prefix, bytes) => prefix + randomBytes(bytes).toString('hex')

const GameObjectIds = {
  game: () => createId('gm:', ID_LEN),
  homeworldSystem: () => createId('hw:', ID_LEN),
  player: () => createId('pl:', ID_LEN),
  ship: () => createId('sh:', ID_LEN),
  star: () => createId('st:', ID_LEN),
  starSystem: () => createId('sy:', ID_LEN),
}

/**
 *
 * @param {string} str
 * @returns
 */
const firstInitial = (str) => str.charAt(0).toUpperCase()

/**
 *
 * @param {TokenColor} color
 * @param {TokenSize} size
 * @returns
 */
const pieceNo = (color, size) => {
  const sizeIdx = sizes.findIndex((s) => s === size)
  return `${firstInitial(color)}${sizeIdx + 1}`
}

/**
 *
 * @param {string} id
 */
const shortId = (id) => /^(\w+):.*([0-9a-f]{4}$)/.exec(id).slice(1).join('..')

/**
 *
 * @param {import('@icehouse-homeworlds/api/game').Ship} ship
 */
const shipDesc = (ship) => {
  const piece = pieceNo(ship.color, ship.size)
  return `(${piece}) owned by ${shortId(ship.playerId)}`
}

/**
 *
 * @param {import('@icehouse-homeworlds/api/game').Star} star
 */
const starDesc = (star) => {
  return `${shortId(star.starId)} (${pieceNo(star.color, star.size)})`
}

/**
 *
 * @param {import('@icehouse-homeworlds/api/game').StarSystem} system
 */
const systemDesc = ({ systemId, star }) => {
  return `${shortId(systemId)} (${pieceNo(star.color, star.size)})`
}

/**
 *
 * @param {import('@icehouse-homeworlds/api/game').HomeworldSystem} param0
 */
const homeworldDesc = ({ systemId, playerId, stars }) => {
  const starsDesc = stars.map((s) => pieceNo(s.color, s.size)).join(',')
  return `${shortId(systemId)} (${starsDesc}) owned by ${shortId(playerId)}`
}

/**
 *
 * @param {GameState} game
 */
function printGameState({
  gameId,
  version,
  playerSlots,
  status,
  turnOf,
  players,
  board,
}) {
  const printout = new NestedPrintout()

  const moveNo = version.toString().padStart(3, '0')
  printout.addLine(`GAME ${gameId}`)
  const summary = `${playerSlots} players, move #${moveNo}, status: ${status}`
  printout.addNestedLevel().addLine(summary).addLine('')

  const plrsPrint = printout.addNestedLevel()
  plrsPrint.addLine('Players:')
  players.forEach(({ playerId: id, status, playerName: name }) => {
    const pin = id === turnOf ? '>' : ' '
    const str = `${pin} ${id} ${status.padEnd(10)} ${name.padEnd(16)}`
    plrsPrint.addLine(str)
  })
  plrsPrint.addLine('')

  const bankPrint = printout.addNestedLevel()
  bankPrint.addLine('Token Bank:')
  bankPrint.addLine(`    (${colors.map(firstInitial).join(') (')})`)
  sizes.forEach((s, idx) => {
    const countStr = colors.map((c) => board.bank[c][s].toString()).join('   ')
    bankPrint.addLine(`(${idx + 1})  ${countStr}`)
  })
  bankPrint.addLine('')

  const hmwsPrint = printout.addNestedLevel()
  hmwsPrint.addLine('Homeworld Systems:')
  board.homeworlds.forEach((hw, idx, arr) => {
    const hwPrint = hmwsPrint.addNestedLevel()
    hwPrint.addLine(`${homeworldDesc(hw)}`)
    const starsDesc = hw.stars.map(starDesc).join(', ')
    // hwPrint.addNestedLevel().addLine('stars: ' + starsDesc)
    const shipsPrint = hwPrint.addNestedLevel().addLine('ships:')
    hw.ships.forEach((ship) => shipsPrint.addLine(shipDesc(ship)))
    shipsPrint.addLine('')
  })

  const syssPrint = printout.addNestedLevel()
  syssPrint.addLine('Other Systems:')
  board.systems.forEach((sys) => {
    const sPrint = syssPrint.addNestedLevel()
    sPrint.addLine(systemDesc(sys))
    const shPrint = sPrint.addNestedLevel().addLine('ships:')
    sys.ships.forEach((sh) => shPrint.addLine(shipDesc(sh)))
    shPrint.addLine('')
  })

  console.log(printout.toString())
}

// ========================================================================== //
// ========================================================================== //
// ========================================================================== //

const p1Id = GameObjectIds.player()
const p2Id = GameObjectIds.player()

/** @type {GameState} */
const exampleGameState = {
  gameId: GameObjectIds.game(),
  status: 'PLAY',
  version: 7,
  turnOf: p2Id,
  playerSlots: 2,
  players: [
    {
      playerId: p1Id,
      playerName: 'Alice',
      status: 'PLAYING',
    },
    {
      playerId: p2Id,
      playerName: 'Bob',
      status: 'PLAYING',
    },
  ],
  board: {
    bank: {
      blue: { small: 2, medium: 3, large: 1 },
      red: { small: 1, medium: 3, large: 3 },
      green: { small: 3, medium: 3, large: 0 },
      yellow: { small: 3, medium: 1, large: 3 },
    },
    homeworlds: [
      {
        playerId: p1Id,
        systemId: GameObjectIds.homeworldSystem(),
        ships: [
          {
            playerId: p1Id,
            shipId: GameObjectIds.ship(),
            color: 'blue',
            size: 'medium',
          },
          {
            playerId: p2Id,
            shipId: GameObjectIds.ship(),
            color: 'red',
            size: 'small',
          },
          {
            playerId: p1Id,
            shipId: GameObjectIds.ship(),
            color: 'yellow',
            size: 'small',
          },
        ],
        stars: [
          {
            starId: GameObjectIds.star(),
            color: 'green',
            size: 'small',
          },
          {
            starId: GameObjectIds.star(),
            color: 'red',
            size: 'medium',
          },
        ],
      },
      {
        systemId: GameObjectIds.homeworldSystem(),
        playerId: p2Id,
        stars: [
          { starId: GameObjectIds.star(), color: 'green', size: 'large' },
        ],
        ships: [
          {
            shipId: GameObjectIds.ship(),
            playerId: p2Id,
            color: 'yellow',
            size: 'large',
          },
        ],
      },
    ],
    systems: [
      {
        systemId: GameObjectIds.starSystem(),
        star: { starId: GameObjectIds.star(), color: 'yellow', size: 'small' },
        ships: [
          {
            playerId: p2Id,
            shipId: GameObjectIds.ship(),
            color: 'blue',
            size: 'large',
          },
        ],
      },
      {
        systemId: GameObjectIds.starSystem(),
        star: { starId: GameObjectIds.star(), color: 'red', size: 'medium' },
        ships: [
          {
            shipId: GameObjectIds.ship(),
            playerId: p2Id,
            color: 'blue',
            size: 'small',
          },
        ],
      },
    ],
  },
}

printGameState(exampleGameState)
