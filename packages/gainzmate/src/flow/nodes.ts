import { flow } from '.'
import { z } from 'zod'
import { Api } from '../api-utils'

export const sayHiNode = flow
  .declareNode({
    id: 'say_hi',
    schema: z.object({ name: z.string().optional(), emoji: z.union([z.literal('👋'), z.literal('😎')]) }),
  })
  .execute(async (props) => {
    const msg = props.data.name ?? 'man'
    Api.from(props).respondText(`Hi, ${msg} ${props.data.emoji}!`)
    return flow.transition(promptNameNode, {})
  })

export const promptNameNode = flow
  .declareNode({
    id: 'prompt_name',
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
