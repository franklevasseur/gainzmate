import * as resvg from '@resvg/resvg-wasm'
import axios from 'axios'
import type * as scat from 'scat'
import * as fonts from './fonts'

const font = {
  'Times New Roman': Buffer.from(fonts.times_new_roman, 'base64'),
  Arial: Buffer.from(fonts.arial, 'base64'),
} satisfies Record<scat.SVGFontFamily, Uint8Array>

const WASM_URL = 'https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm'

class Step {
  private _t0: number
  private constructor(private name: string) {
    this._t0 = Date.now()
  }
  public static start(name: string) {
    console.log(`[START] ${name}`)
    return new Step(name)
  }

  public end() {
    const dt = Date.now() - this._t0
    console.log(`[END] ${this.name} (${dt}ms)`)
  }
}

type InitStatus = 'cold' | 'warming' | 'warmed'

let status: InitStatus = 'cold'
const init = async () => {
  status = 'warming'

  const fetchStep = Step.start('fetching wasm')
  const resp = await axios.get(WASM_URL, { responseType: 'arraybuffer' })
  fetchStep.end()

  const initStep = Step.start('initializing wasm')
  await resvg.initWasm(resp.data)
  initStep.end()

  status = 'warmed'
}

const initPromise: Promise<void> = init()

export const render = async (svg: string): Promise<Uint8Array> => {
  if (status !== 'warmed') {
    await initPromise
  }

  const renderStep = Step.start('rendering png')
  const tmp = new resvg.Resvg(svg, {
    font: {
      fontBuffers: Object.values(font),
      defaultFontFamily: 'Arial',
    },
  })
  const img = tmp.render()
  renderStep.end()
  return img.asPng()
}
