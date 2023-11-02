import { Bot as SdkBot } from '@botpress/sdk'
import * as errors from './errors'
import * as types from './types'

export class Flow<TBot extends SdkBot, TFlowDef extends types.FlowDefinition> {
  public constructor(
    public readonly bot: TBot,
    public readonly definition: TFlowDef,
    public readonly implementation: types.FlowImplementation<TBot, TFlowDef>,
    public readonly init: types.FlowState<TFlowDef>
  ) {}

  public readonly handler =
    (currentState: types.FlowState<TFlowDef> | null = null) =>
    async (props: types.MessageHandlerProps<TBot>): Promise<types.FlowState<TFlowDef>> => {
      let state: types.FlowState<TFlowDef> = currentState ?? this.init

      while (true) {
        if (!(state.next in this.implementation)) {
          throw new errors.NodeNotFoundError(state.next as string)
        }

        // TODO: ensure that the data is valid before calling the implementation

        const node = this.implementation[state.next]
        const output = await node({ ...props, data: state.data })

        if (output === null) {
          return this.init
        }

        const { transition, ...newState } = output
        if (transition === 'hold' && newState.next === state.next) {
          throw new errors.InfiniteLoopError(state.next as string)
        }

        state = newState

        if (transition === 'yield') {
          return state
        }

        // TODO: also persist the state when the transition is 'hold' in case the bot crashes
      }
    }
}
