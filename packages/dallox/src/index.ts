import { Flow } from './flow'
import { AnyBot, FlowStateRepository } from './types'

export * as err from './errors'
export { FlowState, FlowStateRepository } from './types'

export const createFlow = <TBot extends AnyBot>(bot: TBot, stateRepo: FlowStateRepository<TBot>) =>
  new Flow(bot, stateRepo)
