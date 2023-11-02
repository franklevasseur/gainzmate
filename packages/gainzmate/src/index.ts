import * as dallox from 'dallox'
import { bot } from './bot'
import { z } from 'zod'
import { Api } from './api-utils'

const flow = new dallox.Flow(bot, {
  get: async (props) =>
    props.client
      .getState({ name: 'flow', type: 'conversation', id: props.message.conversationId })
      .then(({ state }) => state.payload)
      .catch(() => null),
  set: async (props, state) =>
    props.client
      .setState({
        name: 'flow',
        type: 'conversation',
        id: props.message.conversationId,
        payload: state,
      })
      .then(() => {}),
})

const entryNode = flow.execute({
  input: z.object({}),
  handler: async () => {
    return {
      transition: 'hold',
      next: sayHiNode,
      data: {},
    }
  },
})

const sayHiNode = flow.execute({
  input: z.object({ name: z.string().optional() }),
  handler: async (props) => {
    const msg = props.data.name ?? 'man'
    Api.from(props).respondText(`Hi, ${msg}!`)
    return {
      transition: 'hold',
      next: promptNameNode,
      data: {},
    }
  },
})

// self referencing node -> any
const promptNameNode: any = flow.prompt({
  question: {
    type: 'text',
    payload: {
      text: 'What is your name?',
    },
  },
  input: z.object({}),
  handler: async (props) => {
    const text = props.message.payload.text as string

    if (!text) {
      Api.from(props).respondText('Please enter your name')
      return {
        transition: 'hold',
        next: promptNameNode,
        data: {},
      }
    }

    return {
      transition: 'hold',
      next: sayHiNode,
      data: { name: text },
    }
  },
})

bot.message(async (props) => {
  console.info('[START] process_message', props.message)

  const handler = flow.start(entryNode, {})
  await handler(props)

  console.info('[END] process_message')
})
export default bot
