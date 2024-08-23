import * as fslib from 'fs'
import * as pathlib from 'path'
import { Config } from './config'

export type Complete<T extends object> = {
  [K in keyof T]: Exclude<T[K], undefined>
}

export class UnsetSecretError extends Error {
  constructor(secret: keyof Config) {
    super(`Secret "${secret}" is not set`)
  }
}

export const main = async (config: Config, outFile: string) => {
  const { telegramBotToken, gsheetsSpreadsheetId, gsheetsClientEmail, gsheetsPrivateKey } = validateConfig(config)

  const tsScript = [
    `export const telegramBotToken = "${telegramBotToken}"`,
    `export const gsheetsSpreadsheetId = "${gsheetsSpreadsheetId}"`,
    `export const gsheetsClientEmail = "${gsheetsClientEmail}"`,
    `export const gsheetsPrivateKey = "${gsheetsPrivateKey}"`,
  ].join('\n')

  console.log(`Writing secrets to "${outFile}"`)

  await fslib.promises.mkdir(pathlib.dirname(outFile), { recursive: true })
  await fslib.promises.writeFile(outFile, tsScript)
}

const validateConfig = (config: Config): Complete<Config> => {
  const { telegramBotToken, gsheetsSpreadsheetId, gsheetsClientEmail, gsheetsPrivateKey } = config

  if (telegramBotToken === undefined) {
    throw new UnsetSecretError('telegramBotToken')
  }

  if (gsheetsSpreadsheetId === undefined) {
    throw new UnsetSecretError('gsheetsSpreadsheetId')
  }

  if (gsheetsClientEmail === undefined) {
    throw new UnsetSecretError('gsheetsClientEmail')
  }

  if (gsheetsPrivateKey === undefined) {
    throw new UnsetSecretError('gsheetsPrivateKey')
  }

  return {
    telegramBotToken,
    gsheetsSpreadsheetId,
    gsheetsClientEmail,
    gsheetsPrivateKey,
  }
}
