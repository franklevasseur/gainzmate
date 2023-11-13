import { flow, Flow } from 'src/bot'
import { z } from 'zod'
import { formatLift, liftSchema, parseLift } from '../parse-lift'
import { Telegram } from 'src/integrations/telegram'
import * as bp from '.botpress'
import yn from 'yn'

type _Messages = bp.telegram.channels.channel.Messages
type Messages = {
  [T in keyof _Messages]: {
    type: T
    payload: _Messages[T]
  }
}
const textMessage = (text: string): Messages['text'] => ({ type: 'text', payload: { text } })
const choiceMessage = (text: string, choices: string[]): Messages['choice'] => ({
  type: 'choice',
  payload: { text, options: choices.map((choice) => ({ value: choice, label: choice })) },
})

const promptNameInput = liftSchema.partial()
const promptSideInput = promptNameInput.extend({ name: z.string() })
const promptWeightInput = promptSideInput.extend({ side: z.string() })
const promptSetsInput = promptWeightInput.extend({ weight: z.number() })
const promptRepsInput = promptSetsInput.extend({ sets: z.number() })
const promptNotesInput = promptRepsInput.extend({ reps: z.number() })

const promptNameQuestion: Messages['choice'] = choiceMessage('What lift ?', ['pronation', 'rise'])
const promptSideQuestion: Messages['choice'] = choiceMessage('What side ?', ['left', 'right'])
const promptWeightQuestion: Messages['text'] = textMessage('What weight (in lbs) ?')
const promptSetsQuestion: Messages['text'] = textMessage('How many sets ?')
const promptRepsQuestion: Messages['text'] = textMessage('How many reps ?')
const promptNotesQuestion: Messages['text'] = textMessage('Anything else to add ?')

const next = (flow: Flow, data: z.infer<typeof promptNameInput>) => {
  const { name, side, weight, sets, reps, notes } = data
  if (name === undefined) {
    return flow.transition(promptName, data)
  }
  if (side === undefined) {
    return flow.transition(promptSide, { ...data, name })
  }
  if (weight === undefined) {
    return flow.transition(promptWeight, { ...data, name, side })
  }
  if (sets === undefined) {
    return flow.transition(promptSets, { ...data, name, side, weight })
  }
  if (reps === undefined) {
    return flow.transition(promptReps, { ...data, name, side, sets, weight })
  }
  if (notes === undefined) {
    return flow.transition(promptNotes, { ...data, name, side, sets, weight, reps })
  }
  return flow.transition(confirmLift, { ...data, name, side, sets, weight, reps, notes })
}

export const newCommand = flow
  .declareNode({ id: 'new_command', schema: z.object({ argument: z.string() }) })
  .execute(async (props) => {
    const { argument } = props.data
    const parsedLift = parseLift(argument)
    return next(flow, parsedLift)
  })

const promptName = flow
  .declareNode({ id: 'prompt_name', schema: promptNameInput })
  .prompt(promptNameQuestion, async (props) => {
    const text = props.message.payload.text as string
    if (!text) {
      await Telegram.from(props).respondText('Please enter a valid lift name.')
      return flow.transition(promptName, props.data)
    }
    return next(flow, { ...props.data, name: text })
  })

const promptSide = flow
  .declareNode({ id: 'prompt_side', schema: promptSideInput })
  .prompt(promptSideQuestion, async (props) => {
    const text = props.message.payload.text as string
    if (!text) {
      await Telegram.from(props).respondText('Please enter a valid side.')
      return flow.transition(promptSide, props.data)
    }
    return next(flow, { ...props.data, side: text })
  })

const promptWeight = flow
  .declareNode({ id: 'prompt_weight', schema: promptWeightInput })
  .prompt(promptWeightQuestion, async (props) => {
    const text = props.message.payload.text as string
    const weight = Number(text)
    if (!text || isNaN(weight)) {
      await Telegram.from(props).respondText('Please enter a valid weight.')
      return flow.transition(promptWeight, props.data)
    }
    return next(flow, { ...props.data, weight })
  })

const promptSets = flow
  .declareNode({ id: 'prompt_sets', schema: promptSetsInput })
  .prompt(promptSetsQuestion, async (props) => {
    const text = props.message.payload.text as string
    const sets = Number(text)
    if (!text || isNaN(sets)) {
      await Telegram.from(props).respondText('Please enter a valid number of sets.')
      return flow.transition(promptSets, props.data)
    }
    return next(flow, { ...props.data, sets })
  })

const promptReps = flow
  .declareNode({ id: 'prompt_reps', schema: promptRepsInput })
  .prompt(promptRepsQuestion, async (props) => {
    const text = props.message.payload.text as string
    const reps = Number(text)
    if (!text || isNaN(reps)) {
      await Telegram.from(props).respondText('Please enter a valid number of reps.')
      return flow.transition(promptReps, props.data)
    }
    return next(flow, { ...props.data, reps })
  })

const promptNotes = flow
  .declareNode({ id: 'prompt_notes', schema: promptNotesInput })
  .prompt(promptNotesQuestion, async (props) => {
    const text = props.message.payload.text as string
    return next(flow, { ...props.data, notes: text })
  })

const confirmLift = flow.declareNode({ id: 'confirmLift', schema: liftSchema }).prompt(
  ({ data }) => choiceMessage(`Confirm lift: "${formatLift(data)}"`, ['yes', 'no']),
  async (props) => {
    const text = props.message.payload.text as string
    const confirmed = yn(text)
    if (confirmed) {
      return flow.transition(saveLift, props.data)
    } else {
      await Telegram.from(props).respondText('Lift entry cancelled.')
      return null
    }
  }
)

const saveLift = flow.declareNode({ id: 'saveLift', schema: liftSchema }).execute(async (props) => {
  Telegram.from(props).respondText(`Saving lift...`)
  return null
})
