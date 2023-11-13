import { flow } from 'src/bot'
import { z } from 'zod'
import { Telegram } from 'src/integrations/telegram'
import { Gsheets } from 'src/integrations/gsheets'
import { formatLiftEvent, parseLift } from 'src/parse-lift'

export const viewCommand = flow
  .declareNode({ id: 'view_command', schema: z.object({ argument: z.string() }) })
  .execute(async (props) => {
    const { argument } = props.data

    const parsedLift = parseLift(argument)

    const lifts = await Gsheets.from(props).getLifts()

    const filteredLifts = lifts.filter((lift) => {
      if (parsedLift.name && lift.name !== parsedLift.name) {
        return false
      }
      if (parsedLift.side && lift.side !== parsedLift.side) {
        return false
      }
      if (parsedLift.weight && lift.weight !== parsedLift.weight) {
        return false
      }
      if (parsedLift.sets && lift.sets !== parsedLift.sets) {
        return false
      }
      if (parsedLift.reps && lift.reps !== parsedLift.reps) {
        return false
      }
      return true
    })

    if (!filteredLifts.length) {
      await Telegram.from(props).respondText('No lifts found...')
      return null
    }

    const formatted = filteredLifts.map(formatLiftEvent).join('\n - ')
    await Telegram.from(props).respondText(formatted)
    return null
  })
