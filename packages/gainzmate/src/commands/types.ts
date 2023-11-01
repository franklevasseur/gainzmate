import { ApiUtils } from '../api-utils'
import { MessageHandlerProps } from '../bot'

export type CommandHandlerProps = MessageHandlerProps & { arg: string; api: ApiUtils }
export type CommandHandler = (props: CommandHandlerProps) => Promise<void>
export type Command = {
  handler: CommandHandler
  description: string
}
