import { z } from '@botpress/sdk'
import { flow, Flow } from 'src/bot'
import { Gsheets } from 'src/integrations/gsheets'
import { Telegram } from 'src/integrations/telegram'
import yn from 'yn'
import { formatLift, liftNameSchema, liftSideSchema, liftSchema, parseLift, liftEntity, sideEntity } from '../lift'
import * as bp from '.botpress'

type _Messages = bp.integrations.telegram.channels.channel.Messages
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

const promptNameInput = liftSchema.partial().extend({ notes: z.string() })
const promptSideInput = promptNameInput.extend({ name: liftNameSchema })
const promptWeightInput = promptSideInput.extend({ side: liftSideSchema })
const promptSetsInput = promptWeightInput.extend({ weight: z.number() })
const promptRepsInput = promptSetsInput.extend({ sets: z.number() })

const liftChoices = liftEntity.values.map((e) => e.name)
const sideChoices = sideEntity.values.map((e) => e.name)
const promptNameQuestion: Messages['choice'] = choiceMessage('What lift ?', liftChoices)
const promptSideQuestion: Messages['choice'] = choiceMessage('What side ?', sideChoices)
const promptWeightQuestion: Messages['text'] = textMessage('What weight (in lbs) ?')
const promptSetsQuestion: Messages['text'] = textMessage('How many sets ?')
const promptRepsQuestion: Messages['text'] = textMessage('How many reps ?')

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
  return flow.transition(confirmLift, { ...data, name, side, sets, weight, reps, notes })
}

export const newCommand = flow
  .declareNode({ id: 'new_command', schema: z.object({ argument: z.string() }) })
  .execute(async (props) => {
    const { argument } = props.data
    const parsedLift = parseLift(argument)
    const { notes } = parsedLift
    return next(flow, { ...parsedLift, notes: notes ?? '' })
  })

const promptName = flow
  .declareNode({ id: 'prompt_name', schema: promptNameInput })
  .prompt(promptNameQuestion, async (props) => {
    if (props.message.type !== 'text') {
      await Telegram.from(props).respondText('Please enter a valid lift name.')
      return flow.transition(promptName, props.data)
    }
    const { text } = props.message.payload
    const parseResult = liftNameSchema.safeParse(text)
    if (!parseResult.success) {
      await Telegram.from(props).respondText('Please enter a valid lift name.')
      return flow.transition(promptName, props.data)
    }
    const name = parseResult.data
    return next(flow, { ...props.data, name })
  })

const promptSide = flow
  .declareNode({ id: 'prompt_side', schema: promptSideInput })
  .prompt(promptSideQuestion, async (props) => {
    if (props.message.type !== 'text') {
      await Telegram.from(props).respondText('Please enter a valid side.')
      return flow.transition(promptSide, props.data)
    }
    const { text } = props.message.payload
    const parseResult = liftSideSchema.safeParse(text)
    if (!parseResult.success) {
      await Telegram.from(props).respondText('Please enter a valid side.')
      return flow.transition(promptSide, props.data)
    }
    const side = parseResult.data
    return next(flow, { ...props.data, side })
  })

const promptWeight = flow
  .declareNode({ id: 'prompt_weight', schema: promptWeightInput })
  .prompt(promptWeightQuestion, async (props) => {
    if (props.message.type !== 'text') {
      await Telegram.from(props).respondText('Please enter a valid weight.')
      return flow.transition(promptWeight, props.data)
    }
    const { text } = props.message.payload
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
    if (props.message.type !== 'text') {
      await Telegram.from(props).respondText('Please enter a valid number of sets.')
      return flow.transition(promptSets, props.data)
    }
    const { text } = props.message.payload
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
    if (props.message.type !== 'text') {
      await Telegram.from(props).respondText('Please enter a valid number of reps.')
      return flow.transition(promptReps, props.data)
    }
    const { text } = props.message.payload
    const reps = Number(text)
    if (!text || isNaN(reps)) {
      await Telegram.from(props).respondText('Please enter a valid number of reps.')
      return flow.transition(promptReps, props.data)
    }
    return next(flow, { ...props.data, reps })
  })

const confirmLift = flow.declareNode({ id: 'confirmLift', schema: liftSchema }).prompt(
  ({ data }) => choiceMessage(`Confirm lift: "${formatLift(data)}"`, ['yes', 'no']),
  async (props) => {
    if (props.message.type !== 'text') {
      await Telegram.from(props).respondText('Please enter "yes" or "no".')
      return flow.transition(confirmLift, props.data)
    }
    const { text } = props.message.payload
    const confirmed = yn(text)
    if (confirmed) {
      return flow.transition(saveLift, props.data)
    } else {
      await Telegram.from(props).respondText('Lift entry cancelled.')
      return null
    }
  },
)

const saveLift = flow.declareNode({ id: 'saveLift', schema: liftSchema }).execute(async (props) => {
  await Telegram.from(props).respondText('Saving lift...')
  await Gsheets.from(props).appendLift(props.data)
  await Telegram.from(props).respondText('Done!')
  return null
})
