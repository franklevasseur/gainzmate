import * as dallox from 'dallox'
import { z } from 'zod'
import { stateRepo } from './state'
import * as bp from '.botpress'
import * as secrets from '.botpress/secrets'

export type Bot = typeof bot
export type MessageHandler = Parameters<Bot['message']>[0]
export type MessageHandlerProps = Parameters<MessageHandler>[0]
export type Flow = typeof flow
export type FlowNode<TInput extends z.AnyZodObject> = ReturnType<typeof flow.declareNode<TInput>>

const telegram = new bp.telegram.Telegram({
  enabled: true,
  config: {
    botToken: secrets.telegramBotToken,
  },
})

const gsheets = new bp.gsheets.Gsheets({
  enabled: true,
  config: {
    spreadsheetId: secrets.gsheetsSpreadsheetId,
    clientEmail: secrets.gsheetsClientEmail,
    privateKey: secrets.gsheetsPrivateKey,
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
