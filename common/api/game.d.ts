import { SocketAck } from './common'

export type TokenColor = 'red' | 'yellow' | 'green' | 'blue'

export type TokenSize = 'small' | 'medium' | 'large'

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
  systemId: string
}

type Star = {
  starId: string
  color: TokenColor
  size: TokenSize
}

type StarSystem = {
  systemId: string
  star: Star
  ships: Ship[]
}

type HomeworldSystem = {
  systemId: string
  playerId: string
  stars: Star[]
  ships: Ship[]
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
  sequenceNo: number
  type: string
}

export interface HomeworldStar1SetupAction extends AbstractPlayerAction {
  type: 'HOMEWORLD_STAR1_SETUP'
  newStarColor: TokenColor
  newStarSize: TokenSize
}

export interface HomeworldStar2SetupAction extends AbstractPlayerAction {
  type: 'HOMEWORLD_STAR2_SETUP'
  newStarColor: TokenColor
  newStarSize: TokenSize
}

export interface HomeworldShipSetupAction extends AbstractPlayerAction {
  type: 'HOMEWORLD_SHIP_SETUP'
  newShipColor: TokenColor
  newShipSize: TokenSize
}

export interface CatastropheAction extends AbstractPlayerAction {
  type: 'CATASTROPHE'
  systemId: string
  color: TokenColor
}

export interface SacrificeAction extends AbstractPlayerAction {
  type: 'SACRIFICE'
  shipId: string
}

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

export interface YellowAction extends AbstractNormalAction {
  color: 'yellow'
  newShipColor: TokenColor
  newShipSize: TokenSize
}

export interface GreenAction extends AbstractNormalAction {
  color: 'green'
  oldShipId: string
  newShipColor: string
}

interface AbstractBlueAction extends AbstractNormalAction {
  color: 'blue'
  shipId: string
  isExplore: boolean
  isTransit: boolean
}

interface BlueTransitAction extends AbstractBlueAction {
  isExplore: false
  isTransit: true
  /**
   * ID of StarSystem the ship is transiting to
   */
  transitTo: string
}

interface BlueExploreAction extends AbstractBlueAction {
  isExplore: true
  isTransit: false
  newStarColor: TokenColor
  newStarSize: TokenSize
}

export type SetupAction =
  | HomeworldStar1SetupAction
  | HomeworldStar2SetupAction
  | HomeworldShipSetupAction

export type PlayerAction =
  | CatastropheAction
  | SacrificeAction
  | RedAction
  | YellowAction
  | GreenAction
  | BlueExploreAction
  | BlueTransitAction

type PlayerSetupRequest = {
  gameId: string
  version: number
  action: SetupAction
}

type PlayerActionRequest = {
  gameId: string
  version: number
  actions: PlayerAction[]
}

interface HomeworldStar1SetupEffect extends HomeworldStar1SetupAction {
  newHomeSystemId: string
  newStarId: string
}

interface HomeworldStar2SetupEffect extends HomeworldStar2SetupAction {
  homeSystemId: string
  newStarId: string
}

interface HomeworldShipSetupEffect extends HomeworldShipSetupAction {
  homeSystemId: string
  newShipId: string
}

type RedEffect = RedAction

interface YellowEffect extends YellowAction {
  newShipId: string
}

interface GreenEffect extends GreenAction {
  newShipId: string
}

type BlueTransitEffect = BlueTransitAction

interface BlueExploreEffect extends BlueExploreAction {
  newSystemId: string
  newStarId: string
}

type PlayerEffect =
  | HomeworldStar1SetupEffect
  | HomeworldStar2SetupEffect
  | HomeworldShipSetupEffect
  | RedEffect
  | YellowEffect
  | GreenEffect
  | BlueExploreEffect
  | BlueTransitEffect

export type GameState = {
  gameId: string
  version: number
  status: GameStatus
  playerSlots: number
  players: PlayerDetails[]
  board: Board
  turnOf: string
}

type GameStateUpdate = GameState & {
  previousBoard: Board
  previousTurnOf: string
  previousTurnEffects: PlayerEffect[]
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
  action: PlayerSetupRequest,
  cb: SocketAck<boolean>
) => void

export type ctosCommitGameAction = (
  action: PlayerActionRequest,
  cb: SocketAck<boolean>
) => void

export type ctosLeaveGame = (gameId: string, cb: SocketAck<boolean>) => void

export type stocUpdateGames = (games: any[]) => void

export type stocUpdateGameState = (gameState: GameStateUpdate) => void
