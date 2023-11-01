import { Bot as SdkBot } from '@botpress/sdk'
import { z } from 'zod'

type ValueOf<T> = T[keyof T]
type MessageHandler<TBot extends SdkBot> = Parameters<TBot['message']>[0]

export type MessageHandlerProps<TBot extends SdkBot> = Parameters<MessageHandler<TBot>>[0]

export type NodeDefinition = z.ZodTypeAny

export type NodeTransition = 'yield' | 'hold'

export type FlowDefinition = Record<string, NodeDefinition>

export type FlowState<TFlowDef extends FlowDefinition> = ValueOf<{
  [K in keyof TFlowDef]: {
    next: K
    data: z.infer<TFlowDef[K]>
  }
}>

export type NodeImplementationInput<
  TBot extends SdkBot,
  TNodeDef extends NodeDefinition,
  _TFlowDef extends FlowDefinition
> = MessageHandlerProps<TBot> & {
  data: z.infer<TNodeDef>
}

export type NodeImplementationOutput<
  _TBot extends SdkBot,
  _TNodeDef extends NodeDefinition,
  TFlowDef extends FlowDefinition
> = (FlowState<TFlowDef> & { transition: NodeTransition }) | null

export type NodeImplementation<
  TBot extends SdkBot,
  TNodeDef extends NodeDefinition,
  TFlowDef extends FlowDefinition
> = (
  input: NodeImplementationInput<TBot, TNodeDef, TFlowDef>
) => Promise<NodeImplementationOutput<TBot, TNodeDef, TFlowDef>>

export type FlowImplementation<TBot extends SdkBot, TFlowDef extends FlowDefinition> = {
  [K in keyof TFlowDef]: NodeImplementation<TBot, TFlowDef[K], TFlowDef>
}
