import 'dotenv/config'
import yargs, { parseEnv, cleanupConfig } from '@bpinternal/yargs-extra'
import { configSchema } from './config'
import { main } from './main'

void yargs
  .command(
    '$0 <outFile>',
    'Generate Secrets',
    (y) =>
      y.options(configSchema).positional('outFile', {
        type: 'string',
        demandOption: true,
      }),
    async (argv) => {
      const env = parseEnv(configSchema)
      const config = cleanupConfig(configSchema, { ...env, ...argv })
      await main(config, argv.outFile)
    },
  )
  .help()
  .showHelpOnFail(false)
  .parse()
