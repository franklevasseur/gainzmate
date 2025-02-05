import * as sdk from '@botpress/sdk'
import browser from 'bp_modules/browser'
import gsheets from 'bp_modules/gsheets'
import telegram from 'bp_modules/telegram'
import * as genenv from '.genenv'

export default new sdk.BotDefinition({
  states: {
    flow: {
      type: 'conversation',
      schema: sdk.z.object({
        next: sdk.z.string(),
        data: sdk.z.object({}).passthrough(),
      }),
    },
  },
})
  .addIntegration(browser, {
    enabled: true,
    configuration: {},
  })
  .addIntegration(gsheets, {
    enabled: true,
    configuration: {
      clientEmail: genenv.GSHEETS_CLIENT_EMAIL,
      privateKey: genenv.GSHEETS_PRIVATE_KEY,
      spreadsheetId: genenv.GSHEETS_SPREADSHEET_ID,
    },
  })
  .addIntegration(telegram, {
    enabled: true,
    configuration: {
      botToken: genenv.TELEGRAM_BOT_TOKEN,
    },
  })
