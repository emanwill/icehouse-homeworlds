import { TokenBank, TokenSize } from '@icehouse-homeworlds/api/game'

export default function mockBank(units: number): TokenBank {
  const sizes = (): { [S in TokenSize]: number } => ({
    small: units,
    medium: units,
    large: units,
  })

  return {
    red: sizes(),
    yellow: sizes(),
    green: sizes(),
    blue: sizes(),
  }
}
