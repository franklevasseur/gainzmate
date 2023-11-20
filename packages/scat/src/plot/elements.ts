import * as svglib from '../svg'
import * as consts from './consts'
import * as utils from '../utils'

export type Coord = { x: number; y: number }

export type Range = { min: number; max: number }
export type Scale = { width: number; height: number; x: Range; y: Range }
export type Strength = keyof typeof consts.STRENGTH_FACTOR

export abstract class PlotElement {
  public abstract get box(): Coord[] // points considered when computing the scale
  public abstract toSVG(scale: Scale): svglib.SVGElement | svglib.SVGElement[]

  protected padScale(scale: Scale): Scale {
    const { width, height, x, y } = scale
    const dx = x.max - x.min
    const dy = y.max - y.min

    const minX = x.min - dx * consts.PADDING_FACTOR
    const minY = y.min - dy * consts.PADDING_FACTOR
    const maxX = x.max + dx * consts.PADDING_FACTOR
    const maxY = y.max + dy * consts.PADDING_FACTOR

    return {
      width,
      height,
      x: { min: minX, max: maxX },
      y: { min: minY, max: maxY },
    }
  }

  protected strokeWidth(scale: Scale, strength: Strength = 'medium'): number {
    const L = utils.max(scale.width, scale.height)
    const strengthFactor = consts.STRENGTH_FACTOR[strength]
    return L * consts.STROKE_WIDTH_FACTOR * strengthFactor
  }

  protected fontSize(scale: Scale, strength: Strength = 'medium'): number {
    const L = utils.max(scale.width, scale.height)
    const strengthFactor = consts.STRENGTH_FACTOR[strength]
    return L * consts.FONT_SIZE_FACTOR * strengthFactor
  }

  protected textSvgSize(text: string, fontSize: number) {
    const svgWidth = text.length * fontSize * 0.4
    const svgHeight = fontSize * 0.2
    return { width: svgWidth, height: svgHeight }
  }
}

export type PlotLineProps = {
  x1: number
  y1: number
  x2: number
  y2: number
  strength?: Strength
  color?: svglib.SVGColor
}

export type PlotPointProps = {
  x: number
  y: number
  label?: string
  strength?: Strength
  color?: svglib.SVGColor
}

export class PlotPoint extends PlotElement {
  public constructor(private _props: PlotPointProps) {
    super()
  }

  public get box(): Coord[] {
    return [this._props]
  }

  public toSVG(scale: Scale): svglib.SVGElement[] {
    scale = this.padScale(scale)

    const { x, y } = this._props
    const { width, height } = scale

    const dx = scale.x.max - scale.x.min
    const dy = scale.y.max - scale.y.min

    const scaledX = ((x - scale.x.min) / dx) * width
    const scaledY = ((y - scale.y.min) / dy) * height

    const svgX = scaledX
    const svgY = height - scaledY

    const elements: svglib.SVGElement[] = []

    elements.push(
      new svglib.SVGCircle({
        cx: svgX,
        cy: svgY,
        r: this.strokeWidth(scale, this._props.strength),
        fill: this._props.color ?? 'red',
      })
    )

    if (this._props.label) {
      const x = svgX + scale.width * 0.01
      const y = svgY - scale.height * 0.01
      elements.push(new svglib.SVGText({ x, y, text: this._props.label }))
    }

    return elements
  }
}

export class PlotLine extends PlotElement {
  public constructor(private _props: PlotLineProps) {
    super()
  }

  public get box(): Coord[] {
    const { x1, y1, x2, y2 } = this._props
    return [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
    ]
  }

  public toSVG(scale: Scale): svglib.SVGElement {
    scale = this.padScale(scale)

    const { x1, y1, x2, y2 } = this._props
    const { width, height } = scale

    const dx = scale.x.max - scale.x.min
    const dy = scale.y.max - scale.y.min

    const scaledX1 = ((x1 - scale.x.min) / dx) * width
    const scaledY1 = ((y1 - scale.y.min) / dy) * height
    const scaledX2 = ((x2 - scale.x.min) / dx) * width
    const scaledY2 = ((y2 - scale.y.min) / dy) * height

    const svgX1 = scaledX1
    const svgY1 = height - scaledY1
    const svgX2 = scaledX2
    const svgY2 = height - scaledY2

    return new svglib.SVGLine({
      x1: svgX1,
      y1: svgY1,
      x2: svgX2,
      y2: svgY2,
      stroke: 'black',
      'stroke-width': this.strokeWidth(scale, this._props.strength),
    })
  }
}

export type PlotTitleProps = {
  text: string
  x: number
  y: number
  strength?: Strength
  direction?: 'x' | 'y'
}

export class PlotTitle extends PlotElement {
  public constructor(private _props: PlotTitleProps) {
    super()
  }

  public get box(): Coord[] {
    return []
  }

  public toSVG(scale: Scale): svglib.SVGElement {
    scale = this.padScale(scale)

    const dx = scale.x.max - scale.x.min
    const dy = scale.y.max - scale.y.min

    const { width, height } = scale
    const { x, y, text } = this._props

    const scaledX = ((x - scale.x.min) / dx) * width
    const scaledY = ((y - scale.y.min) / dy) * height

    const svgX = scaledX
    const svgY = height - scaledY

    const fontSize = this.fontSize(scale, this._props.strength)

    const { width: svgWidth, height: svgHeight } = this.textSvgSize(text, fontSize)

    const centeredSvgX = svgX - svgWidth / 2
    const centeredSvgY = svgY + svgHeight / 2

    let transform = undefined
    if (this._props.direction === 'y') {
      transform = `rotate(-90, ${svgX}, ${svgY})`
    }

    return new svglib.SVGText({
      x: centeredSvgX,
      y: centeredSvgY,
      text,
      'font-size': `${fontSize}`,
      transform,
    })
  }
}

export type Graduation = {
  type: 'linear'
  labels: string[]
}

export type AxisProps = {
  direction: 'x' | 'y'
  title?: string
  graduation: Graduation
}

export class PlotAxis extends PlotElement {
  public constructor(private _props: AxisProps) {
    super()
  }

  public get box(): Coord[] {
    return []
  }

  public toSVG(scale: Scale): svglib.SVGElement[] {
    const dx = scale.x.max - scale.x.min
    const dy = scale.y.max - scale.y.min

    const xAxisPad = consts.PADDING_FACTOR * dx * 0.3
    const yAxisPad = consts.PADDING_FACTOR * dy * 0.3

    const N = this._props.graduation.labels.length

    if (this._props.direction === 'x') {
      const line = new PlotLine({
        x1: scale.x.min,
        x2: scale.x.max,
        y1: 0,
        y2: 0,
        strength: 'weak',
      })

      const title = this._props.title
        ? new PlotTitle({
            text: this._props.title,
            x: (scale.x.max - scale.x.min) / 2,
            y: -yAxisPad,
            strength: 'medium',
          })
        : undefined

      const graduationMarks = utils.range(N).flatMap((i) => {
        const progress = i / (N - 1)
        const x = scale.x.min + progress * dx
        const y1 = scale.y.min
        const y2 = scale.y.max
        const line = new PlotLine({
          x1: x,
          x2: x,
          y1,
          y2,
          strength: 'weakest',
        })

        const label = new PlotTitle({
          text: this._props.graduation.labels[i]!,
          x,
          y: -yAxisPad,
        })

        return [line, label]
      })

      return [line, title, ...graduationMarks].filter(utils.isDef).map((x) => x.toSVG(scale))
    } else {
      const line = new PlotLine({
        x1: 0,
        x2: 0,
        y1: scale.y.min,
        y2: scale.y.max,
        strength: 'weak',
      })

      const title = this._props.title
        ? new PlotTitle({
            text: this._props.title,
            x: -xAxisPad,
            y: (scale.y.max - scale.y.min) / 2,
            strength: 'medium',
            direction: 'y',
          })
        : undefined

      const graduationMarks = utils.range(N).flatMap((i) => {
        const progress = i / (N - 1)
        const y = scale.y.min + progress * dy
        const x1 = scale.x.min
        const x2 = scale.x.max

        const line = new PlotLine({
          x1,
          x2,
          y1: y,
          y2: y,
          strength: 'weakest',
        })

        const text = this._props.graduation.labels[i]!
        const label = new PlotTitle({
          text,
          x: -xAxisPad,
          y,
          direction: 'y',
        })

        return [line, label]
      })

      return [line, title, ...graduationMarks].filter(utils.isDef).map((x) => x.toSVG(scale))
    }
  }
}
