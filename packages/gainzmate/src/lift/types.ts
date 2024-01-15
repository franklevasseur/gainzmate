import { z } from 'zod'
import * as date from './date'

export const liftNameSchema = z.union([z.literal('pronation'), z.literal('riser'), z.literal('hammer')])
export const liftSideSchema = z.union([z.literal('left'), z.literal('right')])
export const liftSchema = z.object({
  name: liftNameSchema,
  side: liftSideSchema,
  weight: z.number(),
  sets: z.number(),
  reps: z.number(),
  notes: z.string(),
})

export type Lift = z.infer<typeof liftSchema>
export type LiftEvent = Lift & { date: date.Date }
