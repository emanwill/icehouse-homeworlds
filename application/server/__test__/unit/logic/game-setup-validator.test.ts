import { GameState, PlayerSetupRequest } from '@icehouse-homeworlds/api/game'
import mockBank from '../../../__mock_data__/bank'
import validate from '../../../src/logic/game-setup-validator'

describe('logic/game-setup-validator validation', () => {
  it('should pass if setup stage 1 request is valid', () => {
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

    const playerId = 'foo'

    const request: PlayerSetupRequest = {
      action: {
        type: 'HOMEWORLD_STAR1_SETUP',
        sequenceNo: 0,
        newStarColor: 'blue',
        newStarSize: 'medium',
      },
      gameId: 'game01',
      version: 1,
    }

    const result = validate(game, playerId, request)

    expect(result).toBe(true)
  })

  it('should pass if setup stage 2 request is valid', () => {
    const game: GameState = {
      board: {
        bank: mockBank(3),
        homeworlds: [
          {
            playerId: 'foo',
            systemId: '10',
            stars: [{ starId: 'star10', color: 'red', size: 'large' }],
            ships: [],
          },
          {
            playerId: 'bar',
            systemId: '20',
            stars: [{ starId: 'star20', color: 'green', size: 'small' }],
            ships: [],
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

    const playerId = 'foo'

    const request: PlayerSetupRequest = {
      action: {
        type: 'HOMEWORLD_STAR2_SETUP',
        sequenceNo: 0,
        newStarColor: 'blue',
        newStarSize: 'medium',
      },
      gameId: 'game01',
      version: 1,
    }

    const result = validate(game, playerId, request)

    expect(result).toBe(true)
  })

  it('should pass if setup stage 3 request is valid', () => {
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
          },
          {
            playerId: 'bar',
            systemId: '20',
            stars: [
              { starId: 'star20', color: 'green', size: 'small' },
              { starId: 'star25', color: 'yellow', size: 'medium' },
            ],
            ships: [],
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

    const playerId = 'foo'

    const request: PlayerSetupRequest = {
      action: {
        type: 'HOMEWORLD_SHIP_SETUP',
        sequenceNo: 0,
        newShipColor: 'blue',
        newShipSize: 'medium',
      },
      gameId: 'game01',
      version: 1,
    }

    const result = validate(game, playerId, request)

    expect(result).toBe(true)
  })

  it('should fail if player requests for wrong game', () => {
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

    const playerId = 'baz'

    const request: PlayerSetupRequest = {
      action: {
        type: 'HOMEWORLD_STAR1_SETUP',
        sequenceNo: 0,
        newStarColor: 'blue',
        newStarSize: 'medium',
      },
      gameId: 'game01',
      version: 1,
    }

    const result = validate(game, playerId, request)

    expect(result).toBe(false)
  })

  it("should fail if it isn't player's turn", () => {
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

    const playerId = 'bar'

    const request: PlayerSetupRequest = {
      action: {
        type: 'HOMEWORLD_STAR1_SETUP',
        sequenceNo: 0,
        newStarColor: 'blue',
        newStarSize: 'medium',
      },
      gameId: 'game01',
      version: 1,
    }

    const result = validate(game, playerId, request)

    expect(result).toBe(false)
  })

  it("should fail if player's request is for another game", () => {
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

    const playerId = 'foo'

    const request: PlayerSetupRequest = {
      action: {
        type: 'HOMEWORLD_STAR1_SETUP',
        sequenceNo: 0,
        newStarColor: 'blue',
        newStarSize: 'medium',
      },
      gameId: 'game99',
      version: 1,
    }

    const result = validate(game, playerId, request)

    expect(result).toBe(false)
  })

  it('should fail if request is for another game state version', () => {
    const game: GameState = {
      board: { bank: mockBank(3), homeworlds: [], systems: [] },
      gameId: 'game01',
      playerSlots: 2,
      players: [
        { playerId: 'foo', playerName: '', status: 'PLAYING' },
        { playerId: 'bar', playerName: '', status: 'PLAYING' },
      ],
      status: 'SETUP1',
      version: 5,
      turnOf: 'foo',
    }

    const playerId = 'foo'

    const request: PlayerSetupRequest = {
      action: {
        type: 'HOMEWORLD_STAR1_SETUP',
        sequenceNo: 0,
        newStarColor: 'blue',
        newStarSize: 'medium',
      },
      gameId: 'game01',
      version: 4,
    }

    const result = validate(game, playerId, request)

    expect(result).toBe(false)
  })

  it('should fail if game is in stage 2 and request is for stage 1', () => {
    const game: GameState = {
      board: {
        bank: mockBank(3),
        homeworlds: [
          {
            playerId: 'foo',
            systemId: '10',
            stars: [{ starId: 'star10', color: 'red', size: 'large' }],
            ships: [],
          },
          {
            playerId: 'bar',
            systemId: '20',
            stars: [{ starId: 'star20', color: 'green', size: 'small' }],
            ships: [],
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

    const playerId = 'foo'

    const request: PlayerSetupRequest = {
      action: {
        type: 'HOMEWORLD_STAR1_SETUP',
        sequenceNo: 0,
        newStarColor: 'blue',
        newStarSize: 'medium',
      },
      gameId: 'game01',
      version: 1,
    }

    const result = validate(game, playerId, request)

    expect(result).toBe(false)
  })
})
