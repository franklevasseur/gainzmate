import * as dallox from 'dallox'
import { bot } from './bot'
import { z } from 'zod'
import { Api } from './api-utils'
import { stateRepo } from './state'

const flow = dallox.createFlow(bot, stateRepo)

const entryNode = flow
  .declareNode({ schema: z.object({}) })
  .execute(async () => flow.transition(sayHiNode, { emoji: '👋' }))

const sayHiNode = flow
  .declareNode({
    schema: z.object({ name: z.string().optional(), emoji: z.union([z.literal('👋'), z.literal('😎')]) }),
  })
  .execute(async (props) => {
    const msg = props.data.name ?? 'man'
    Api.from(props).respondText(`Hi, ${msg} ${props.data.emoji}!`)
    return flow.transition(promptNameNode, {})
  })

const promptNameNode = flow
  .declareNode({
    schema: z.object({}),
  })
  .prompt(
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

flow.setStart(entryNode, {})

bot.message(async (props) => {
  console.info('[START] process_message', props.message)

  if (props.message.payload.text === '/reset') {
    // TODO: implement flow hooks
    await flow.reset(props)
  } else {
    await flow.handler(props)
  }

  console.info('[END] process_message')
})

export default bot
