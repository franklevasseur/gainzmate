import { z } from 'zod'
import * as bp from '.botpress'
import * as dallox from 'dallox'
import { stateRepo } from './state'
import * as creds from './creds'

export type Bot = typeof bot
export type MessageHandler = Parameters<Bot['message']>[0]
export type MessageHandlerProps = Parameters<MessageHandler>[0]
export type Flow = typeof flow
export type FlowNode<TInput extends z.AnyZodObject> = ReturnType<typeof flow.declareNode<TInput>>

const telegram = new bp.telegram.Telegram({
  enabled: true,
  config: {
    botToken: creds.telegram.devBotToken,
  },
})

const gsheets = new bp.gsheets.Gsheets({
  enabled: true,
  config: {
    spreadsheetId: creds.gsheets.spreadsheetId,
    clientEmail: creds.gsheets.clientEmail,
    privateKey: creds.gsheets.privateKey,
  },
})

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
})

export const flow = dallox.createFlow(bot, stateRepo)
