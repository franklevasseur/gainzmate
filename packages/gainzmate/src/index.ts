import * as dallox from 'dallox'
import { bot } from './bot'
import { z } from 'zod'
import { Api } from './api-utils'
import { stateRepo } from './state'

const flow = new dallox.Flow(bot, stateRepo)

const entryNode = flow.declare(z.object({}))
flow.execute(entryNode, async () => flow.transition(sayHiNode, { emoji: '👋' }))

const sayHiNode = flow.declare(
  z.object({ name: z.string().optional(), emoji: z.union([z.literal('👋'), z.literal('😎')]) })
)
flow.execute(sayHiNode, async (props) => {
  const msg = props.data.name ?? 'man'
  Api.from(props).respondText(`Hi, ${msg} ${props.data.emoji}!`)
  return flow.transition(promptNameNode, {})
})

const promptNameNode = flow.declare(z.object({}))
flow.prompt(
  promptNameNode,
  {
    type: 'text',
    payload: {
      text: 'What is your name?',
    },
  },
  async (props) => {
    const text = props.message.payload.text as string

    const isAlpha = /^[a-zA-Z]+$/.test(text)
    if (!isAlpha) {
      Api.from(props).respondText('This is not a valid name. Please try again.')
      return flow.transition(promptNameNode, {})
    }

    return flow.transition(sayHiNode, { name: text, emoji: '😎' })
  }
)

bot.message(async (props) => {
  console.info('[START] process_message', props.message)

  if (props.message.payload.text === '/reset') {
    await stateRepo.set(props, { next: entryNode.id, data: {} })
  } else {
    const handler = flow.start(entryNode, {})
    await handler(props)
  }

  console.info('[END] process_message')
})
export default bot
