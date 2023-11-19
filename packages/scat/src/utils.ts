export const isDef = <T>(value: T | undefined): value is T => value !== undefined

export const avg = (...xs: number[]): number => sum(...xs) / xs.length
export const sum = (...xs: number[]): number => xs.reduce((a, b) => a + b, 0)
export const max = (...xs: number[]): number => Math.max(...xs)
export const min = (...xs: number[]): number => Math.min(...xs)

export const range = (n: number): number[] => [...Array(n).keys()]
