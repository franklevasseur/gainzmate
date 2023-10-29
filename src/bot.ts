import * as bp from '.botpress'

export const bot = new bp.Bot({
  integrations: {},
})

export type Bot = typeof bot
export type MessageHandler = Parameters<Bot['message']>[0]
export type MessageHandlerProps = Parameters<MessageHandler>[0]
