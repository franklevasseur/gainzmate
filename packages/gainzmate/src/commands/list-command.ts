import { flow } from 'src/bot'
import { z } from 'zod'
import { Telegram } from 'src/integrations/telegram'
import { Gsheets } from 'src/integrations/gsheets'
import { formatLiftEvent, parseLift } from 'src/lift'
import { filterBy } from 'src/utils'

export const listCommand = flow
  .declareNode({ id: 'list_command', schema: z.object({ argument: z.string() }) })
  .execute(async (props) => {
    const { argument } = props.data

    const parsedLift = parseLift(argument)

    const lifts = await Gsheets.from(props).getLifts()

    const filteredLifts = lifts.filter(filterBy(parsedLift))

    if (!filteredLifts.length) {
      await Telegram.from(props).respondText('No lifts found...')
      return null
    }

    const lines = ['Lifts:', ...filteredLifts.map(formatLiftEvent)]
    const formatted = lines.join('\n - ')
    await Telegram.from(props).respondText(formatted)
    return null
  })
