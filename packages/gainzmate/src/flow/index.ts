import * as dallox from 'dallox'
import * as nodes from './nodes'
import { bot } from 'src/bot'

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

export type Flow = typeof flow
export const flow = dallox.createFlow(bot, stateRepo)

flow.start().execute(async () => flow.transition(nodes.sayHiNode, { emoji: '👋' }))
