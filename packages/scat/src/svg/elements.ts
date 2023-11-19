import * as tag from './tag'

export type SVGColor = 'red' | 'blue' | 'green' | 'black' | 'white'

export type SVGLineProps = {
  x1: number
  y1: number
  x2: number
  y2: number
  stroke: SVGColor
  'stroke-width'?: number
}

export type SVGCircleProps = {
  cx: number
  cy: number
  r: number
  fill: SVGColor
  stroke?: SVGColor
}

export type SVGTextProps = {
  x: number
  y: number
  text: string
  fill?: SVGColor
  'font-size'?: string
  style?: string
  transform?: string
  textLength?: number
}

export abstract class SVGElement {
  public abstract render(): string
}

export class SVGLine extends SVGElement {
  public constructor(private _props: SVGLineProps) {
    super()
  }
  public render(): string {
    return tag.createSelfClosing('line', this._props)
  }
}

export class SVGCircle extends SVGElement {
  public constructor(private _props: SVGCircleProps) {
    super()
  }
  public render(): string {
    return tag.createSelfClosing('circle', this._props)
  }
}

export class SVGText extends SVGElement {
  public constructor(private _props: SVGTextProps) {
    super()
  }
  public render(): string {
    const textTag = tag.create('text', this._props)
    return `${textTag.open}${this._props.text}${textTag.close}`
  }
}
