export const isDef = <T>(value: T | undefined): value is T => value !== undefined

export const avg = (...xs: number[]): number => sum(...xs) / xs.length
export const sum = (...xs: number[]): number => xs.reduce((a, b) => a + b, 0)
export const max = (...xs: number[]): number => Math.max(...xs)
export const min = (...xs: number[]): number => Math.min(...xs)

export const pow = (x: number, n: number): number => Math.pow(x, n)

export function range(start: number, end: number): number[]
export function range(end: number): number[]
export function range(n1: number, n2?: number): number[] {
  if (n2 === undefined) {
    return range(0, n1)
  }
  const xs: number[] = []
  for (let i = n1; i < n2; i++) {
    xs.push(i)
  }
  return xs
}

export function linspace(start: number, end: number, n: number): number[] {
  const step = (end - start) / (n - 1)
  const xs: number[] = []
  for (let i = 0; i < n; i++) {
    xs.push(start + i * step)
  }
  return xs
}

export function stepspace(start: number, end: number, step: number): number[] {
  const n = Math.ceil((end - start) / step)
  return linspace(start, start + n * step, n + 1)
}

export function datespace(start: Date, end: Date, n: number): Date[] {
  const startTime = start.getTime()
  const endTime = end.getTime()
  const timeSpace = linspace(startTime, endTime, n)
  return timeSpace.map((time) => new Date(time))
}

export function zip<T, U>(xs: T[], ys: U[]): [T, U][]
export function zip<T, U, V>(xs: T[], ys: U[], zs: V[]): [T, U, V][]
export function zip<T, U, V, W>(xs: T[], ys: U[], zs: V[], ws: W[]): [T, U, V, W][]
export function zip(...xss: any[][]): any[][] {
  const zipped: any[][] = []
  for (let i = 0; i < xss[0]!.length; i++) {
    const z = xss.map((xs) => xs[i]!)
    zipped.push(z)
  }
  return zipped
}

export const groupBy = <T>(xs: T[], f: (x: T) => string): Record<string, T[]> => {
  const groups: Record<string, T[]> = {}
  for (const x of xs) {
    const key = f(x)
    if (groups[key] === undefined) {
      groups[key] = []
    }
    groups[key]!.push(x)
  }
  return groups
}

// format number with n decimals
export const str = (x: number, n: number = 1): string => x.toFixed(n)

export const rangeOf = (xs: number[]): { min: number; max: number } => {
  const min = Math.min(...xs)
  const max = Math.max(...xs)
  return { min, max }
}
