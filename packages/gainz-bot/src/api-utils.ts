import { MessageHandlerProps } from './bot'

export class ApiUtils {
  public constructor(private readonly props: MessageHandlerProps) {}

  public async respond(text: string) {
    await this.props.client.createMessage({
      conversationId: this.props.message.conversationId,
      userId: this.props.ctx.botId,
      tags: {},
      type: 'text',
      payload: {
        text,
      },
    })
  }
}
