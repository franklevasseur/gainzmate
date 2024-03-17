import { z } from 'zod'
import * as date from './date'
import { LiftName } from './parser'

export const liftNameSchema = z.union([
  z.literal('pronation'),
  z.literal('riser'),
  z.literal('hammer'),
  z.literal('hook'),
])

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

type Equals<T, U> = T extends U ? (U extends T ? true : false) : false
type Expect<C extends true> = C

type Actual = Record<z.infer<typeof liftNameSchema>, null>
type Expected = Record<LiftName, null>
type _LiftsAreAllConsidered = Expect<Equals<Actual, Expected>>
