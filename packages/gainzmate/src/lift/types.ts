import { z } from 'zod'
import * as date from './date'

export const liftSchema = z.object({
  name: z.string(),
  side: z.string(),
  weight: z.number(),
  sets: z.number(),
  reps: z.number(),
  notes: z.string(),
})

export type Lift = z.infer<typeof liftSchema>
export type LiftEvent = Lift & { date: date.Date }
