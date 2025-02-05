import { Bot } from '@botpress/sdk'
import { Flow } from './flow'
import { BaseBot, FlowStateRepository } from './types'

export * as err from './errors'
export { FlowState, FlowStateRepository } from './types'

export const createFlow = <TBot extends BaseBot>(bot: Bot<TBot>, stateRepo: FlowStateRepository<TBot>) =>
  new Flow(bot, stateRepo)
