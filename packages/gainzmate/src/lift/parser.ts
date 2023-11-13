import * as types from './types'
import * as bpentities from '@bpinternal/entities'
import * as msentities from '@microsoft/recognizers-text-number-with-unit'
import { z } from 'zod'

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
    name: 'reps',
    pattern: '[1-9][0-9]?', // e.g. 5 or 10
  },
  {
    name: 'notes',
    pattern: '\\(.*?\\)', // e.g. (this was too heavy)
  },
]
const patternExtractor = new bpentities.patterns.PatternEntityExtractor(patternDefinitions)

type BpEntity = bpentities.Entity
type MsEntity = ReturnType<typeof msModels[number]>[number]

const msModels = [msentities.recognizeDimension]
const msExtractor = (text: string) => {
  const allEntities: MsEntity[] = []
  for (const model of msModels) {
    const entities = model(text, msentities.Culture.English)
    allEntities.push(...entities)
  }
  return allEntities
}

const msEntitySchema = z
  .object({
    start: z.number(),
    end: z.number(),
    text: z.string(),
    typeName: z.literal('dimension'),
    resolution: z.object({ value: z.string(), unit: z.union([z.literal('Pound'), z.literal('Kilogram')]) }),
  })
  .passthrough()

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
    const factor = e.resolution.unit === 'Kilogram' ? 2.2 : 1
    const num = e.numValue * factor
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

export const parseLift = (text: string): Partial<types.Lift> => {
  const listEntities = listExtractor.extract(text)
  const patternEntities = patternExtractor.extract(text)
  const msEntities = mapToBp(msExtractor(text))

  let entities = [...listEntities, ...patternEntities, ...msEntities]

  const nameEntity: BpEntity | undefined = listEntities.find((e) => e.name === 'lift')
  let name: types.Lift['name'] | undefined = undefined
  if (nameEntity) {
    name = nameEntity.value
    entities = entities.filter(isOut(nameEntity))
  }

  const sideEntity: BpEntity | undefined = listEntities.find((e) => e.name === 'side')
  let side: types.Lift['side'] | undefined = undefined
  if (sideEntity) {
    side = sideEntity.value
    entities = entities.filter(isOut(sideEntity))
  }

  const weightEntity: BpEntity | undefined = entities.find((e) => e.name === 'dimension')
  let weight: types.Lift['weight'] | undefined = undefined
  if (weightEntity) {
    weight = Number(weightEntity.value)
    entities = entities.filter(isOut(weightEntity))
  }

  const setsAndRepsEntity: BpEntity | undefined = patternEntities.find((e) => e.name === 'sets_reps')
  const repsEntity: BpEntity | undefined = entities.find((e) => e.name === 'reps')

  let sets: types.Lift['sets'] | undefined = undefined
  let reps: types.Lift['reps'] | undefined = undefined
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
  let notes: types.Lift['notes'] | undefined = undefined
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
