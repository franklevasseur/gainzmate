import { newCmd } from './new'
import * as types from './types'

export * from './types'

export const commands = {
  '/help': {
    description: 'Show this help message',
    handler: async ({ api }) => {
      const allCommands = Object.entries(commands).map(([command, { description }]) => ` ${command} - ${description}`)
      await api.respond(['Available commands:', ...allCommands].join('\n'))
    },
  },
  '/new': newCmd,
} satisfies Record<string, types.Command>
