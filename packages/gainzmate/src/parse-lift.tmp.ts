import * as bpentities from '@bpinternal/entities'
import * as msentities from '@microsoft/recognizers-text-suite'
import { z } from 'zod'

/**
 * TODO: this file cannot be bundled in the bot, everything crashes...
 * Probably because of the @microsoft/recognizers-text-suite dependency
 */

const listDefinitions: bpentities.lists.ListEntityDef[] = [
  {
    name: 'lift',
    fuzzy: 'medium',
    values: [
      {
        name: 'pronation',
        synonyms: ['pronation'],
      },
      {
        name: 'riser',
        synonyms: ['riser', 'rise', 'elevation', 'wrist elevation'],
      },
    ],
  },
  {
    name: 'side',
    fuzzy: 'medium',
    values: [
      {
        name: 'left',
        synonyms: ['left', 'gauche'],
      },
      {
        name: 'right',
        synonyms: ['right', 'droite'],
      },
    ],
  },
]
const listExtractor = new bpentities.lists.ListEntityExtractor(listDefinitions)

const patternDefinitions: bpentities.patterns.PatternEntityDef[] = [
  {
    name: 'sets_reps',
    pattern: '[1-9][0-9]?x[1-9][0-9]?', // e.g. 5x5 or 3x10
  },
  {
    name: 'notes',
    pattern: '\\(.*?\\)', // e.g. (this was too heavy)
  },
]
const patternExtractor = new bpentities.patterns.PatternEntityExtractor(patternDefinitions)

type BpEntity = bpentities.Entity
type MsEntity = ReturnType<typeof msModels[number]>[number]

const msModels = [msentities.recognizeDimension, msentities.recognizeNumber]
const msExtractor = (text: string) => {
  const allEntities: MsEntity[] = []
  for (const model of msModels) {
    const entities = model(text, msentities.Culture.English)
    allEntities.push(...entities)
  }
  return allEntities
}

const commonMsSchema = z.object({ start: z.number(), end: z.number(), text: z.string() })
const numberSchema = commonMsSchema.extend({
  typeName: z.literal('number'),
  resolution: z.object({ value: z.string() }),
})
const dimensionSchema = commonMsSchema.extend({
  typeName: z.literal('dimension'),
  resolution: z.object({ value: z.string(), unit: z.union([z.literal('Pound'), z.literal('Kilogram')]) }),
})
const msEntitySchema = z.union([numberSchema.passthrough(), dimensionSchema.passthrough()])

const mapToBp = (entities: MsEntity[]): BpEntity[] => {
  const known: z.infer<typeof msEntitySchema>[] = []
  for (const entity of entities) {
    const parseResult = msEntitySchema.safeParse(entity)
    if (parseResult.success) {
      known.push(parseResult.data)
    }
  }
  const withNum = known.map((e) => ({ ...e, numValue: Number(e.resolution.value) })).filter((e) => !isNaN(e.numValue))
  return withNum.map((e) => {
    let num: number
    if (e.typeName === 'number') {
      num = e.numValue
    } else {
      const factor = e.resolution.unit === 'Kilogram' ? 2.2 : 1
      num = e.numValue * factor
    }
    const value = `${num}`
    return {
      name: e.typeName,
      type: 'pattern',
      charStart: e.start,
      charEnd: e.end,
      confidence: 1.0,
      source: e.text,
      value,
    }
  })
}

const isOut = (e1: bpentities.Entity) => (eX: bpentities.Entity) =>
  eX.charEnd <= e1.charStart || eX.charStart >= e1.charEnd

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

export const parseLift = (text: string): Partial<Lift> => {
  const listEntities = listExtractor.extract(text)
  const patternEntities = patternExtractor.extract(text)
  const msEntities = mapToBp(msExtractor(text))

  let entities = [...listEntities, ...patternEntities, ...msEntities]

  const nameEntity: BpEntity | undefined = listEntities.find((e) => e.name === 'lift')
  let name: Lift['name'] | undefined = undefined
  if (nameEntity) {
    name = nameEntity.value
    entities = entities.filter(isOut(nameEntity))
  }

  const sideEntity: BpEntity | undefined = listEntities.find((e) => e.name === 'side')
  let side: Lift['side'] | undefined = undefined
  if (sideEntity) {
    side = sideEntity.value
    entities = entities.filter(isOut(sideEntity))
  }

  const weightEntity: BpEntity | undefined = entities.find((e) => e.name === 'dimension')
  let weight: Lift['weight'] | undefined = undefined
  if (weightEntity) {
    weight = Number(weightEntity.value)
    entities = entities.filter(isOut(weightEntity))
  }

  const setsAndRepsEntity: BpEntity | undefined = patternEntities.find((e) => e.name === 'sets_reps')
  const repsEntity: BpEntity | undefined = entities.find((e) => e.name === 'number')

  let sets: Lift['sets'] | undefined = undefined
  let reps: Lift['reps'] | undefined = undefined
  if (setsAndRepsEntity) {
    const [setsStr, repsStr] = setsAndRepsEntity.value.split('x')
    sets = Number(setsStr)
    reps = Number(repsStr)
    entities = entities.filter(isOut(setsAndRepsEntity))
  } else if (repsEntity) {
    sets = 1
    reps = Number(repsEntity.value)
    entities = entities.filter(isOut(repsEntity))
  }

  const notesEntity: BpEntity | undefined = patternEntities.find((e) => e.name === 'notes')
  let notes: Lift['notes'] | undefined = undefined
  if (notesEntity) {
    notes = notesEntity.value
    entities = entities.filter(isOut(notesEntity))
  }

  return {
    name,
    side,
    weight,
    sets,
    reps,
    notes,
  }
}

export const formatLift = (lift: Lift): string =>
  `${lift.name} ${lift.side} ${lift.weight}lbs ${lift.sets}x${lift.reps}`

export const formatLiftEvent = (lift: LiftEvent): string => {
  const date = lift.date.toISOString().split('T')[0]
  return `${date} ${formatLift(lift)}`
}
