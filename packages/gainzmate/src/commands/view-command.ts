// TODO: re-enable prettier in this file

import crypto from 'crypto'
import * as scat from 'scat'
import { Flow, flow } from 'src/bot'
import { Gsheets } from 'src/integrations/gsheets'
import { Telegram } from 'src/integrations/telegram'
import { LiftEvent, parseLift, DateTime, liftSchema, liftNameSchema, liftSideSchema, liftNames, liftSides } from 'src/lift'
import * as resvege from 'src/resvg'
import * as spaces from 'src/spaces'
import * as utils from 'src/utils'
import { z } from 'zod'
import * as secrets from '.botpress/secrets'

const creds: spaces.SpaceCredentials = {
  region: secrets.digitaloceanSpaceRegion,
  name: secrets.digitaloceanSpaceName,
  accessKey: secrets.digitaloceanSpaceAccessKey,
  secretKey: secrets.digitaloceanSpaceSecretKey,
}


const plotLifts = (lifts: LiftEvent[], title: string) => () => {
  const viewWidth = 800
  const viewHeight = 800

  const plot = new scat.Plot({ width: viewWidth, height: viewHeight })

  const dateAxis = lifts.map(({ date }) => date)
  const dateRange = utils.rangeOf(dateAxis.map((date) => date.getTime()))
  const dateAxisLabels = utils.linspace(dateRange.min, dateRange.max, 10).map((t) => DateTime.fromTime(t).format('DD/MM'))
  plot.add(
    new scat.PlotAxis({
      direction: 'x',
      graduation: {
        type: 'linear',
        labels: dateAxisLabels,
      },
    }),
  )

  const weights = lifts.map(({ weight }) => weight)

  const weightUnit = 2.5
  const weightRange = utils.rangeOf(weights, weightUnit)

  const weightAxisLabels = utils.stepspace(weightRange.min, weightRange.max, weightUnit).map((x) => x.toFixed(1))

  plot.add(
    new scat.PlotAxis({
      direction: 'y',
      graduation: {
        type: 'linear',
        labels: weightAxisLabels,
      },
    }),
  )

  const centerX = (dateRange.max - dateRange.min) / 2
  const topY = (weightRange.max - weightRange.min) * 1.01
  plot.add(
    new scat.PlotTitle({
      text: title,
      x: centerX,
      y: topY,
      strength: 'strong',
    }),
  )

  plot.add(
    new scat.PlotPoint({
      x: 0,
      y: 0,
      color: 'black',
      strength: 'weakest',
    })
  )

  plot.add(
    new scat.PlotPoint({
      x: dateRange.max - dateRange.min,
      y: weightRange.max - weightRange.min,
      color: 'black',
      strength: 'weakest',
    })
  )

  const data = lifts.map(
    ({ date, weight, sets, reps }) =>
      [date.getTime() - dateRange.min, weight - weightRange.min, `${sets}x${reps}`] as const,
  )
  for (const [x, y, info] of data) {
    plot.add(
      new scat.PlotPoint({
        x,
        y,
        color: 'blue',
        label: info,
      }),
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
const promptNameQuestion = choiceMessage('What lift ?', liftNames)
const promptSideQuestion = choiceMessage('What side ?', liftSides)

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
  const baseName = hashSvg(svg)

  const svgFileName = `${baseName}.html`
  const { objectUrl: svgUrl } = await spaces.upload(
    creds,
    {
      content: html,
      fileName: svgFileName,
      ACL: 'public-read',
      contentDisposition: 'inline',
      contentType: 'text/html',
    },
  )

  await Telegram.from(props).respond('markdown', {
    markdown: `See SVG ${title} [here](${svgUrl})\\.`,
  })

  const png = await resvege.render(svg)

  const pngFileName = `${baseName}.png`
  const { objectUrl: pngUrl } = await spaces.upload(
    creds,
    {
      content: png,
      fileName: pngFileName,
      ACL: 'public-read',
      contentDisposition: 'inline',
      contentType: 'image/png',
    },
  )

  await Telegram.from(props).respondText(`See PNG ${title} below:`)
  await Telegram.from(props).respond('image', {
    imageUrl: pngUrl,
  })

  return null
})
