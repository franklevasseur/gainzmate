import { ApiUtils } from '../api-utils'
import { MessageHandler } from '../bot'
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

type AvailableCommand = keyof typeof commands
const isAvailableCommand = (command: string): command is AvailableCommand => command in commands

export const handleCommand: MessageHandler = async (props) => {
  const { message } = props

  const api = new ApiUtils(props)

  if (message.type !== 'text') {
    await api.respond('Sorry, I only understand text messages.')
    return
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

  await commands[command].handler({ ...props, arg, api })
}
