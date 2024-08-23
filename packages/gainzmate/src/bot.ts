import { z } from '@botpress/sdk'
import * as dallox from 'dallox'
import { stateRepo } from './state'
import * as bp from '.botpress'
import * as secrets from '.botpress/secrets'

export type Bot = typeof bot
export type MessageHandler = Parameters<Bot['message']>[0]
export type MessageHandlerProps = Parameters<MessageHandler>[0]
export type Flow = typeof flow
export type FlowNode<TInput extends z.AnyZodObject> = ReturnType<typeof flow.declareNode<TInput>>

export type Client = MessageHandlerProps['client']

type Simplify<T> = T extends (...args: infer A) => infer R
  ? (...args: Simplify<A>) => Simplify<R>
  : T extends Promise<infer R>
    ? Promise<Simplify<R>>
    : T extends Buffer
      ? Buffer
      : T extends object
        ? T extends infer O
          ? { [K in keyof O]: Simplify<O[K]> }
          : never
        : T

type AsyncFunction = (...args: any) => Promise<any>
export type ClientOperation = Simplify<
  keyof {
    [K in keyof Client as Client[K] extends AsyncFunction ? K : never]: null
  }
>
export type ClientInputs = {
  [O in ClientOperation]: Parameters<Client[O]>[0]
}
export type ClientOutputs = {
  [O in ClientOperation]: Awaited<ReturnType<Client[O]>>
}

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

const browser = new bp.browser.Browser({
  enabled: true,
  config: {},
})

export const bot = new bp.Bot({
  integrations: {
    telegram,
    gsheets,
    browser,
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
