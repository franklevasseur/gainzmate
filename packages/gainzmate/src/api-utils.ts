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

  public async choice(text: string, choices: string[]): Promise<void> {
    await this.props.client.createMessage({
      conversationId: this.props.message.conversationId,
      userId: this.props.ctx.botId,
      tags: {},
      type: 'choice',
      payload: {
        text,
        options: choices.map((choice) => ({ label: choice, value: choice })),
      },
    })
  }
}
