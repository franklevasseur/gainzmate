import * as dallox from 'dallox'
import { bot } from 'src/bot'

export const stateRepo: dallox.FlowStateRepository<typeof bot> = {
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
        payload: {
          next: state.next,
          data: state.data as Record<string, any>,
        },
      })
      .then(() => {}),
}
