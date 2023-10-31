import { bot } from './bot'

bot.message(async (props) => {
  console.info('[START] process_message', props.message)
  // TODO: implement
  console.info('[END] process_message')
})
export default bot
