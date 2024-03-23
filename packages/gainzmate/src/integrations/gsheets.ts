import { MessageHandlerProps } from 'src/bot'
import { Lift, LiftEvent, DateTime, liftNameSchema, liftSideSchema } from 'src/lift'

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

type ParsedRow = {
  date: DateTime // 0
  name: string // 1
  side: string // 2
  weight: number // 3
  sets: number // 4
  reps: number // 5
  // score: number // 6
  notes: string // 7
}

const isLift = (row: ParsedRow): row is LiftEvent =>
  liftNameSchema.safeParse(row.name).success && liftSideSchema.safeParse(row.side).success

export class Gsheets {
  private constructor(private readonly props: MessageHandlerProps) {}

  public static from = (props: MessageHandlerProps) => new Gsheets(props)

  public async appendLift(lift: Lift) {
    const date = DateTime.today().format()
    console.log('date', date)
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

    const rows: ParsedRow[] = values.map((row) => ({
      date: DateTime.from(row[0]),
      name: String(row[1]),
      side: String(row[2]),
      weight: Number(row[3]),
      sets: Number(row[4]),
      reps: Number(row[5]),
      notes: String(row[7]),
    }))

    return rows.filter(isLift)
  }

  public async getSheetLink(): Promise<string | undefined> {
    const { output } = await this.props.client.callAction({
      type: 'gsheets:getInfoSpreadsheet',
      input: {
        fields: [],
      },
    })
    return output.spreadsheetUrl ?? undefined
  }
}
