import * as dallox from 'dallox'
import { TBot } from 'src/bot'

export const stateRepo: dallox.FlowStateRepository<TBot> = {
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
          data: state.data,
        },
      })
      .then(() => {}),
}
