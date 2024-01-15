import { flow } from 'src/bot'
import { Gsheets } from 'src/integrations/gsheets'
import { Telegram } from 'src/integrations/telegram'
import { z } from 'zod'

export const linkCommand = flow
  .declareNode({ id: 'link_command', schema: z.object({ argument: z.string() }) })
  .execute(async (props) => {
    const link = await Gsheets.from(props).getSheetLink()
    if (link) {
      await Telegram.from(props).respondText(link)
    } else {
      await Telegram.from(props).respondText('No link found...')
    }
    return null
  })
