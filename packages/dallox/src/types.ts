import { Bot } from '@botpress/sdk'
import { z } from 'zod'
import { Node } from './node'

export type MessageHandler<TBot extends Bot> = Parameters<TBot['message']>[0]
export type MessageHandlerProps<TBot extends Bot> = Parameters<MessageHandler<TBot>>[0]
export type Client<TBot extends Bot> = MessageHandlerProps<TBot>['client']
export type CreateMessageProps<TBot extends Bot> = Parameters<Client<TBot>['createMessage']>[0]

export type NodeDeclaration<_TBot extends Bot, TInput extends z.AnyZodObject> = {
  id: string
  schema: TInput
}

export type NodeInput<TBot extends Bot, TInput extends z.AnyZodObject> = MessageHandlerProps<TBot> & {
  data: z.infer<TInput>
}

export type TransitionType = 'hold' | 'yield'
export type FlowTransition<TBot extends Bot, TNext extends Node<TBot, any, any>> = {
  action: TransitionType
  next: TNext
  data: z.infer<TNext['input']>
}

export type NodeOutput<TBot extends Bot, TNext extends Node<TBot, any, any>> = FlowTransition<TBot, TNext> | null

export type NodeHandler<TBot extends Bot, TInput extends z.AnyZodObject, TNext extends Node<TBot, any, any>> = (
  props: NodeInput<TBot, TInput>,
) => Promise<NodeOutput<TBot, TNext>>

export type FlowState = {
  next: string
  data: object
}

export type FlowStateRepository<TBot extends Bot> = {
  get: (props: MessageHandlerProps<TBot>) => Promise<FlowState | null>
  set: (props: MessageHandlerProps<TBot>, state: FlowState) => Promise<void>
}

export type AnyNode<TBot extends Bot> = Node<TBot, any, any>
export type NodeMap<TBot extends Bot> = Record<string, AnyNode<TBot>>
