import { z } from 'zod'
import { ApiUtils } from '../api-utils'
import { Bot, bot } from '../bot'
import * as dallox from 'dallox'
import { commands } from './commands'
import * as helpCommand from './help'
import * as newCommand from './new'

type AvailableCommand = keyof typeof commands
const isAvailableCommand = (command: string): command is AvailableCommand => command in commands

const definitions = {
  ...helpCommand.definitions,
  ...newCommand.definitions,
  entry: z.object({}),
} satisfies dallox.FlowDefinition

const implementations: dallox.FlowImplementation<Bot, typeof definitions> = {
  ...helpCommand.implementations,
  ...newCommand.implementations,
  entry: async (
    props: dallox.NodeImplementationInput<Bot, typeof definitions.entry, typeof definitions>
  ): Promise<dallox.NodeImplementationOutput<Bot, typeof definitions.entry, typeof definitions>> => {
    const { message } = props

    const api = new ApiUtils(props)

    if (message.type !== 'text') {
      await api.respond('Sorry, I only understand text messages.')
      return null
    }

    const sep = ' '
    const text: string = message.payload.text
    const [cmd, ...args] = text.trim().split(sep)
    const arg = args.join(sep)
    let command: keyof typeof commands
    if (!cmd) {
      await api.respond('Please enter a command.')
      command = '/help'
    } else if (!isAvailableCommand(cmd)) {
      await api.respond(`Unknown command: ${cmd}`)
      command = '/help'
    } else {
      command = cmd
    }

    if (command === '/help') {
      return {
        transition: 'hold',
        next: 'help_entry',
        data: {},
      }
    }

    if (command === '/new') {
      api.respond('The new command is not yet implemented.')
      return null
    }

    return null
  },
}

export const flow = new dallox.Flow(bot, definitions, implementations, {
  next: 'entry',
  data: {},
})
