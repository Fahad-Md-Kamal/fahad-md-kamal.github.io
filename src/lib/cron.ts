// A small parser and explainer for standard 5-field cron expressions
// (minute hour day-of-month month day-of-week), plus a few @ macros.

export interface CronField {
  raw: string
  values: number[]
  star: boolean
}

export interface CronSpec {
  minute: CronField
  hour: CronField
  dayOfMonth: CronField
  month: CronField
  dayOfWeek: CronField
}

const MACROS: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
}

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function toNumber(token: string, label: string, names?: string[], nameOffset = 0): number {
  if (/^\d+$/.test(token)) return Number(token)
  if (names) {
    const index = names.indexOf(token.toUpperCase())
    if (index >= 0) return index + nameOffset
  }
  throw new Error(`"${token}" is not a valid ${label} value.`)
}

function parseField(
  raw: string,
  label: string,
  min: number,
  max: number,
  options: { names?: string[]; nameOffset?: number; wildcardMax?: number } = {},
): CronField {
  const values = new Set<number>()
  for (const part of raw.split(',')) {
    if (!part) throw new Error(`The ${label} field has an empty item.`)
    const pieces = part.split('/')
    if (pieces.length > 2) throw new Error(`"${part}" has more than one step in the ${label} field.`)
    const [rangePart, stepPart] = pieces

    let step = 1
    if (stepPart !== undefined) {
      step = Number(stepPart)
      if (!/^\d+$/.test(stepPart) || step < 1) throw new Error(`"${stepPart}" is not a valid step in the ${label} field.`)
    }

    let start: number
    let end: number
    if (rangePart === '*') {
      start = min
      end = options.wildcardMax ?? max
    } else if (rangePart.includes('-')) {
      const bounds = rangePart.split('-')
      if (bounds.length !== 2) throw new Error(`"${rangePart}" is not a valid range in the ${label} field.`)
      start = toNumber(bounds[0], label, options.names, options.nameOffset)
      end = toNumber(bounds[1], label, options.names, options.nameOffset)
    } else {
      start = toNumber(rangePart, label, options.names, options.nameOffset)
      end = stepPart !== undefined ? max : start
    }

    if (start < min || end > max) throw new Error(`The ${label} field must be between ${min} and ${max}.`)
    if (start > end) throw new Error(`"${rangePart}" in the ${label} field runs backwards.`)
    for (let v = start; v <= end; v += step) values.add(v)
  }
  return { raw, values: [...values].sort((a, b) => a - b), star: raw.startsWith('*') }
}

export function parseCron(expression: string): CronSpec {
  const trimmed = expression.trim()
  if (!trimmed) throw new Error('Enter a cron expression.')
  const expanded = MACROS[trimmed.toLowerCase()] ?? trimmed
  const parts = expanded.split(/\s+/)
  if (parts.length !== 5) {
    throw new Error('A cron expression has 5 fields: minute hour day-of-month month day-of-week.')
  }
  const dayOfWeek = parseField(parts[4], 'day-of-week', 0, 7, { names: DAY_NAMES, wildcardMax: 6 })
  // 7 is an alias for Sunday.
  dayOfWeek.values = [...new Set(dayOfWeek.values.map(v => v % 7))].sort((a, b) => a - b)
  return {
    minute: parseField(parts[0], 'minute', 0, 59),
    hour: parseField(parts[1], 'hour', 0, 23),
    dayOfMonth: parseField(parts[2], 'day-of-month', 1, 31),
    month: parseField(parts[3], 'month', 1, 12, { names: MONTH_NAMES, nameOffset: 1 }),
    dayOfWeek,
  }
}

// ---- Plain-English description -------------------------------------------------

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

// Collapses runs of 3 or more consecutive values into "A through B".
function describeValues(values: number[], label: (n: number) => string): string {
  const parts: string[] = []
  let i = 0
  while (i < values.length) {
    let j = i
    while (j + 1 < values.length && values[j + 1] === values[j] + 1) j++
    if (j - i >= 2) {
      parts.push(`${label(values[i])} through ${label(values[j])}`)
    } else {
      for (let k = i; k <= j; k++) parts.push(label(values[k]))
    }
    i = j + 1
  }
  return joinList(parts)
}

const pad = (n: number) => String(n).padStart(2, '0')

export function describeCron(spec: CronSpec): string {
  const { minute, hour, dayOfMonth, month, dayOfWeek } = spec
  let time: string

  const minuteStep = /^\*\/(\d+)$/.exec(minute.raw)
  if (minute.raw === '*' && hour.raw === '*') {
    time = 'Every minute'
  } else if (minuteStep && hour.raw === '*') {
    time = `Every ${minuteStep[1]} minutes`
  } else if (hour.raw === '*' && minute.values.length === 1) {
    time = `At minute ${minute.values[0]} of every hour`
  } else if (minute.raw === '*') {
    time = `Every minute during ${describeValues(hour.values, n => `hour ${n}`)}`
  } else if (hour.raw !== '*' && minute.values.length * hour.values.length <= 6) {
    const times = hour.values.flatMap(h => minute.values.map(m => `${pad(h)}:${pad(m)}`))
    time = `At ${joinList(times)}`
  } else {
    const minutes = describeValues(minute.values, n => String(n))
    time = hour.raw === '*'
      ? `At minute ${minutes} of every hour`
      : `At minute ${minutes} past ${describeValues(hour.values, n => `hour ${n}`)}`
  }

  const clauses: string[] = []
  const domRestricted = !dayOfMonth.star
  const dowRestricted = !dayOfWeek.star
  if (domRestricted) clauses.push(`on day ${describeValues(dayOfMonth.values, n => String(n))} of the month`)
  if (dowRestricted) {
    clauses.push(`${domRestricted ? 'or ' : ''}on ${describeValues(dayOfWeek.values, n => DAY_LONG[n])}`)
  }
  if (month.raw !== '*') clauses.push(`in ${describeValues(month.values, n => MONTH_LONG[n - 1])}`)

  return `${time}${clauses.length ? `, ${clauses.join(', ')}` : ''}.`
}

// ---- Next run times ------------------------------------------------------------

interface DateAccess {
  year: (d: Date) => number
  month: (d: Date) => number
  date: (d: Date) => number
  day: (d: Date) => number
  hour: (d: Date) => number
  minute: (d: Date) => number
  set: (d: Date, y: number, mo: number, da: number, h: number, mi: number) => void
}

const UTC_ACCESS: DateAccess = {
  year: d => d.getUTCFullYear(),
  month: d => d.getUTCMonth() + 1,
  date: d => d.getUTCDate(),
  day: d => d.getUTCDay(),
  hour: d => d.getUTCHours(),
  minute: d => d.getUTCMinutes(),
  set: (d, y, mo, da, h, mi) => { d.setTime(Date.UTC(y, mo - 1, da, h, mi, 0, 0)) },
}

const LOCAL_ACCESS: DateAccess = {
  year: d => d.getFullYear(),
  month: d => d.getMonth() + 1,
  date: d => d.getDate(),
  day: d => d.getDay(),
  hour: d => d.getHours(),
  minute: d => d.getMinutes(),
  set: (d, y, mo, da, h, mi) => { d.setTime(new Date(y, mo - 1, da, h, mi, 0, 0).getTime()) },
}

export function nextRuns(spec: CronSpec, from: Date, count: number, utc: boolean): Date[] {
  const A = utc ? UTC_ACCESS : LOCAL_ACCESS
  const minutes = new Set(spec.minute.values)
  const hours = new Set(spec.hour.values)
  const months = new Set(spec.month.values)
  const monthDays = new Set(spec.dayOfMonth.values)
  const weekDays = new Set(spec.dayOfWeek.values)

  // Standard cron: if both day fields are restricted, a day matches when EITHER matches.
  const dayMatches = (d: Date) => {
    const dom = monthDays.has(A.date(d))
    const dow = weekDays.has(A.day(d))
    return spec.dayOfMonth.star || spec.dayOfWeek.star ? dom && dow : dom || dow
  }

  const results: Date[] = []
  const d = new Date(from.getTime())
  // Start at the next whole minute.
  A.set(d, A.year(d), A.month(d), A.date(d), A.hour(d), A.minute(d) + 1)

  for (let i = 0; i < 200000 && results.length < count; i++) {
    const y = A.year(d)
    const mo = A.month(d)
    const da = A.date(d)
    const h = A.hour(d)
    const mi = A.minute(d)
    if (!months.has(mo)) { A.set(d, y, mo + 1, 1, 0, 0); continue }
    if (!dayMatches(d)) { A.set(d, y, mo, da + 1, 0, 0); continue }
    if (!hours.has(h)) { A.set(d, y, mo, da, h + 1, 0); continue }
    if (!minutes.has(mi)) { A.set(d, y, mo, da, h, mi + 1); continue }
    results.push(new Date(d.getTime()))
    A.set(d, y, mo, da, h, mi + 1)
  }
  return results
}
