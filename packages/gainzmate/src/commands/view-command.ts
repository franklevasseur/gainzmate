import { Flow, flow } from 'src/bot'
import { z } from 'zod'
import { Telegram } from 'src/integrations/telegram'
import { Gsheets } from 'src/integrations/gsheets'
import { LiftEvent, parseLift, Date, liftSchema, liftNameSchema, liftSideSchema } from 'src/lift'
import * as utils from 'src/utils'
import * as scat from 'scat'
import { uploadToSpaces } from 'src/spaces'
import crypto from 'crypto'
import * as creds from 'src/creds'

const plotLifts = (lifts: LiftEvent[], title: string) => () => {
  const viewWidth = 800
  const viewHeight = 800

  const plot = new scat.Plot({ width: viewWidth, height: viewHeight })

  const dateAxis = lifts.map(({ date }) => date)
  const dateRange = utils.rangeOf(dateAxis.map((date) => date.getTime()))
  const dateAxisLabels = utils.linspace(dateRange.min, dateRange.max, 10).map((t) => Date.fromTime(t).format('DD/MM'))
  plot.add(
    new scat.PlotAxis({
      direction: 'x',
      graduation: {
        type: 'linear',
        labels: dateAxisLabels,
      },
    })
  )

  const weights = lifts.map(({ weight }) => weight)
  const weightRange = utils.rangeOf(weights)
  const weightAxisLabels = utils.stepspace(weightRange.min, weightRange.max, 2.5).map((x) => x.toFixed(1))
  plot.add(
    new scat.PlotAxis({
      direction: 'y',
      graduation: {
        type: 'linear',
        labels: weightAxisLabels,
      },
    })
  )

  const centerX = (dateRange.max - dateRange.min) / 2
  const topY = (weightRange.max - weightRange.min) * 1.01
  plot.add(
    new scat.PlotTitle({
      text: title,
      x: centerX,
      y: topY,
      strength: 'strong',
    })
  )

  const data = lifts.map(
    ({ date, weight, sets, reps }) =>
      [date.getTime() - dateRange.min, weight - weightRange.min, `${sets}x${reps}`] as const
  )
  for (const [x, y, info] of data) {
    plot.add(
      new scat.PlotPoint({
        x,
        y,
        color: 'blue',
        label: info,
      })
    )
  }

  return plot.render()
}

const hashSvg = (svg: string) => {
  const hash = crypto.createHash('sha256')
  hash.update(svg)
  return hash.digest('hex')
}

const htmlPage = (svg: string) => `
<!DOCTYPE html>
<html>
<body>
${svg}
</body>
</html>
`

const promptNameInput = liftSchema.partial()
const promptSideInput = promptNameInput.extend({ name: liftNameSchema })
const viewableLift = promptSideInput.extend({ side: liftSideSchema })

const choiceMessage = (text: string, options: string[]) =>
  Telegram.createMessage('choice', { text, options: options.map((option) => ({ value: option, label: option })) })
const promptNameQuestion = choiceMessage('What lift ?', ['pronation', 'riser', 'hammer'])
const promptSideQuestion = choiceMessage('What side ?', ['left', 'right'])

const next = (flow: Flow, data: z.infer<typeof promptNameInput>) => {
  const { name, side, weight, sets, reps, notes } = data
  if (name === undefined) {
    return flow.transition(promptName, data)
  }
  if (side === undefined) {
    return flow.transition(promptSide, { ...data, name })
  }
  return flow.transition(renderGraph, { ...data, name, side, sets, weight, reps, notes })
}

export const viewCommand = flow
  .declareNode({ id: 'view_command', schema: z.object({ argument: z.string() }) })
  .execute(async (props) => {
    const { argument } = props.data
    const parsedLift = parseLift(argument)
    return next(flow, parsedLift)
  })

const promptName = flow
  .declareNode({ id: 'prompt_name', schema: promptNameInput })
  .prompt(promptNameQuestion, async (props) => {
    const text = props.message.payload.text as string
    const parseResult = liftNameSchema.safeParse(text)
    if (!parseResult.success) {
      await Telegram.from(props).respondText('Please enter a valid lift name.')
      return flow.transition(promptName, props.data)
    }
    const name = parseResult.data
    return next(flow, { ...props.data, name })
  })

const promptSide = flow
  .declareNode({ id: 'prompt_side', schema: promptSideInput })
  .prompt(promptSideQuestion, async (props) => {
    const text = props.message.payload.text as string
    const parseResult = liftSideSchema.safeParse(text)
    if (!parseResult.success) {
      await Telegram.from(props).respondText('Please enter a valid side.')
      return flow.transition(promptSide, props.data)
    }
    const side = parseResult.data
    return next(flow, { ...props.data, side })
  })

const renderGraph = flow.declareNode({ id: 'render_graph', schema: viewableLift }).execute(async (props) => {
  const lifts = await Gsheets.from(props).getLifts()

  const filteredLifts = lifts.filter(utils.filterBy(props.data))

  if (!filteredLifts.length) {
    await Telegram.from(props).respondText('No lifts found...')
    return null
  }

  let title = `${props.data.name} ${props.data.side}`
  if (props.data.weight) {
    title += ` ${props.data.weight}lbs`
  }
  if (props.data.sets && props.data.reps) {
    title += ` ${props.data.sets}x${props.data.reps}`
  }

  const render = plotLifts(filteredLifts, title)

  const svg = render()
  const html = htmlPage(svg)
  const fileName = `${hashSvg(svg)}.html`
  const { objectUrl } = await uploadToSpaces(
    {
      region: creds.digitalocean.region,
      spaceName: creds.digitalocean.spaceName,
      accessKey: creds.digitalocean.accessKey,
      secretKey: creds.digitalocean.secretKey,
    },
    {
      content: html,
      fileName,
      ACL: 'public-read',
      contentDisposition: 'inline',
      contentType: 'text/html',
    }
  )

  await Telegram.from(props).respond('markdown', {
    markdown: `See [${title}](${objectUrl})`,
  })
  return null
})
