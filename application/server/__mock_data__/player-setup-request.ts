import {
  HomeworldStar1SetupAction,
  HomeworldStar2SetupAction,
  HomeworldShipSetupAction,
} from '@icehouse-homeworlds/api/game'

export function Star1SetupAction(): HomeworldStar1SetupAction {
  return {
    type: 'HOMEWORLD_STAR1_SETUP',
    newStarColor: 'blue',
    newStarSize: 'large',
    sequenceNo: 1,
  }
}

export function Star2SetupAction(): HomeworldStar2SetupAction {
  return {
    type: 'HOMEWORLD_STAR2_SETUP',
    newStarColor: 'blue',
    newStarSize: 'large',
    sequenceNo: 1,
  }
}

export function ShipSetupAction(): HomeworldShipSetupAction {
  return {
    type: 'HOMEWORLD_SHIP_SETUP',
    newShipColor: 'blue',
    newShipSize: 'large',
    sequenceNo: 1,
  }
}
