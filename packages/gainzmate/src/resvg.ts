import * as resvg from '@resvg/resvg-wasm'
import axios from 'axios'

const WASM_URL = 'https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm'

let _initialized = false
const _init = async () => {
  const t0 = Date.now()
  console.log('[INIT] fetching wasm')
  const resp = await axios.get(WASM_URL, { responseType: 'arraybuffer' })
  const dt1 = Date.now() - t0
  console.log(`[INIT] initializing wasm (${dt1}ms)`)
  await resvg.initWasm(resp.data)
  const dt2 = Date.now() - t0
  console.log(`[INIT] done (${dt2}ms)`)
  _initialized = true
}

let initPromise: Promise<void> = _init()
void initPromise

export const render = async (svg: string): Promise<Uint8Array> => {
  if (!_initialized) {
    await initPromise
  }

  const t0 = Date.now()
  console.log('[START] rendering png')
  const tmp = new resvg.Resvg(svg)
  const ok = tmp.render()
  const dt = Date.now() - t0
  console.log(`[DONE] rendering png (${dt}ms)`)
  return ok.asPng()
}
