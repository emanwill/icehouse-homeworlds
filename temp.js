// @ts-check
const { randomBytes } = require('crypto')

/** @typedef {import('@icehouse-homeworlds/api/game').GameState} GameState */
/** @typedef {import('@icehouse-homeworlds/api/game').TokenColor} TokenColor */
/** @typedef {import('@icehouse-homeworlds/api/game').TokenSize} TokenSize */

/** @type {TokenColor[]} */
const colors = ['red', 'yellow', 'green', 'blue']

/** @type {TokenSize[]} */
const sizes = ['small', 'medium', 'large']

const ID_LEN = 6

const createId = (prefix, bytes) => prefix + randomBytes(bytes).toString('hex')

const GameObjectIds = {
  game: () => createId('game', ID_LEN),
  homeworldSystem: () => createId('hwld', ID_LEN),
  player: () => createId('plyr', ID_LEN),
  ship: () => createId('ship', ID_LEN),
  star: () => createId('star', ID_LEN),
  starSystem: () => createId('ssys', ID_LEN),
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
 * @param {import('@icehouse-homeworlds/api/game').Ship} ship
 */
const shipDesc = (ship, prefix = '') => {
  const piece = pieceNo(ship.color, ship.size)
  return `${prefix}${ship.shipId} (${piece}) owned by ${ship.playerId}`
}

/**
 *
 * @param {import('@icehouse-homeworlds/api/game').Star} star
 */
const starDesc = (star, prefix = '') => {
  return `${prefix}${star.starId} (${pieceNo(star.color, star.size)})`
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
  const lines = []
  const moveNo = version.toString().padStart(3, '0')
  lines.push(`┌ GAME ${gameId}`)
  lines.push(`│ ${playerSlots} players, move #${moveNo}, status: ${status}`)
  lines.push(`│\n├ Players:`)

  players.forEach((p) => {
    const pin = p.playerId === turnOf ? '>' : ' '
    lines.push(
      `│ ${pin} ${p.playerId}  ${p.status.padEnd(10)}  ${p.playerName.padEnd(
        16
      )}`
    )
  })

  lines.push(`│\n├ Token Bank:`)
  lines.push(`│    ${colors.map(firstInitial).join(' ')}`)
  sizes.forEach((s) => {
    const countStr = colors.map((c) => board.bank[c][s].toString()).join(' ')
    lines.push(`│  ${firstInitial(s)} ${countStr}`)
  })

  lines.push(`│\n├ Homeworld Systems:`)
  board.homeworlds.forEach((hw) => {
    lines.push(`│  │  │${hw.systemId}, home of ${hw.playerId}`)
    const starsStr = hw.stars.map((s) => starDesc(s)).join(', ')
    lines.push(`│  ├ stars: ${starsStr}`)
    lines.push('│  │\n│  ├ ships:\n│  │')
    const shipDescs = hw.ships.map((s) => shipDesc(s))
  })

  console.log(lines.join('\n'))
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
  turnOf: p1Id,
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
    ],
  },
}

printGameState(exampleGameState)
