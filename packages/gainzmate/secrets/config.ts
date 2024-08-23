import { YargsSchema, YargsConfig } from '@bpinternal/yargs-extra'

type YargsOption = YargsSchema[string]

const telegramBotToken = {
  type: 'string',
  description: 'Telegram Bot Token',
} satisfies YargsOption

const gsheetsSpreadsheetId = {
  type: 'string',
  description: 'Gsheets Spreadsheet Id',
} satisfies YargsOption

const gsheetsClientEmail = {
  type: 'string',
  description: 'Gsheets Client Email',
} satisfies YargsOption

const gsheetsPrivateKey = {
  type: 'string',
  description: 'Gsheets Private Key',
} satisfies YargsOption

export const configSchema = {
  telegramBotToken,
  gsheetsSpreadsheetId,
  gsheetsClientEmail,
  gsheetsPrivateKey,
} satisfies YargsSchema

export type Config = YargsConfig<typeof configSchema>
