import { Bot } from '@botpress/sdk'
import { z } from 'zod'
import * as err from './errors'

type MessageHandler<TBot extends Bot> = Parameters<TBot['message']>[0]
type MessageHandlerProps<TBot extends Bot> = Parameters<MessageHandler<TBot>>[0]
type Client<TBot extends Bot> = MessageHandlerProps<TBot>['client']
type CreateMessageProps<TBot extends Bot> = Parameters<Client<TBot>['createMessage']>[0]

type NodeInput<TBot extends Bot, TInput extends z.AnyZodObject> = MessageHandlerProps<TBot> & {
  data: z.infer<TInput>
}

type NodeTransition = 'hold' | 'yield'
type NodeOutput<TBot extends Bot, TNext extends Node<TBot, any>> = {
  transition: NodeTransition
  next: TNext
  data: z.infer<TNext['input']>
} | null

type NodeHandler<TBot extends Bot, TInput extends z.AnyZodObject, TNext extends Node<TBot, any>> = (
  props: NodeInput<TBot, TInput>
) => Promise<NodeOutput<TBot, TNext>>

class Node<TBot extends Bot, TInput extends z.AnyZodObject> {
  public constructor(
    public readonly id: number,
    public readonly input: TInput,
    public readonly handler: NodeHandler<TBot, TInput, Node<TBot, any>>
  ) {}
}

type ExecuteNodeProps<TBot extends Bot, TInput extends z.AnyZodObject> = {
  input: TInput
  handler: NodeHandler<TBot, TInput, Node<TBot, any>>
}

type PromptNodeProps<TBot extends Bot, TInput extends z.AnyZodObject> = {
  input: TInput
  question: Pick<CreateMessageProps<TBot>, 'type' | 'payload'>
  handler: NodeHandler<TBot, TInput, Node<TBot, any>>
}

export type FlowState = {
  next: number
  data: object
}

export type FlowStateRepository<TBot extends Bot> = {
  get: (props: MessageHandlerProps<TBot>) => Promise<FlowState | null>
  set: (props: MessageHandlerProps<TBot>, state: FlowState) => Promise<void>
}

export class Flow<TBot extends Bot> {
  private _nodes: Node<TBot, any>[] = []
  public constructor(private _bot: TBot, private _stateRepo: FlowStateRepository<TBot>) {}

  public readonly execute = <TInput extends z.AnyZodObject>(
    props: ExecuteNodeProps<TBot, TInput>
  ): Node<TBot, TInput> => {
    const node = new Node(this._nodes.length, props.input, props.handler)
    this._nodes.push(node)
    return node
  }

  public readonly prompt = <TInput extends z.AnyZodObject>(
    props: PromptNodeProps<TBot, TInput>
  ): Node<TBot, TInput> => {
    const promptNode = new Node(this._nodes.length, props.input, async (args) => {
      await args.client.createMessage({
        conversationId: args.message.conversationId,
        userId: args.message.userId,
        tags: {},
        type: props.question.type,
        payload: props.question.payload,
      })
      return {
        transition: 'yield',
        next: validationNode,
        data: args.data,
      }
    })

    const validationNode = new Node(this._nodes.length, props.input, props.handler)

    this._nodes.push(promptNode)
    this._nodes.push(validationNode)

    return promptNode
  }

  public readonly start =
    <TInput extends z.AnyZodObject>(startNode: Node<TBot, TInput>, startData: z.infer<TInput>): MessageHandler<TBot> =>
    async (props) => {
      const initialState: FlowState = { next: startNode.id, data: startData }
      let state: FlowState = (await this._stateRepo.get(props)) ?? initialState

      while (true) {
        const node = this._nodes[state.next]
        if (!node) {
          throw new err.NodeNotFoundError(state.next)
        }

        const output = await node.handler({ ...props, data: state.data })
        if (!output) {
          state = initialState
          await this._stateRepo.set(props, state)
          return
        }

        state = { next: output.next.id, data: output.data }
        if (output.transition === 'yield') {
          await this._stateRepo.set(props, state)
          return
        }

        if (output.next.id === node.id) {
          throw new err.InfiniteLoopError(node.id)
        }

        await this._stateRepo.set(props, state)
      }
    }
}
