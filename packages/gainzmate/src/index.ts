import { bot } from './bot'
import { flow } from './flow'

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
