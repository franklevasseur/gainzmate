import * as bpentities from '@bpinternal/entities'
import * as z from 'zod'

type EntityValue = { name: string }
type ToZodTuple<T extends readonly EntityValue[]> = { [I in keyof T]: z.ZodLiteral<T[I]['name']> }
type ToNameTuple<T extends readonly EntityValue[]> = { [I in keyof T]: T[I]['name'] }
class Enumeration<E extends EntityValue[]> {
  constructor(private _values: E) {}

  public get schemas(): ToZodTuple<E> {
    return this._values.map(({ name }) => z.literal(name)) as ToZodTuple<E>
  }

  public get values(): ToNameTuple<E> {
    return this._values.map(({ name }) => name) as ToNameTuple<E>
  }
}

export type LiftName = (typeof liftEntity)['values'][number]['name']
export const liftEntity = {
  name: 'lift',
  fuzzy: 'medium',
  values: [
    {
      name: 'hook',
      synonyms: ['hook', 'defensive hook', 'floor wrench', 'floor wrist wrench', 'hook curl'],
    },
    {
      name: 'pronation',
      synonyms: ['pronation', 'back pressure', 'back pressure pronation'],
    },
    {
      name: 'riser',
      synonyms: ['riser', 'rise', 'elevation', 'wrist elevation'],
    },
    {
      name: 'hammer',
      synonyms: ['hammer', 'hammer curl', 'hammer curls', 'hammers', 'dumbell hammer curl', 'dumbell hammer curls'],
    },
    {
      name: 'cup',
      synonyms: ['cup', 'containment', 'wristmax', 'mazurenko'],
    },
  ] as const,
} satisfies bpentities.lists.ListEntityDef

export const liftNameEnum = new Enumeration(liftEntity.values)
export const liftNames = liftNameEnum.values
export const liftNameSchema = z.union(liftNameEnum.schemas)

export type LiftSide = (typeof sideEntity)['values'][number]['name']
export const sideEntity = {
  name: 'side',
  fuzzy: 'medium',
  values: [
    {
      name: 'left',
      synonyms: ['left', 'gauche'],
    },
    {
      name: 'right',
      synonyms: ['right', 'droite'],
    },
  ] as const,
} satisfies bpentities.lists.ListEntityDef

export const liftSideEnum = new Enumeration(sideEntity.values)
export const liftSides = liftSideEnum.values
export const liftSideSchema = z.union(liftSideEnum.schemas)
