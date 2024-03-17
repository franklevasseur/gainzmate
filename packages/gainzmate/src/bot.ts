import * as dallox from 'dallox'
import { z } from 'zod'
import { botConfigSchema } from './config'
import { stateRepo } from './state'
import * as bp from '.botpress'

export type Bot = typeof bot
export type MessageHandler = Parameters<Bot['message']>[0]
export type MessageHandlerProps = Parameters<MessageHandler>[0]
export type Flow = typeof flow
export type FlowNode<TInput extends z.AnyZodObject> = ReturnType<typeof flow.declareNode<TInput>>

const telegram = new bp.telegram.Telegram()
const gsheets = new bp.gsheets.Gsheets()

export const bot = new bp.Bot({
  integrations: {
    telegram,
    gsheets,
  },
  states: {
    flow: {
      type: 'conversation',
      schema: z.object({
        next: z.string(),
        data: z.object({}).passthrough(),
      }),
    },
  },
  configuration: {
    schema: botConfigSchema,
  },
})

export const flow = dallox.createFlow(bot, stateRepo)
