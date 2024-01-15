import * as utils from '../utils'

const _toPropString = (props: Record<string, string | number | undefined>): string =>
  Object.entries(props)
    .filter(utils.isDef)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ')

export const create = (name: string, props: Record<string, string | number | undefined>) => ({
  open: `<${name} ${_toPropString(props)}>`,
  close: `</${name}>`,
})

export const createSelfClosing = (name: string, props: Record<string, string | number | undefined>): string =>
  `<${name} ${_toPropString(props)} />`
