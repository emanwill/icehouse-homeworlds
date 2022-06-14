import { SocketAck, TupleToUnion } from './common'

export type TokenColorTuple = ['red', 'yellow', 'green', 'blue']
export type TokenColor = TupleToUnion<TokenColorTuple>

export type TokenSizeTuple = ['small', 'medium', 'large']
export type TokenSize = TupleToUnion<TokenSizeTuple>

export type GameStatus =
  | 'AWAIT_PLAYERS'
  | 'SETUP1'
  | 'SETUP2'
  | 'SETUP3'
  | 'PLAY'
  | 'END'
  | 'ERROR'

export type PlayerStatus = 'PLAYING' | 'WON' | 'LOST' | 'FORFEITED' | 'LEFT'

type TokenBank = { [C in TokenColor]: { [S in TokenSize]: number } }

type Ship = {
  shipId: string
  color: TokenColor
  size: TokenSize
  playerId: string
}

type Star = {
  starId: string
  color: TokenColor
  size: TokenSize
}

interface AbstractSystem {
  systemId: string
  isHomeworld: boolean
  ships: Ship[]
}

interface StarSystem extends AbstractSystem {
  isHomeworld: false
  star: Star
}

interface HomeworldSystem extends AbstractSystem {
  isHomeworld: true
  playerId: string
  stars: Star[]
}

type Board = {
  bank: TokenBank
  homeworlds: HomeworldSystem[]
  systems: StarSystem[]
}

type PlayerDetails = {
  playerId: string
  playerName: string
  status: PlayerStatus
}

interface AbstractPlayerAction {
  type: string
}

export interface EndTurnAction extends AbstractPlayerAction {
  type: 'END_TURN'
}

export type EndTurnEffect = EndTurnAction

export interface HomeworldStar1SetupAction extends AbstractPlayerAction {
  type: 'HOMEWORLD_STAR1_SETUP'
  newStarColor: TokenColor
  newStarSize: TokenSize
}

export interface HomeworldStar1SetupEffect extends HomeworldStar1SetupAction {
  newHomeSystemId: string
  newStarId: string
}

export interface HomeworldStar2SetupAction extends AbstractPlayerAction {
  type: 'HOMEWORLD_STAR2_SETUP'
  newStarColor: TokenColor
  newStarSize: TokenSize
}

export interface HomeworldStar2SetupEffect extends HomeworldStar2SetupAction {
  homeSystemId: string
  newStarId: string
}

export interface HomeworldShipSetupAction extends AbstractPlayerAction {
  type: 'HOMEWORLD_SHIP_SETUP'
  newShipColor: TokenColor
  newShipSize: TokenSize
}

export interface HomeworldShipSetupEffect extends HomeworldShipSetupAction {
  homeSystemId: string
  newShipId: string
}

export interface CatastropheAction extends AbstractPlayerAction {
  type: 'CATASTROPHE'
  systemId: string
  color: TokenColor
}

export type CatastropheEffect = CatastropheAction

export interface SacrificeAction extends AbstractPlayerAction {
  type: 'SACRIFICE'
  systemId: string
  shipId: string
}

export type SacrificeEffect = SacrificeAction

interface AbstractNormalAction extends AbstractPlayerAction {
  type: 'NORMAL'
  systemId: string
  color: TokenColor
}

export interface RedAction extends AbstractNormalAction {
  color: 'red'
  attackerShipId: string
  victimShipId: string
}

export type RedEffect = RedAction

export interface YellowAction extends AbstractNormalAction {
  color: 'yellow'
  newShipColor: TokenColor
  newShipSize: TokenSize
}

export interface YellowEffect extends YellowAction {
  newShipId: string
}

export interface GreenAction extends AbstractNormalAction {
  color: 'green'
  oldShipId: string
  newShipColor: TokenColor
}

export interface GreenEffect extends GreenAction {
  newShipId: string
}

interface AbstractBlueAction extends AbstractNormalAction {
  color: 'blue'
  shipId: string
  isExplore: boolean
  isTransit: boolean
}

export interface BlueTransitAction extends AbstractBlueAction {
  isExplore: false
  isTransit: true
  /**
   * ID of StarSystem the ship is transiting to
   */
  transitTo: string
}

export type BlueTransitEffect = BlueTransitAction

export interface BlueExploreAction extends AbstractBlueAction {
  isExplore: true
  isTransit: false
  newStarColor: TokenColor
  newStarSize: TokenSize
}

export interface BlueExploreEffect extends BlueExploreAction {
  newSystemId: string
  newStarId: string
}

export type SetupAction =
  | HomeworldStar1SetupAction
  | HomeworldStar2SetupAction
  | HomeworldShipSetupAction

export type SetupEffect =
  | HomeworldStar1SetupEffect
  | HomeworldStar2SetupEffect
  | HomeworldShipSetupEffect

export type GameplayAction =
  | CatastropheAction
  | SacrificeAction
  | NormalAction
  | EndTurnAction

export type GameplayEffect =
  | CatastropheEffect
  | SacrificeEffect
  | NormalEffect
  | EndTurnEffect

export type NormalAction =
  | RedAction
  | YellowAction
  | GreenAction
  | BlueExploreAction
  | BlueTransitAction

export type NormalEffect =
  | RedEffect
  | YellowEffect
  | GreenEffect
  | BlueExploreEffect
  | BlueTransitEffect

type PlayerSetupPayload = {
  gameId: string
  actions: SetupAction[]
}

type PlayerGameplayPayload = {
  gameId: string
  actions: GameplayAction[]
}

export type GameState = {
  gameId: string
  version: number
  status: GameStatus
  playerSlots: number
  players: PlayerDetails[]
  board: Board
  turnOf: string
  sacrificePlay?: {
    color: TokenColor
    actionsRemaining: number
  }
}

type GameStateUpdate = GameState & {
  previousBoard: Board
  previousTurnOf: string
  previousTurnEffects: (SetupEffect | GameplayEffect)[]
}

type GameSummary = {
  gameId: string
  status: GameStatus
  createdById: string
  createdByName: string
  playerSlots: number
  playerSlotsFilled: number
}

type CreateGameOptions = {
  playerSlots: number
}

export type ctosGetGames = (cb: SocketAck<GameSummary[]>) => void

export type ctosCreateGame = (
  options: CreateGameOptions,
  cb: SocketAck<GameState>
) => void

export type ctosJoinGame = (gameId: string, cb: SocketAck<GameState>) => void

export type ctosBeginGame = (gameId: string, cb: SocketAck<GameState>) => void

export type ctosCommitSetupAction = (
  action: PlayerSetupPayload,
  cb: SocketAck<boolean>
) => void

export type ctosCommitGameAction = (
  action: PlayerGameplayPayload,
  cb: SocketAck<boolean>
) => void

export type ctosLeaveGame = (gameId: string) => void

export type stocUpdateGames = (games: GameSummary[]) => void

export type stocUpdateGameState = (gameState: GameStateUpdate) => void
