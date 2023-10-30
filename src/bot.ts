import * as bp from '.botpress'

export const bot = new bp.Bot({
  integrations: {
    telegram: new bp.telegram.Telegram({
      enabled: true,
      config: {
        botToken: '6402478878:AAE-zzePKjgIl23G4VoP_S1StPaf4JoBzHU',
      },
    }),
  },
})

export type Bot = typeof bot
export type MessageHandler = Parameters<Bot['message']>[0]
export type MessageHandlerProps = Parameters<MessageHandler>[0]
