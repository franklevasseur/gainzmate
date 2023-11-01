import * as dallox from 'dallox'
import { ApiUtils } from '../api-utils'
import { Bot } from '../bot'
import { z } from 'zod'
import { commands } from './commands'

export const definitions = {
  help_entry: z.object({}),
} satisfies dallox.FlowDefinition

export const implementations = {
  help_entry: async (props) => {
    const api = new ApiUtils(props)
    const allCommands = Object.entries(commands).map(([command, { description }]) => ` ${command} - ${description}`)
    await api.respond(['Available commands:', ...allCommands].join('\n'))
    return null
  },
} satisfies dallox.FlowImplementation<Bot, typeof definitions>
