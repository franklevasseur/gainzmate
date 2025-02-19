import * as client from '@botpress/client'
import { z } from '@botpress/sdk'
import * as err from './errors'
import * as types from './types'

type StaticQuestion = Pick<client.ClientInputs['createMessage'], 'type' | 'payload'>
type VariableQuestion<TInput extends z.AnyZodObject> = (props: types.NodeInput<types.BaseBot, TInput>) => StaticQuestion
type Question<TInput extends z.AnyZodObject> = StaticQuestion | VariableQuestion<TInput>

const isVariableQuestion = <TInput extends z.AnyZodObject>(
  question: Question<TInput>,
): question is VariableQuestion<TInput> => typeof question === 'function'

export class Node<TBot extends types.BaseBot, TInput extends z.AnyZodObject, TNext extends types.AnyNode<TBot>> {
  public constructor(
    public readonly id: string,
    public readonly input: TInput,
    private readonly _nodes: types.NodeMap<TBot>,
  ) {}

  public handler: types.NodeHandler<TBot, TInput, TNext> | null = null

  public readonly execute = (handler: types.NodeHandler<TBot, TInput, TNext>): this => {
    this.handler = handler
    return this
  }

  public readonly prompt = (question: Question<TInput>, handler: types.NodeHandler<TBot, TInput, TNext>) => {
    if (this.handler) {
      throw new err.NodeAlreadyImplementedError(this.id)
    }

    this.handler = async (args) => {
      let staticQuestion: StaticQuestion
      if (isVariableQuestion(question)) {
        staticQuestion = question(args as types.NodeInput<any, TInput>)
      } else {
        staticQuestion = question
      }

      const client = args.client as types.Client<any>
      await client.createMessage({
        conversationId: args.message.conversationId,
        userId: args.ctx.botId,
        tags: {},
        type: staticQuestion.type,
        payload: staticQuestion.payload,
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
