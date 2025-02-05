import { z } from '@botpress/sdk'
import * as sdk from '@botpress/sdk'
import { Node } from './node'

export type BaseBot = sdk.DefaultBot<{}>

export type BotHandlers<TBot extends BaseBot = BaseBot> = sdk.BotHandlers<TBot>

export type EventHandlers<TBot extends BaseBot = BaseBot> = Required<{
  [K in keyof BotHandlers<TBot>['eventHandlers']]: NonNullable<BotHandlers<TBot>['eventHandlers'][K]>[number]
}>

export type MessageHandlers<TBot extends BaseBot = BaseBot> = Required<{
  [K in keyof BotHandlers<TBot>['messageHandlers']]: NonNullable<BotHandlers<TBot>['messageHandlers'][K]>[number]
}>

export type MessageHandler<TBot extends BaseBot = BaseBot> = MessageHandlers<TBot>['*']
export type MessageHandlerProps<TBot extends BaseBot = BaseBot> = Parameters<MessageHandler<TBot>>[0]

export type EventHandler<TBot extends BaseBot = BaseBot> = EventHandlers<TBot>['*']
export type EventHandlerProps<TBot extends BaseBot = BaseBot> = Parameters<EventHandler<TBot>>[0]

export type Client<TBot extends BaseBot = BaseBot> = (MessageHandlerProps<TBot> | EventHandlerProps<TBot>)['client']

export type NodeDeclaration<_TBot extends BaseBot, TInput extends z.AnyZodObject> = {
  id: string
  schema: TInput
}

export type NodeInput<TBot extends BaseBot, TInput extends z.AnyZodObject> = MessageHandlerProps<TBot> & {
  data: z.infer<TInput>
}

export type TransitionType = 'hold' | 'yield'
export type FlowTransition<TBot extends BaseBot, TNext extends Node<TBot, any, any>> = {
  action: TransitionType
  next: TNext
  data: z.infer<TNext['input']>
}

export type NodeOutput<TBot extends BaseBot, TNext extends Node<TBot, any, any>> = FlowTransition<TBot, TNext> | null

export type NodeHandler<TBot extends BaseBot, TInput extends z.AnyZodObject, TNext extends Node<TBot, any, any>> = (
  props: NodeInput<TBot, TInput>,
) => Promise<NodeOutput<TBot, TNext>>

export type FlowState = {
  next: string
  data: object
}

export type FlowStateRepository<TBot extends BaseBot = BaseBot> = {
  get: (props: MessageHandlerProps<TBot>) => Promise<FlowState | null>
  set: (props: MessageHandlerProps<TBot>, state: FlowState) => Promise<void>
}

export type AnyNode<TBot extends BaseBot = BaseBot> = Node<TBot, any, any>
export type NodeMap<TBot extends BaseBot = BaseBot> = Record<string, AnyNode<TBot>>
