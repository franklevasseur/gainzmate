import * as svglib from '../svg'
import * as utils from '../utils'
import { PlotElement, Range } from './elements'

export * from './elements'

export type PlotProps = { width: number; height: number; 'background-color'?: svglib.SVGColor }
export class Plot {
  private _elements: PlotElement[] = []

  public constructor(private _props: PlotProps) {}

  public add(element: PlotElement): void {
    this._elements.push(element)
  }

  public render(): string {
    const backgroundColor = this._props['background-color'] ?? '#eee'
    const svg = new svglib.SVG({ ...this._props, style: `background: ${backgroundColor}` })

    const allPoints = this._elements.flatMap(({ box }) => box)

    const xs = allPoints.map((p) => p.x)
    const ys = allPoints.map((p) => p.y)

    const rangeX = this._rangeOf(xs)
    const rangeY = this._rangeOf(ys)

    const { width, height } = this._props
    const scale = { width, height, x: rangeX, y: rangeY }
    const svgs = this._elements.map((e) => e.toSVG(scale)).flatMap((e) => (Array.isArray(e) ? e : [e]))

    for (const el of svgs) {
      svg.add(el)
    }

    return svg.render()
  }

  private _rangeOf = (arr: number[]): Range => {
    const min = utils.min(...arr)
    const max = utils.max(...arr)
    return { min, max }
  }
}
