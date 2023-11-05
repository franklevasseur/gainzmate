import { Bot } from '@botpress/sdk'
import { z } from 'zod'
import * as err from './errors'
import * as types from './types'

type AnyNode<TBot extends Bot> = Node<TBot, any, any>

export class Node<TBot extends Bot, TInput extends z.AnyZodObject, TNext extends AnyNode<TBot>> {
  public constructor(
    public readonly id: number,
    public readonly input: TInput,
    private readonly _nodes: AnyNode<TBot>[]
  ) {}

  public handler: types.NodeHandler<TBot, TInput, TNext> | null = null

  public readonly execute = (handler: types.NodeHandler<TBot, TInput, AnyNode<TBot>>): this => {
    if (this.handler) {
      throw new err.NodeAlreadyImplementedError(this.id)
    }
    const node = this._nodes[this.id]
    if (!node) {
      throw new err.NodeNotFoundError(this.id)
    }
    node.handler = handler
    return this
  }

  public readonly prompt = (
    question: Pick<types.CreateMessageProps<TBot>, 'type' | 'payload'>,
    handler: types.NodeHandler<TBot, TInput, AnyNode<TBot>>
  ) => {
    if (this.handler) {
      throw new err.NodeAlreadyImplementedError(this.id)
    }

    const questionNode = this._nodes[this.id]
    if (!questionNode) {
      throw new err.NodeNotFoundError(this.id)
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
        action: 'yield',
        next: validationNodeRef,
        data: args.data,
      }
    }

    const validationNodeRef = new Node(this._nodes.length, this.input, this._nodes)
    validationNodeRef.handler = handler
    this._nodes.push(validationNodeRef)

    return this
  }
}
