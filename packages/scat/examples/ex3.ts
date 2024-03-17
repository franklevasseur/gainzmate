import * as scat from '../src'
import * as utils from '../src/utils'

type Data = [date: string, lift: string, side: string, weight: number, sets: number, reps: number]
const data: Data[] = [
  ['2023-08-30', 'pronation', 'right', 90, 1, 1],
  ['2023-08-30', 'pronation', 'left', 85, 1, 1],
  ['2023-08-30', 'riser', 'right', 55, 1, 1],
  ['2023-08-30', 'riser', 'left', 55, 1, 1],
  ['2023-09-17', 'pronation', 'right', 70, 5, 5],
  ['2023-09-17', 'pronation', 'left', 70, 5, 5],
  ['2023-09-17', 'riser', 'right', 45, 5, 5],
  ['2023-09-17', 'riser', 'left', 45, 5, 5],
  ['2023-09-26', 'pronation', 'right', 80, 2, 5],
  ['2023-09-26', 'pronation', 'left', 80, 2, 5],
  ['2023-09-26', 'riser', 'right', 50, 3, 5],
  ['2023-09-26', 'riser', 'left', 50, 3, 5],
  ['2023-10-07', 'pronation', 'right', 75, 4, 5],
  ['2023-10-07', 'pronation', 'left', 75, 4, 5],
  ['2023-10-07', 'riser', 'right', 47.5, 4, 5],
  ['2023-10-07', 'riser', 'left', 47.5, 4, 5],
  ['2023-11-01', 'pronation', 'right', 85, 1, 5],
  ['2023-11-01', 'pronation', 'left', 85, 1, 5],
  ['2023-11-01', 'riser', 'right', 55, 1, 1],
  ['2023-11-01', 'riser', 'left', 55, 1, 1],
  ['2023-11-01', 'pronation', 'right', 75, 1, 5],
  ['2023-11-01', 'pronation', 'left', 75, 1, 5],
  ['2023-11-01', 'riser', 'right', 45, 2, 5],
  ['2023-11-01', 'riser', 'left', 45, 2, 5],
  ['2023-11-12', 'hammer', 'right', 60, 1, 3],
  ['2023-11-12', 'hammer', 'left', 60, 1, 3],
  ['2023-11-18', 'pronation', 'right', 90, 1, 7],
  ['2023-11-18', 'pronation', 'left', 90, 1, 1],
  ['2023-11-18', 'pronation', 'right', 97.5, 1, 1],
  ['2023-11-18', 'pronation', 'left', 80, 1, 3],
  ['2023-11-18', 'pronation', 'left', 75, 1, 10],
  ['2023-11-18', 'pronation', 'right', 85, 1, 8],
  ['2023-11-18', 'riser', 'right', 45, 1, 10],
  ['2023-11-18', 'riser', 'left', 45, 1, 10],
  ['2023-11-18', 'riser', 'left', 55, 1, 1],
  ['2023-11-18', 'riser', 'right', 55, 1, 1],
]

type LiftEvent = {
  date: Date
  lift: string
  side: string
  weight: number
  sets: number
  reps: number
}

const events: LiftEvent[] = data.map(([date, lift, side, weight, sets, reps]) => ({
  date: new Date(date),
  lift,
  side,
  weight,
  sets,
  reps,
}))

// const keepHeaviestByDay = (events: LiftEvent[]): LiftEvent[] => {
//   const eventsByDay = utils.groupBy(events, (event) => event.date.toDateString())
//   const heaviestByDay = Object.values(eventsByDay).map((events) =>
//     events.reduce((acc, event) => (event.weight > acc.weight ? event : acc), events[0]!)
//   )
//   return heaviestByDay
// }

const formatDateLabel = (date: Date): string => {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const formattedMonth = month < 10 ? `0${month}` : month
  return `${day}/${formattedMonth}`
}

const pronationRight = events.filter((event) => event.lift === 'pronation' && event.side === 'right')
const pronationLeft = events.filter((event) => event.lift === 'pronation' && event.side === 'left')
const riseRight = events.filter((event) => event.lift === 'riser' && event.side === 'right')
const riseLeft = events.filter((event) => event.lift === 'riser' && event.side === 'left')

const plot = (lifts: LiftEvent[], title: string) => () => {
  const viewWidth = 800
  const viewHeight = 800

  const plot = new scat.Plot({ width: viewWidth, height: viewHeight })

  const dateAxis = lifts.map(({ date }) => date)
  const dateRange = utils.rangeOf(dateAxis.map((date) => date.getTime()))
  const dateAxisLabels = utils.datespace(new Date(dateRange.min), new Date(dateRange.max), 10).map(formatDateLabel)
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
  const weightRange = utils.rangeOf(weights)
  const weightAxisLabels = utils.stepspace(weightRange.min, weightRange.max, 2.5).map((x) => utils.str(x, 1))
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

export const example3 = plot(pronationRight, 'Pronation Right')
export const example4 = plot(pronationLeft, 'Pronation Left')
export const example5 = plot(riseRight, 'Rise Right')
export const example6 = plot(riseLeft, 'Rise Left')
