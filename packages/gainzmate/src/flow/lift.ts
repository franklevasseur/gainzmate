import * as bpentities from '@bpinternal/entities'
import * as msentities from '@microsoft/recognizers-text-suite'
import { z } from 'zod'

export type Lift = {
  name: string
  side: string
  weight: number
  sets: number
  reps: number
  notes: string
}

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

type ListEntity = bpentities.Entity
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

const mapToBp = (entities: MsEntity[]): ListEntity[] => {
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

export const parseLift = (text: string): Partial<Lift> => {
  const listEntities = listExtractor.extract(text)
  const msEntities = mapToBp(msExtractor(text))

  let entities = [...listEntities, ...msEntities]

  const nameEntity: ListEntity | undefined = listEntities.find((e) => e.name === 'lift')
  let name: Lift['name'] | undefined = undefined
  if (nameEntity) {
    name = nameEntity.value
    entities = entities.filter(isOut(nameEntity))
  }

  const sideEntity: ListEntity | undefined = listEntities.find((e) => e.name === 'side')
  let side: Lift['side'] | undefined = undefined
  if (sideEntity) {
    side = sideEntity.value
    entities = entities.filter(isOut(sideEntity))
  }

  const weightEntity: ListEntity | undefined = entities.find((e) => e.name === 'dimension')
  let weight: Lift['weight'] | undefined = undefined
  if (weightEntity) {
    weight = Number(weightEntity.value)
    entities = entities.filter(isOut(weightEntity))
  }

  const sets = 1 // TODO: extract sets with regex /[1-9][0-9]?x[1-9][0-9]?/ (e.g. 5x5 or 3x10)

  const repsEntity: ListEntity | undefined = entities.find((e) => e.name === 'number')
  let reps: Lift['reps'] | undefined = undefined
  if (repsEntity) {
    reps = Number(repsEntity.value)
    entities = entities.filter(isOut(repsEntity))
  }

  return {
    name,
    side,
    weight,
    sets,
    reps,
    notes: text,
  }
}
