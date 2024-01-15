const configKeys = [
  'TELEGRAM_BOT_TOKEN',
  'GSHEETS_SHEET_ID',
  'GSHEETS_CLIENT_EMAIL',
  'GSHEETS_PRIVATE_KEY',
  'DIGITALOCEAN_REGION',
  'DIGITALOCEAN_SPACE_NAME',
  'DIGITALOCEAN_ACCESS_KEY',
  'DIGITALOCEAN_SECRET_KEY',
] as const

type ConfigKey = typeof configKeys[number]

const readEnv = (key: ConfigKey): string => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing env var: ${key}`)
  }
  return value
}

export namespace telegram {
  export const prodBotToken = readEnv('TELEGRAM_BOT_TOKEN')
}

export namespace gsheets {
  export const spreadsheetId = readEnv('GSHEETS_SHEET_ID')
  export const clientEmail = readEnv('GSHEETS_CLIENT_EMAIL')
  export const privateKey = readEnv('GSHEETS_PRIVATE_KEY')
}

export namespace digitalocean {
  export const region = readEnv('DIGITALOCEAN_REGION')
  export const spaceName = readEnv('DIGITALOCEAN_SPACE_NAME')
  export const accessKey = readEnv('DIGITALOCEAN_ACCESS_KEY')
  export const secretKey = readEnv('DIGITALOCEAN_SECRET_KEY')
}
