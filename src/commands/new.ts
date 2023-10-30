import * as types from './types'
import * as bpentities from '@bpinternal/entities'
import * as msentities from '@microsoft/recognizers-text-suite'

const definitions: bpentities.lists.ListEntityDef[] = [
  {
    name: 'lift',
    fuzzy: 'medium',
    values: [
      {
        name: 'pronation',
        synonyms: [],
      },
      {
        name: 'riser',
        synonyms: ['rise', 'elevation', 'wrist elevation'],
      },
    ],
  },
  {
    name: 'side',
    fuzzy: 'medium',
    values: [
      {
        name: 'left',
        synonyms: ['gauche'],
      },
      {
        name: 'right',
        synonyms: ['droite'],
      },
    ],
  },
]

type Lift = {
  name: string
  side: string
  weight: number
  reps: number
  notes: string
}

export const newCmd: types.Command = {
  description: 'Create a new lift record',
  handler: async ({ arg }) => {
    const bpExtractor = new bpentities.lists.ListEntityExtractor(definitions)
    // instantiate the ms extractor
  },
}
