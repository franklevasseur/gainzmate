import { parseLift } from './parser'
import { test, expect } from 'vitest'
import { Lift } from './types'

const pronation = 'pronation' as const
const riser = 'riser' as const
const left = 'left' as const
const right = 'right' as const

test('parser should parse lift name', () => {
  expect(parseLift('pronation').name).toBe(pronation)
  expect(parseLift('prnation').name).toBe(pronation)
  expect(parseLift('pronaton').name).toBe(pronation)

  expect(parseLift('riser').name).toBe(riser)
  expect(parseLift('rise').name).toBe(riser)
  expect(parseLift('risr').name).toBe(riser)

  expect(parseLift('bench').name).toBe(undefined) // unknown lift
})

test('parser should parse lift side', () => {
  expect(parseLift('left').side).toBe(left)
  expect(parseLift('gauche').side).toBe(left)

  expect(parseLift('right').side).toBe(right)
  expect(parseLift('droite').side).toBe(right)

  expect(parseLift('middle').side).toBe(undefined) // unknown side
})

test('parser should parse lift weight', () => {
  expect(parseLift('10lbs').weight).toBe(10)
  expect(parseLift('10 lbs').weight).toBe(10)
  expect(parseLift('10lb').weight).toBe(10)
  expect(parseLift('10 kg').weight).toBe(22)
  expect(parseLift('10kg').weight).toBe(22)
})

test('parser should parse lift sets and reps', () => {
  let tmp: Partial<Lift> = {}

  tmp = parseLift('5x5')
  expect(tmp.sets).toBe(5)
  expect(tmp.reps).toBe(5)

  tmp = parseLift('3x10')
  expect(tmp.sets).toBe(3)
  expect(tmp.reps).toBe(10)
})

test('parser should parse lift reps of a single set', () => {
  let tmp: Partial<Lift> = {}

  tmp = parseLift('I did 5')
  expect(tmp.sets).toBe(1)
  expect(tmp.reps).toBe(5)

  tmp = parseLift('12 times')
  expect(tmp.sets).toBe(1)
  expect(tmp.reps).toBe(12)
})

test('parser should parse notes', () => {
  expect(parseLift('I did 5 (this was too heavy)').notes).toBe('this was too heavy')
})

test('parser should parse every single fields every time', () => {
  const utt = 'I did 5x5 prontion 85lbs (this was too heavy)'
  const lift = parseLift(utt)
  expect(lift.name).toBe(pronation)
  expect(lift.side).toBe(undefined)
  expect(lift.weight).toBe(85)
  expect(lift.sets).toBe(5)
  expect(lift.reps).toBe(5)
  expect(lift.notes).toBe('this was too heavy')
})
