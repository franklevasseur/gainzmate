import { z } from '@botpress/sdk'
import * as date from './datetime'
import * as entities from './entities'

export const liftSchema = z.object({
  name: entities.liftNameSchema,
  side: entities.liftSideSchema,
  weight: z.number(),
  sets: z.number(),
  reps: z.number(),
  notes: z.string(),
})

export type Lift = z.infer<typeof liftSchema>
export type LiftEvent = Lift & { date: date.DateTime }
