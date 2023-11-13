import { MessageHandlerProps } from 'src/bot'
import { Lift, LiftEvent } from 'src/parse-lift'

export const sheetName = 'data' as const

export const columns = {
  date: 'A',
  name: 'B',
  side: 'C',
  weight: 'D',
  sets: 'E',
  reps: 'F',
  score: 'G',
  notes: 'H',
} as const

export const range = `${sheetName}!A2:H999`

export class Gsheets {
  private constructor(private readonly props: MessageHandlerProps) {}

  public static from = (props: MessageHandlerProps) => new Gsheets(props)

  public async appendLift(lift: Lift) {
    const date = new Date().toISOString()
    const score = 0
    const row = [date, lift.name, lift.side, lift.weight, lift.sets, lift.reps, score, lift.notes]
    await this.props.client.callAction({
      type: 'gsheets:appendValues',
      input: {
        range,
        values: [row],
      },
    })
  }

  public async getLifts(): Promise<LiftEvent[]> {
    const { output } = await this.props.client.callAction({
      type: 'gsheets:getValues',
      input: {
        range,
      },
    })

    const values = output.values
    if (!values) {
      return []
    }

    return values.map((row) => ({
      date: new Date(row[0]),
      name: `${row[1]}`,
      side: `${row[2]}`,
      weight: Number(row[3]),
      sets: Number(row[4]),
      reps: Number(row[5]),
      notes: `${row[7]}`,
    }))
  }
}
