import { z } from '@botpress/sdk'
import { flow, FlowNode } from '../bot'
import { Telegram } from '../integrations/telegram'
import { linkCommand } from './link-command'
import { listCommand } from './list-command'
import { newCommand } from './new-command'
import { viewCommand } from './view-command'

const commandArgSchema = z.object({ argument: z.string() })
type ZodCommandArg = typeof commandArgSchema
export type Command = {
  description: string
  entry: FlowNode<ZodCommandArg>
}

const helpCommand = flow.declareNode({ id: 'help_command', schema: commandArgSchema }).execute(async (props) => {
  const help = Object.entries(commands)
    .map(([name, { description }]) => `${name} - ${description}`)
    .join('\n')
  await Telegram.from(props).respondText(help)
  return null
})

const resetCommand = flow.declareNode({ id: 'reset_command', schema: commandArgSchema }).execute(async () => null)

const commands = {
  '/help': {
    description: 'Display this help message',
    entry: helpCommand,
  },
  '/new': {
    description: 'Create a new lift entry',
    entry: newCommand,
  },
  '/list': {
    description: 'List existing lift entries',
    entry: listCommand,
  },
  '/link': {
    description: 'Get a link to the Google Sheet',
    entry: linkCommand,
  },
  '/reset': {
    description: 'Reset the conversation state at any point during an exchange',
    entry: resetCommand,
  },
  '/view': {
    description: 'View a graph of your lifts',
    entry: viewCommand,
  },
} satisfies Record<string, Command>

type AvailableCommand = keyof typeof commands
const isAvailableCommand = (cmd: string): cmd is AvailableCommand => cmd in commands

export const entry = flow.declareNode({ id: 'entry', schema: z.object({}) }).execute(async (props) => {
  const { message } = props

  const api = Telegram.from(props)

  if (message.type !== 'text') {
    await api.respondText('Sorry, I only understand text messages.')
    return null
  }

  const sep = ' '
  const text: string = message.payload.text
  const [cmd, ...args] = text.trim().split(sep)
  const argument = args.join(sep)
  let command: keyof typeof commands
  if (!cmd) {
    await api.respondText('Please enter a command.')
    command = '/help'
  } else if (!isAvailableCommand(cmd)) {
    await api.respondText(`Unknown command: ${cmd}`)
    command = '/help'
  } else {
    command = cmd
  }

  return flow.transition(commands[command].entry, { argument })
})
