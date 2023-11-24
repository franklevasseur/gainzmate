import moment from 'moment'

type DateFormat = 'YYYY-MM-DD' | 'DD/MM'
const defaultFormat: DateFormat = 'YYYY-MM-DD'

export class Date {
  private constructor(private _moment: moment.Moment) {}

  public static from(date: string): Date {
    return new Date(moment(date, defaultFormat))
  }

  public static fromTime(time: number): Date {
    return new Date(moment(time))
  }

  public static today(): Date {
    return new Date(moment())
  }

  public format(f: DateFormat = defaultFormat): string {
    return this._moment.format(f)
  }

  public getTime(): number {
    return this._moment.valueOf()
  }
}
