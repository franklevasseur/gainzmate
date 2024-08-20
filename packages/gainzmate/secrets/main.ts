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
  const {
    telegramBotToken,
    gsheetsSpreadsheetId,
    gsheetsClientEmail,
    gsheetsPrivateKey,
    digitaloceanSpaceRegion,
    digitaloceanSpaceName,
    digitaloceanSpaceAccessKey,
    digitaloceanSpaceSecretKey,
  } = validateConfig(config)

  const tsScript = [
    `export const telegramBotToken = "${telegramBotToken}"`,
    `export const gsheetsSpreadsheetId = "${gsheetsSpreadsheetId}"`,
    `export const gsheetsClientEmail = "${gsheetsClientEmail}"`,
    `export const gsheetsPrivateKey = "${gsheetsPrivateKey}"`,
    `export const digitaloceanSpaceRegion = "${digitaloceanSpaceRegion}"`,
    `export const digitaloceanSpaceName = "${digitaloceanSpaceName}"`,
    `export const digitaloceanSpaceAccessKey = "${digitaloceanSpaceAccessKey}"`,
    `export const digitaloceanSpaceSecretKey = "${digitaloceanSpaceSecretKey}"`,
  ].join('\n')

  console.log(`Writing secrets to "${outFile}"`)

  await fslib.promises.mkdir(pathlib.dirname(outFile), { recursive: true })
  await fslib.promises.writeFile(outFile, tsScript)
}

const validateConfig = (config: Config): Complete<Config> => {
  const {
    telegramBotToken,
    gsheetsSpreadsheetId,
    gsheetsClientEmail,
    gsheetsPrivateKey,
    digitaloceanSpaceRegion,
    digitaloceanSpaceName,
    digitaloceanSpaceAccessKey,
    digitaloceanSpaceSecretKey,
  } = config

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

  if (digitaloceanSpaceRegion === undefined) {
    throw new UnsetSecretError('digitaloceanSpaceRegion')
  }

  if (digitaloceanSpaceName === undefined) {
    throw new UnsetSecretError('digitaloceanSpaceName')
  }

  if (digitaloceanSpaceAccessKey === undefined) {
    throw new UnsetSecretError('digitaloceanSpaceAccessKey')
  }

  if (digitaloceanSpaceSecretKey === undefined) {
    throw new UnsetSecretError('digitaloceanSpaceSecretKey')
  }

  return {
    telegramBotToken,
    gsheetsSpreadsheetId,
    gsheetsClientEmail,
    gsheetsPrivateKey,
    digitaloceanSpaceRegion,
    digitaloceanSpaceName,
    digitaloceanSpaceAccessKey,
    digitaloceanSpaceSecretKey,
  }
}
