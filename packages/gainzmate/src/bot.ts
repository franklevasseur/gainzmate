import { z } from 'zod'
import * as bp from '.botpress'
import * as dallox from 'dallox'
import { stateRepo } from './state'

export type Bot = typeof bot
export type MessageHandler = Parameters<Bot['message']>[0]
export type MessageHandlerProps = Parameters<MessageHandler>[0]
export type Flow = typeof flow
export type FlowNode<TInput extends z.AnyZodObject> = ReturnType<typeof flow.declareNode<TInput>>

export const bot = new bp.Bot({
  integrations: {
    telegram: new bp.telegram.Telegram({
      enabled: true,
      config: {
        botToken: '6402478878:AAE-zzePKjgIl23G4VoP_S1StPaf4JoBzHU',
      },
    }),
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
})

export const flow = dallox.createFlow(bot, stateRepo)
