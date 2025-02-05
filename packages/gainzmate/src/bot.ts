import * as sdk from '@botpress/sdk'
import { z } from '@botpress/sdk'
import * as dallox from 'dallox'
import { stateRepo } from './state'
import * as bp from '.botpress'

export type TBot = sdk.DefaultBot<bp.TBot>

export type Bot = bp.Bot
export type Client = bp.Client
export type MessageHandler = bp.MessageHandlers['*']
export type MessageHandlerProps = bp.MessageHandlerProps
export type Flow = typeof flow
export type FlowNode<TInput extends z.AnyZodObject> = ReturnType<typeof flow.declareNode<TInput>>

export type ClientOperation = bp.ClientOperation
export type ClientInputs = bp.ClientInputs
export type ClientOutputs = bp.ClientOutputs

export const bot = new bp.Bot({
  actions: {},
})

export const flow = dallox.createFlow(bot, stateRepo)
