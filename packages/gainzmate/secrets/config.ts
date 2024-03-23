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

const digitaloceanSpaceRegion = {
  type: 'string',
  description: 'DigitalOcean Space Region',
} satisfies YargsOption

const digitaloceanSpaceName = {
  type: 'string',
  description: 'DigitalOcean Space Name',
} satisfies YargsOption

const digitaloceanSpaceAccessKey = {
  type: 'string',
  description: 'DigitalOcean Space Access Key',
} satisfies YargsOption

const digitaloceanSpaceSecretKey = {
  type: 'string',
  description: 'DigitalOcean Space Secret Key',
} satisfies YargsOption

export const configSchema = {
  telegramBotToken,
  gsheetsSpreadsheetId,
  gsheetsClientEmail,
  gsheetsPrivateKey,
  digitaloceanSpaceRegion,
  digitaloceanSpaceName,
  digitaloceanSpaceAccessKey,
  digitaloceanSpaceSecretKey,
} satisfies YargsSchema

export type Config = YargsConfig<typeof configSchema>
