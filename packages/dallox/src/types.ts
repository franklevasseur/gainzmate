import { z, Bot } from '@botpress/sdk'
import { Node } from './node'

export type AnyBot = Bot<any>

export type MessageHandler<TBot extends AnyBot> = Parameters<TBot['message']>[0]
export type MessageHandlerProps<TBot extends AnyBot> = Parameters<MessageHandler<TBot>>[0]
export type Client<TBot extends AnyBot> = MessageHandlerProps<TBot>['client']
export type CreateMessageProps<TBot extends AnyBot> = Parameters<Client<TBot>['createMessage']>[0]

export type NodeDeclaration<_TBot extends AnyBot, TInput extends z.AnyZodObject> = {
  id: string
  schema: TInput
}

export type NodeInput<TBot extends AnyBot, TInput extends z.AnyZodObject> = MessageHandlerProps<TBot> & {
  data: z.infer<TInput>
}

export type TransitionType = 'hold' | 'yield'
export type FlowTransition<TBot extends AnyBot, TNext extends Node<TBot, any, any>> = {
  action: TransitionType
  next: TNext
  data: z.infer<TNext['input']>
}

export type NodeOutput<TBot extends AnyBot, TNext extends Node<TBot, any, any>> = FlowTransition<TBot, TNext> | null

export type NodeHandler<TBot extends AnyBot, TInput extends z.AnyZodObject, TNext extends Node<TBot, any, any>> = (
  props: NodeInput<TBot, TInput>,
) => Promise<NodeOutput<TBot, TNext>>

export type FlowState = {
  next: string
  data: object
}

export type FlowStateRepository<TBot extends AnyBot> = {
  get: (props: MessageHandlerProps<TBot>) => Promise<FlowState | null>
  set: (props: MessageHandlerProps<TBot>, state: FlowState) => Promise<void>
}

export type AnyNode<TBot extends AnyBot> = Node<TBot, any, any>
export type NodeMap<TBot extends AnyBot> = Record<string, AnyNode<TBot>>
