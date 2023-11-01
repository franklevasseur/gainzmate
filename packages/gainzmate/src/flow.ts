import { ApiUtils } from './api-utils'
import { MessageHandlerProps, FlowState, MessageHandler } from './bot'

export type NodeHandlerProps = MessageHandlerProps & { api: ApiUtils; state: {} }
export type NodeHandler = (props: NodeHandlerProps) => Promise<FlowState>

export type Node = {
  id: string
  handler: NodeHandler
}

export type Flow = {
  start: Node
  nodes: Node[]
}

export const handle =
  (flow: Flow): MessageHandler =>
  async (props) => {
    const {
      state: { payload: flowState },
    } = await props.client.getState({
      type: 'conversation',
      id: props.conversation.id,
      name: 'flow',
    })

    const { nextNode: nextNodeId, data: flowData } = flowState

    let nextNode: Node
    if (!nextNodeId) {
      nextNode = flow.start
    } else {
      nextNode = flow.nodes.find((node) => node.id === nextNodeId) ?? flow.start
    }

    await nextNode.handler({ ...props, state: flowData, api: new ApiUtils(props) })
  }
