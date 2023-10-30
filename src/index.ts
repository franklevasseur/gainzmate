import { bot } from './bot'
import { message } from './message'

bot.message(async (props) => {
  console.info('[START] process_message', props.message)
  message(props)
  console.info('[END] process_message')
})
export default bot
