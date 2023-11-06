import * as dallox from 'dallox'
import { bot } from 'src/bot'
import { stateRepo } from './state'
import { z } from 'zod'

export type Flow = typeof flow
export type FlowNode<TInput extends z.AnyZodObject> = ReturnType<typeof flow.declareNode<TInput>>
export const flow = dallox.createFlow(bot, stateRepo)
