import * as dallox from 'dallox'
import { ApiUtils } from '../api-utils'
import { Bot } from '../bot'
import { z } from 'zod'

const liftName = z.union([z.literal('pronation'), z.literal('riser')])
const liftSide = z.union([z.literal('left'), z.literal('right')])
const liftWeight = z.number()
const liftReps = z.number()
const liftNotes = z.string()

export const definitions = {
  new_entry: z.object({
    arg: z.string(),
  }),
  prompt_name_question: z.object({
    name: liftName.optional(),
    side: liftSide.optional(),
    weight: liftWeight.optional(),
    reps: liftReps.optional(),
    notes: liftNotes.optional(),
  }),
  prompt_name_validation: z.object({
    name: liftName.optional(),
    side: liftSide.optional(),
    weight: liftWeight.optional(),
    reps: liftReps.optional(),
    notes: liftNotes.optional(),
  }),
  prompt_side_question: z.object({
    name: liftName,
    side: liftSide.optional(),
    weight: liftWeight.optional(),
    reps: liftReps.optional(),
    notes: liftNotes.optional(),
  }),
  prompt_side_validation: z.object({
    name: liftName,
    side: liftSide.optional(),
    weight: liftWeight.optional(),
    reps: liftReps.optional(),
    notes: liftNotes.optional(),
  }),
  prompt_weight_question: z.object({
    name: liftName,
    side: liftSide,
    weight: liftWeight.optional(),
    reps: liftReps.optional(),
    notes: liftNotes.optional(),
  }),
  prompt_weight_validation: z.object({
    name: liftName,
    side: liftSide,
    weight: liftWeight.optional(),
    reps: liftReps.optional(),
    notes: liftNotes.optional(),
  }),
  prompt_reps_question: z.object({
    name: liftName,
    side: liftSide,
    weight: liftWeight,
    reps: liftReps.optional(),
    notes: liftNotes.optional(),
  }),
  prompt_reps_validation: z.object({
    name: liftName,
    side: liftSide,
    weight: liftWeight,
    reps: liftReps.optional(),
    notes: liftNotes.optional(),
  }),
  prompt_notes_question: z.object({
    name: liftName,
    side: liftSide,
    weight: liftWeight,
    reps: liftReps,
    notes: liftNotes.optional(),
  }),
  prompt_notes_validation: z.object({
    name: liftName,
    side: liftSide,
    weight: liftWeight,
    reps: liftReps,
    notes: liftNotes.optional(),
  }),
} satisfies dallox.FlowDefinition

export const implementations = {
  new_entry: async () => {
    // TODO: try to parse the arg
    return {
      transition: 'hold',
      next: 'prompt_name_question',
      data: {},
    }
  },
  prompt_name_question: async (props) => {
    if (props.data.name) {
      return {
        transition: 'hold',
        next: 'prompt_side_question',
        data: {
          ...props.data,
          name: props.data.name,
        },
      }
    }

    const api = new ApiUtils(props)
    await api.choice('What lift did you do?', ['pronation', 'riser'])
    return {
      transition: 'yield',
      next: 'prompt_name_validation',
      data: {},
    }
  },
  prompt_name_validation: async (props) => {
    const api = new ApiUtils(props)
    const { message } = props
    const name = message.payload.text as string
    if (!name) {
      await api.respond('Please enter a name.')
      return {
        transition: 'hold',
        next: 'prompt_name_question',
        data: {},
      }
    }

    const parseResult = liftName.safeParse(name)
    if (!parseResult.success) {
      await api.respond('Please enter a valid lift name.')
      return {
        transition: 'hold',
        next: 'prompt_name_question',
        data: {},
      }
    }

    return {
      transition: 'hold',
      next: 'prompt_side_question',
      data: {
        name: parseResult.data,
      },
    }
  },
  prompt_side_question: async (props) => {
    if (props.data.side) {
      return {
        transition: 'hold',
        next: 'prompt_weight_question',
        data: {
          ...props.data,
          side: props.data.side,
        },
      }
    }

    const api = new ApiUtils(props)
    await api.choice('What side did you do?', ['left', 'right'])
    return {
      transition: 'yield',
      next: 'prompt_side_validation',
      data: {
        ...props.data,
      },
    }
  },
  prompt_side_validation: async (props) => {
    const api = new ApiUtils(props)
    const { message } = props
    const side = message.payload.text as string
    if (!side) {
      await api.respond('Please enter a side.')
      return {
        transition: 'hold',
        next: 'prompt_side_question',
        data: {
          ...props.data,
        },
      }
    }

    const parseResult = liftSide.safeParse(side)
    if (!parseResult.success) {
      await api.respond('Please enter a valid side.')
      return {
        transition: 'hold',
        next: 'prompt_side_question',
        data: {
          ...props.data,
        },
      }
    }

    return {
      transition: 'hold',
      next: 'prompt_weight_question',
      data: {
        ...props.data,
        side: parseResult.data,
      },
    }
  },
  prompt_weight_question: async (props) => {
    if (props.data.weight) {
      return {
        transition: 'hold',
        next: 'prompt_reps_question',
        data: {
          ...props.data,
          weight: props.data.weight,
        },
      }
    }

    const api = new ApiUtils(props)
    await api.respond('How much weight did you do?')
    return {
      transition: 'yield',
      next: 'prompt_weight_validation',
      data: {
        ...props.data,
      },
    }
  },
  prompt_weight_validation: async (props) => {
    const api = new ApiUtils(props)
    const { message } = props
    const weight = message.payload.text as string

    if (!weight) {
      await api.respond('Please enter a weight in lbs.')
      return {
        transition: 'hold',
        next: 'prompt_weight_question',
        data: {
          ...props.data,
        },
      }
    }

    const parseResult = liftWeight.safeParse(weight)

    if (!parseResult.success) {
      await api.respond('Please enter a valid weight in lbs.')
      return {
        transition: 'hold',
        next: 'prompt_weight_question',
        data: {
          ...props.data,
        },
      }
    }

    return {
      transition: 'hold',
      next: 'prompt_reps_question',
      data: {
        ...props.data,
        weight: parseResult.data,
      },
    }
  },
  prompt_reps_question: async (props) => {
    if (props.data.reps) {
      return {
        transition: 'hold',
        next: 'prompt_notes_question',
        data: {
          ...props.data,
          reps: props.data.reps,
        },
      }
    }

    const api = new ApiUtils(props)
    await api.respond('How many reps did you do?')
    return {
      transition: 'yield',
      next: 'prompt_reps_validation',
      data: {
        ...props.data,
      },
    }
  },
  prompt_reps_validation: async (props) => {
    const api = new ApiUtils(props)
    const { message } = props
    const reps = message.payload.text as string

    if (!reps) {
      await api.respond('Please enter a number of reps.')
      return {
        transition: 'hold',
        next: 'prompt_reps_question',
        data: {
          ...props.data,
        },
      }
    }

    const parseResult = liftReps.safeParse(reps)

    if (!parseResult.success) {
      await api.respond('Please enter a valid number of reps.')
      return {
        transition: 'hold',
        next: 'prompt_reps_question',
        data: {
          ...props.data,
        },
      }
    }

    return {
      transition: 'hold',
      next: 'prompt_notes_question',
      data: {
        ...props.data,
        reps: parseResult.data,
      },
    }
  },
  prompt_notes_question: async (props) => {
    if (props.data.notes) {
      return null
    }

    const api = new ApiUtils(props)
    await api.respond('Any notes?')
    return {
      transition: 'yield',
      next: 'prompt_notes_validation',
      data: {
        ...props.data,
      },
    }
  },
  prompt_notes_validation: async (props) => {
    const api = new ApiUtils(props)
    const { message } = props
    const notes = message.payload.text as string
    return null
  },
} satisfies dallox.FlowImplementation<Bot, typeof definitions>
