import { bot } from './bot'
import { entry } from './commands'
import { flow } from './flow'

flow.start(async () => flow.transition(entry, {}))

bot.message(async (props) => {
  console.info('[START] process_message', props.message)

  if (props.message.payload.text === '/reset') {
    // TODO: implement flow hooks
    await flow.reset(props)
  } else {
    await flow.handler(props)
  }

  console.info('[END] process_message')
})

export default bot
