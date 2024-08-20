import { z } from '@botpress/sdk'
import * as err from './errors'
import { Node } from './node'
import * as types from './types'

const emptySchema = z.object({})
type ZodEmptySchema = typeof emptySchema

export class Flow<TBot extends types.AnyBot> {
  private _startNode: Node<TBot, ZodEmptySchema, any> | null = null
  private _nodes: types.NodeMap<TBot> = {}

  private get _initialState(): types.FlowState {
    if (!this._startNode) {
      throw new err.NoStartNodeDefined()
    }
    return { next: this._startNode.id, data: {} }
  }

  public constructor(
    _bot: TBot,
    private _stateRepo: types.FlowStateRepository<TBot>,
  ) {}

  public readonly transition = <TNext extends Node<TBot, any, any>>(
    next: TNext,
    data: z.infer<TNext['input']>,
  ): types.FlowTransition<TBot, TNext> => ({ action: 'hold', next, data })

  public readonly yield = <TNext extends Node<TBot, any, any>>(
    next: TNext,
    data: z.infer<TNext['input']>,
  ): types.FlowTransition<TBot, TNext> => ({ action: 'yield', next, data })

  public readonly start = (handler: types.NodeHandler<TBot, ZodEmptySchema, types.AnyNode<TBot>>): this => {
    if (this._startNode) {
      throw new err.StartNodeConflict()
    }

    const startId = '▁▁start▁▁'
    const node = new Node(startId, emptySchema, this._nodes)
    node.handler = handler

    this._startNode = node
    this._nodes[startId] = node
    return this
  }

  public readonly declareNode = <TInput extends z.AnyZodObject>(declaration: types.NodeDeclaration<TBot, TInput>) => {
    const node = new Node(declaration.id, declaration.schema, this._nodes)
    this._nodes[declaration.id] = node
    return node
  }

  public readonly reset = async (props: types.MessageHandlerProps<TBot>) => {
    if (!this._startNode) {
      throw new err.NoStartNodeDefined()
    }
    await this._stateRepo.set(props, this._initialState)
  }

  public readonly handler: types.MessageHandler<TBot> = async (props) => {
    if (!this._startNode) {
      throw new err.NoStartNodeDefined()
    }

    let state: types.FlowState = (await this._stateRepo.get(props)) ?? this._initialState

    while (true) {
      const node = this._nodes[state.next]
      if (!node) {
        throw new err.NodeNotFoundError(state.next)
      }

      const { handler } = node
      if (!handler) {
        throw new err.NodeNotImplementedError(node.id)
      }

      const output = await handler({ ...props, data: state.data })
      if (!output) {
        state = this._initialState
        await this._stateRepo.set(props, state)
        return
      }

      state = { next: output.next.id, data: output.data }
      if (output.action === 'yield') {
        await this._stateRepo.set(props, state)
        return
      }

      if (output.next.id === node.id) {
        // TODO: keep all previous nodes since last yield to detect infinite loops better
        throw new err.InfiniteLoopError(node.id)
      }

      await this._stateRepo.set(props, state)
    }
  }
}
