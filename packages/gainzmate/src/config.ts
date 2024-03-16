import { z } from 'zod'
import type { MessageHandlerProps } from './bot'

export type BotConfig = z.infer<typeof botConfigSchema>

export const botConfigSchema = z.object({
  spaceRegion: z.string(),
  spaceName: z.string(),
  spaceAccessKey: z.string(),
  spaceSecretKey: z.string(),
})

type ParseResult =
  | {
      success: true
      data: BotConfig
    }
  | {
      success: false
      error: string
    }

export const safeParseConfig = (props: MessageHandlerProps): ParseResult => {
  try {
    const {
      ctx: { configuration },
    } = props
    const json = JSON.parse(configuration.payload)
    const parseRes = botConfigSchema.safeParse(json)
    if (parseRes.success) {
      return parseRes
    }
    return {
      success: false,
      error: parseRes.error.message,
    }
  } catch (thrown) {
    const err = thrown instanceof Error ? thrown : new Error(`${thrown}`)
    return {
      success: false,
      error: err.message,
    }
  }
}
