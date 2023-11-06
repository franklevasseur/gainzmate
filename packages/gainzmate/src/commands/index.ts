import { z } from 'zod'
import { Api } from 'src/api-utils'
import { flow, FlowNode } from 'src/bot'
import { newCommand } from './new-command'

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
  Api.from(props).respondText(help)
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
  '/reset': {
    description: 'Reset the conversation state at any point during an exchange',
    entry: resetCommand,
  },
} satisfies Record<string, Command>

type AvailableCommand = keyof typeof commands
const isAvailableCommand = (cmd: string): cmd is AvailableCommand => cmd in commands

export const entry = flow.declareNode({ id: 'entry', schema: z.object({}) }).execute(async (props) => {
  const { message } = props

  const api = Api.from(props)

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
