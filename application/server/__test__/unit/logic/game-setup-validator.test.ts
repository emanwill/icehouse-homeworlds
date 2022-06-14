import {
  GameState,
  HomeworldShipSetupAction,
  HomeworldStar1SetupAction,
  HomeworldStar2SetupAction,
} from '@icehouse-homeworlds/api/game'
import mockBank from '../../../__mock_data__/bank'
import validate from '../../../src/logic/game-setup-validator'

describe('logic/game-setup-validator validation', () => {
  it('should pass if star-1-setup action is valid', () => {
    const game: GameState = {
      board: { bank: mockBank(3), homeworlds: [], systems: [] },
      gameId: 'game01',
      playerSlots: 2,
      players: [
        { playerId: 'foo', playerName: '', status: 'PLAYING' },
        { playerId: 'bar', playerName: '', status: 'PLAYING' },
      ],
      status: 'SETUP1',
      version: 1,
      turnOf: 'foo',
    }

    const action: HomeworldStar1SetupAction = {
      type: 'HOMEWORLD_STAR1_SETUP',
      newStarColor: 'blue',
      newStarSize: 'medium',
    }

    const result = validate(game, action)

    expect(result).toBe(true)
  })

  it('should pass if star-2-setup action is valid', () => {
    const game: GameState = {
      board: {
        bank: mockBank(3),
        homeworlds: [
          {
            playerId: 'foo',
            systemId: '10',
            stars: [{ starId: 'star10', color: 'red', size: 'large' }],
            ships: [],
            isHomeworld: true,
          },
          {
            playerId: 'bar',
            systemId: '20',
            stars: [{ starId: 'star20', color: 'green', size: 'small' }],
            ships: [],
            isHomeworld: true,
          },
        ],
        systems: [],
      },
      gameId: 'game01',
      playerSlots: 2,
      players: [
        { playerId: 'foo', playerName: '', status: 'PLAYING' },
        { playerId: 'bar', playerName: '', status: 'PLAYING' },
      ],
      status: 'SETUP2',
      version: 1,
      turnOf: 'foo',
    }

    const action: HomeworldStar2SetupAction = {
      type: 'HOMEWORLD_STAR2_SETUP',
      newStarColor: 'blue',
      newStarSize: 'medium',
    }

    const result = validate(game, action)

    expect(result).toBe(true)
  })

  it('should pass if ship-setup action is valid', () => {
    const game: GameState = {
      board: {
        bank: mockBank(3),
        homeworlds: [
          {
            playerId: 'foo',
            systemId: '10',
            stars: [
              { starId: 'star10', color: 'red', size: 'large' },
              { starId: 'star15', color: 'green', size: 'small' },
            ],
            ships: [],
            isHomeworld: true,
          },
          {
            playerId: 'bar',
            systemId: '20',
            stars: [
              { starId: 'star20', color: 'green', size: 'small' },
              { starId: 'star25', color: 'yellow', size: 'medium' },
            ],
            ships: [],
            isHomeworld: true,
          },
        ],
        systems: [],
      },
      gameId: 'game01',
      playerSlots: 2,
      players: [
        { playerId: 'foo', playerName: '', status: 'PLAYING' },
        { playerId: 'bar', playerName: '', status: 'PLAYING' },
      ],
      status: 'SETUP3',
      version: 1,
      turnOf: 'foo',
    }

    const action: HomeworldShipSetupAction = {
      type: 'HOMEWORLD_SHIP_SETUP',
      newShipColor: 'blue',
      newShipSize: 'medium',
    }

    const result = validate(game, action)

    expect(result).toBe(true)
  })

  it('should fail if game is in setup stage 2 and action is for stage 1', () => {
    const game: GameState = {
      board: {
        bank: mockBank(3),
        homeworlds: [
          {
            playerId: 'foo',
            systemId: '10',
            stars: [{ starId: 'star10', color: 'red', size: 'large' }],
            ships: [],
            isHomeworld: true,
          },
          {
            playerId: 'bar',
            systemId: '20',
            stars: [{ starId: 'star20', color: 'green', size: 'small' }],
            ships: [],
            isHomeworld: true,
          },
        ],
        systems: [],
      },
      gameId: 'game01',
      playerSlots: 2,
      players: [
        { playerId: 'foo', playerName: '', status: 'PLAYING' },
        { playerId: 'bar', playerName: '', status: 'PLAYING' },
      ],
      status: 'SETUP2',
      version: 1,
      turnOf: 'foo',
    }

    const action: HomeworldStar1SetupAction = {
      type: 'HOMEWORLD_STAR1_SETUP',
      newStarColor: 'blue',
      newStarSize: 'medium',
    }

    const result = validate(game, action)

    expect(result).toBe(false)
  })
})
