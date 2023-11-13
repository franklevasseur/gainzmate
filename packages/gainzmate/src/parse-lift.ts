import { z } from 'zod'

export const liftSchema = z.object({
  name: z.string(),
  side: z.string(),
  weight: z.number(),
  sets: z.number(),
  reps: z.number(),
  notes: z.string(),
})

export type Lift = z.infer<typeof liftSchema>
export type LiftEvent = Lift & { date: Date }

export const parseLift = (_text: string): Partial<Lift> => {
  return {}
}

export const formatLift = (lift: Lift): string =>
  `${lift.name} ${lift.side} ${lift.weight}lbs ${lift.sets}x${lift.reps}`

export const formatLiftEvent = (lift: LiftEvent): string => {
  const date = lift.date.toISOString().split('T')[0]
  return `${date} ${formatLift(lift)}`
}
