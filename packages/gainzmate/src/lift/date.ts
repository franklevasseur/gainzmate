import moment from 'moment'

const format = 'YYYY-MM-DD'

export class Date {
  private constructor(private _moment: moment.Moment) {}

  public static from(date: string): Date {
    return new Date(moment(date, format))
  }

  public static today(): Date {
    return new Date(moment())
  }

  public format(): string {
    return this._moment.format(format)
  }
}
