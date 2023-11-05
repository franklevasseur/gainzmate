import { Bot } from '@botpress/sdk'
import { z } from 'zod'
import * as err from './errors'
import * as types from './types'

export class Node<TBot extends Bot, TInput extends z.AnyZodObject, TNext extends types.AnyNode<TBot>> {
  public constructor(
    public readonly id: string,
    public readonly input: TInput,
    private readonly _nodes: types.NodeMap<TBot>
  ) {}

  public handler: types.NodeHandler<TBot, TInput, TNext> | null = null

  public readonly execute = (handler: types.NodeHandler<TBot, TInput, TNext>): this => {
    this.handler = handler
    return this
  }

  public readonly prompt = (
    question: Pick<types.CreateMessageProps<TBot>, 'type' | 'payload'>,
    handler: types.NodeHandler<TBot, TInput, TNext>
  ) => {
    if (this.handler) {
      throw new err.NodeAlreadyImplementedError(this.id)
    }

    this.handler = async (args) => {
      await args.client.createMessage({
        conversationId: args.message.conversationId,
        userId: args.ctx.botId,
        tags: {},
        type: question.type,
        payload: question.payload,
      })

      const next = validationNode as TNext
      return {
        action: 'yield',
        next,
        data: args.data,
      }
    }

    const validationNodeId = `${this.id}▁validation`
    const validationNode = new Node(validationNodeId, this.input, this._nodes)
    validationNode.handler = handler
    this._nodes[validationNodeId] = validationNode

    return this
  }
}
