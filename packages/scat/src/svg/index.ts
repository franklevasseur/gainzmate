import { SVGElement } from './elements'
import * as tag from './tag'

export * from './elements'

export type SVGProps = {
  width: number
  height: number
  style?: string
}

export class SVG {
  private _elements: SVGElement[] = []
  public constructor(private _props: SVGProps) {}

  public add(element: SVGElement): void {
    this._elements.push(element)
  }

  public render(): string {
    const svgTag = tag.create('svg', this._props)
    const els = this._elements
      .map((e) => e.render())
      .map((x) => `  ${x}`)
      .join('\n')
    return `
${svgTag.open}
${els}
${svgTag.close}
    `
  }
}
