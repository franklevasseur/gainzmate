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
type NodeOutput<TBot extends Bot, TNext extends NodeReference<TBot, any>> = FlowTransition<TBot, TNext> | null

type NodeHandler<TBot extends Bot, TInput extends z.AnyZodObject, TNext extends NodeReference<TBot, any>> = (
  props: NodeInput<TBot, TInput>
) => Promise<NodeOutput<TBot, TNext>>

class NodeReference<_TBot extends Bot, TInput extends z.AnyZodObject> {
  public constructor(public readonly id: number, public readonly input: TInput) {}
}

type Node<TBot extends Bot, TInput extends z.AnyZodObject, TNext extends NodeReference<TBot, any>> = {
  ref: NodeReference<TBot, any>
  handler: NodeHandler<TBot, TInput, TNext>
}

class FlowTransition<TBot extends Bot, TNext extends NodeReference<TBot, any>> {
  public constructor(
    public readonly transition: NodeTransition,
    public readonly next: TNext,
    public readonly data: z.infer<TNext['input']>
  ) {}
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
  private _nodes: Node<TBot, any, any>[] = []
  public constructor(private _bot: TBot, private _stateRepo: FlowStateRepository<TBot>) {}

  public readonly transition = <TNext extends NodeReference<TBot, any>>(ref: TNext, data: z.infer<TNext['input']>) =>
    new FlowTransition('hold', ref, data)

  public readonly yield = <TNext extends NodeReference<TBot, any>>(ref: TNext, data: z.infer<TNext['input']>) =>
    new FlowTransition('yield', ref, data)

  public readonly declare = <TInput extends z.AnyZodObject>(input: TInput) => {
    const ref = new NodeReference(this._nodes.length, input)
    const defaultHandler: NodeHandler<TBot, TInput, NodeReference<TBot, any>> = async () => {
      throw new err.NodeNotImplementedError(ref.id)
    }
    this._nodes.push({ ref, handler: defaultHandler })
    return ref
  }

  public readonly execute = <TInput extends z.AnyZodObject>(
    ref: NodeReference<TBot, TInput>,
    handler: NodeHandler<TBot, TInput, NodeReference<TBot, any>>
  ) => {
    const node = this._nodes[ref.id]
    if (!node) {
      throw new err.NodeNotFoundError(ref.id)
    }
    node.handler = handler
  }

  public readonly prompt = <TInput extends z.AnyZodObject>(
    ref: NodeReference<TBot, TInput>,
    question: Pick<CreateMessageProps<TBot>, 'type' | 'payload'>,
    handler: NodeHandler<TBot, TInput, NodeReference<TBot, any>>
  ) => {
    const questionNode = this._nodes[ref.id]
    if (!questionNode) {
      throw new err.NodeNotFoundError(ref.id)
    }
    questionNode.handler = async (args) => {
      await args.client.createMessage({
        conversationId: args.message.conversationId,
        userId: args.ctx.botId,
        tags: {},
        type: question.type,
        payload: question.payload,
      })
      return {
        transition: 'yield',
        next: validationNodeRef,
        data: args.data,
      }
    }

    const validationNodeRef = new NodeReference(this._nodes.length, ref.input)
    this._nodes.push({
      ref: validationNodeRef,
      handler,
    })
  }

  public readonly start =
    <TInput extends z.AnyZodObject>(
      startNode: NodeReference<TBot, TInput>,
      startData: z.infer<TInput>
    ): MessageHandler<TBot> =>
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

        if (output.next.id === node.ref.id) {
          throw new err.InfiniteLoopError(node.ref.id)
        }

        await this._stateRepo.set(props, state)
      }
    }
}
