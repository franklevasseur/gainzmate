import * as dallox from 'dallox'
import { z } from 'zod'
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

const stateRepo: dallox.FlowStateRepository<typeof bot> = {
  get: async (props) =>
    props.client
      .getState({ name: 'flow', type: 'conversation', id: props.message.conversationId })
      .then(({ state }) => state.payload)
      .catch(() => null),
  set: async (props, state) =>
    props.client
      .setState({
        name: 'flow',
        type: 'conversation',
        id: props.message.conversationId,
        payload: state,
      })
      .then(() => {}),
}

export const flow = dallox.createFlow(bot, stateRepo)

export type Bot = typeof bot
export type Flow = typeof flow
export type MessageHandler = Parameters<Bot['message']>[0]
export type MessageHandlerProps = Parameters<MessageHandler>[0]
