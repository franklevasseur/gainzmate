import * as scat from '../src'

export const example1 = (): string => {
  const data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((x) => [x, x * x] as const)

  const viewWidth = 800
  const viewHeight = 800

  const plot = new scat.Plot({ width: viewWidth, height: viewHeight, 'background-color': 'white' })

  plot.add(
    new scat.PlotTitle({
      text: 'Pronation Right',
      x: 5,
      y: 105,
      strength: 'strong',
    })
  )

  plot.add(
    new scat.PlotAxis({
      direction: 'x',
      graduation: {
        type: 'linear',
        labels: [0, 2.5, 5, 7.5, 10].map((x) => x.toString()),
      },
    })
  )

  plot.add(
    new scat.PlotAxis({
      direction: 'y',
      graduation: {
        type: 'linear',
        labels: [0, 25, 50, 75, 100].map((x) => x.toString()),
      },
    })
  )

  for (const [xi, yi] of data) {
    plot.add(
      new scat.PlotPoint({
        x: xi,
        y: yi,
      })
    )
  }

  return plot.render()
}
