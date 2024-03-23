import moment from 'moment'

type DateFormat = 'YYYY-MM-DD' | 'DD/MM'
const defaultFormat: DateFormat = 'YYYY-MM-DD'

export class DateTime {
  private constructor(private _moment: moment.Moment) {}

  public static from(date: string): DateTime {
    return new DateTime(moment(date, defaultFormat))
  }

  public static fromTime(time: number): DateTime {
    return new DateTime(moment(time))
  }

  public static today(): DateTime {
    return new DateTime(moment())
  }

  public format(f: DateFormat = defaultFormat): string {
    return this._moment.format(f)
  }

  public getTime(): number {
    return this._moment.valueOf()
  }
}
