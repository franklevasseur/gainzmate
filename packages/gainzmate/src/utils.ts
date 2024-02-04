export type FilerFn<T extends object> = (obj: T) => boolean
export const filterBy =
  <T extends object>(f: Partial<T>): FilerFn<T> =>
  (obj: T) => {
    for (const k in f) {
      if (f[k] !== undefined && f[k] !== obj[k]) {
        return false
      }
    }
    return true
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

export const rangeOf = (xs: number[], unit: number | null = null): { min: number; max: number } => {
  const min = Math.min(...xs)
  const max = Math.max(...xs)
  if (unit === null) {
    return { min, max }
  }

  const fakeMin = Math.floor(min / unit) * unit
  const fakeMax = Math.ceil(max / unit) * unit
  return { min: fakeMin, max: fakeMax }
}
