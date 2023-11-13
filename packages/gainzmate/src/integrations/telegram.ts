import { MessageHandlerProps } from '../bot'
import * as bp from '.botpress'

type Messages = bp.telegram.channels.channel.Messages

export class Telegram {
  private constructor(private readonly props: MessageHandlerProps) {}

  public static from = (props: MessageHandlerProps) => new Telegram(props)

  public async respond<T extends keyof Messages>(type: T, payload: Messages[T]) {
    await this.props.client.createMessage({
      conversationId: this.props.message.conversationId,
      userId: this.props.ctx.botId,
      tags: {},
      type,
      payload,
    })
  }

  public async respondText(text: string) {
    await this.respond('text', { text })
  }
}
