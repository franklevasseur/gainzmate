import { Lift, LiftEvent } from './types'

export const formatLift = (lift: Lift): string =>
  `${lift.name} ${lift.side} ${lift.weight}lbs ${lift.sets}x${lift.reps}`

export const formatLiftEvent = (lift: LiftEvent): string => {
  return `${lift.date.format()}    ${formatLift(lift)}`
}
