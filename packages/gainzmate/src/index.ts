import { bot, flow } from './bot'
import { entry } from './commands'

flow.start(async () => flow.transition(entry, {}))

bot.on.message('*', async (props) => {
  console.info('[START] process_message', props.message)

  if (props.message.type === 'text' && props.message.payload.text === '/reset') {
    // TODO: implement flow hooks
    await flow.reset(props)
  } else {
    await flow.handler(props)
  }

  console.info('[END] process_message')
})

export default bot
