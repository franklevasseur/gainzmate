import { ApiUtils } from './api-utils'
import { bot } from './bot'

bot.message(async (props) => {
  const { message } = props
  console.info('Received message', message)

  const api = new ApiUtils(props)

  if (message.type !== 'text') {
    await api.respond('Sorry, I only understand text messages.')
    return
  }

  await api.respond(`You said: ${message.payload.text}`)
  console.info('text message sent')
})

export default bot
