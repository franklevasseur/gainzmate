import * as scat from '../src'
import * as utils from '../src/utils'

const y1 = (x: number): number => utils.pow(x, 2)
const y2 = (x: number): number => -2 * utils.pow(x, 2) + 15
const y3 = (x: number): number => 2 * utils.pow(x, 2) + 15

export const example2 = (): string => {
  const xs = utils.range(-10, 10)
  const ys1 = xs.map(y1)
  const ys2 = xs.map(y2)
  const ys3 = xs.map(y3)

  const viewWidth = 800
  const viewHeight = 800

  const plot = new scat.Plot({ width: viewWidth, height: viewHeight })

  plot.add(
    new scat.PlotAxis({
      direction: 'x',
      title: 'x',
      graduation: {
        type: 'linear',
        labels: xs.map((x) => x.toString()),
      },
    }),
  )

  const allYs = [...ys1, ...ys2, ...ys3]
  const rangeY = { min: utils.min(...allYs), max: utils.max(...allYs) }
  plot.add(
    new scat.PlotAxis({
      direction: 'y',
      title: 'y',
      graduation: {
        type: 'linear',
        labels: utils
          .linspace(rangeY.min, rangeY.max, 10)
          .map((x) => Math.round(x * 10) / 10)
          .map((x) => x.toString()),
      },
    }),
  )

  const ys = utils.zip(ys1, ys2, ys3)
  const data = utils.zip(xs, ys)
  for (const [xi, [yi1, yi2, yi3]] of data) {
    plot.add(
      new scat.PlotPoint({
        x: xi,
        y: yi1,
        color: 'red',
      }),
    )

    plot.add(
      new scat.PlotPoint({
        x: xi,
        y: yi2,
        color: 'blue',
      }),
    )

    plot.add(
      new scat.PlotPoint({
        x: xi,
        y: yi3,
        color: 'green',
      }),
    )
  }

  return plot.render()
}
