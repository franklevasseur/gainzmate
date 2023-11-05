import { Bot } from '@botpress/sdk'
import { z } from 'zod'
import { Node } from './node'
import * as err from './errors'
import * as types from './types'

export class Flow<TBot extends Bot> {
  private _initialState: types.FlowState | null = null
  private _nodes: Node<TBot, any, any>[] = []

  public constructor(_bot: TBot, private _stateRepo: types.FlowStateRepository<TBot>) {}

  public readonly transition = <TNext extends Node<TBot, any, any>>(
    next: TNext,
    data: z.infer<TNext['input']>
  ): types.FlowTransition<TBot, TNext> => ({ action: 'hold', next, data })

  public readonly yield = <TNext extends Node<TBot, any, any>>(
    next: TNext,
    data: z.infer<TNext['input']>
  ): types.FlowTransition<TBot, TNext> => ({ action: 'yield', next, data })

  public readonly declareNode = <TInput extends z.AnyZodObject>(declaration: types.NodeDeclaration<TBot, TInput>) => {
    const id = this._nodes.length
    const ref = new Node(id, declaration.schema, this._nodes)
    this._nodes[id] = ref
    return ref
  }

  public readonly setStart = <TInput extends z.AnyZodObject>(
    startNode: Node<TBot, TInput, any>,
    startData: z.infer<TInput>
  ): void => {
    this._initialState = { next: startNode.id, data: startData }
  }

  public readonly reset = async (props: types.MessageHandlerProps<TBot>) => {
    if (!this._initialState) {
      throw new err.NoStartNodeDefined()
    }
    await this._stateRepo.set(props, { next: 0, data: {} })
  }

  public readonly handler: types.MessageHandler<TBot> = async (props) => {
    if (!this._initialState) {
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
