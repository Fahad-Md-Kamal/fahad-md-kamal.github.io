import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { FieldLabel, Note, ResultBox, inputClass } from './shared'

const ZONES = [
  'UTC',
  'Asia/Dhaka',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Australia/Sydney',
]

// Reads a pasted timestamp (seconds, milliseconds, or a date string) into a Date.
function parseInstant(raw: string): Date | null {
  const value = raw.trim()
  if (!value) return null
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    const n = Number(value)
    // Values this large are almost certainly milliseconds.
    const ms = Math.abs(n) >= 1e11 ? n : n * 1000
    const date = new Date(ms)
    return Number.isNaN(date.getTime()) ? null : date
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function inZone(date: Date, timeZone: string): string {
  return date.toLocaleString(undefined, {
    timeZone,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  })
}

export default function TimeTool() {
  const [input, setInput] = useState('')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const date = useMemo(() => parseInstant(input), [input])
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-xl border border-border/60 bg-background/40 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-primary">Current Unix time</div>
          <div className="font-mono text-text-primary text-lg">{Math.floor(now / 1000)}</div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setInput(String(Math.floor(Date.now() / 1000)))}>
          Use now
        </Button>
      </div>

      <div>
        <FieldLabel htmlFor="time-input">Unix timestamp or date</FieldLabel>
        <input
          id="time-input"
          type="text"
          value={input}
          spellCheck={false}
          autoComplete="off"
          onChange={e => setInput(e.target.value)}
          placeholder="1700000000, 1700000000000, or 2026-03-01T09:00:00Z"
          className={inputClass}
        />
        <p className="mt-2 text-xs font-mono text-text-secondary">
          Numbers are read as seconds, or as milliseconds when very large. Dates without a time zone are read as {localZone}.
        </p>
      </div>

      {input.trim() && !date && (
        <p className="text-[13px] sm:text-sm text-red-400" role="alert">Couldn&apos;t read that as a timestamp or date.</p>
      )}

      {date && (
        <div className="space-y-4 sm:space-y-5">
          <ResultBox label="Unix seconds" value={String(Math.floor(date.getTime() / 1000))} />
          <ResultBox label="Unix milliseconds" value={String(date.getTime())} />
          <ResultBox label="ISO 8601 (UTC)" value={date.toISOString()} />
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-primary mb-2">Same moment in other zones</div>
            <div className="rounded-xl border border-border/60 divide-y divide-border/60 overflow-hidden">
              {[localZone, ...ZONES.filter(z => z !== localZone)].map(zone => (
                <div key={zone} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-[13px] sm:text-sm bg-background/40">
                  <span className="font-mono text-text-secondary">{zone === localZone ? `${zone} (you)` : zone}</span>
                  <span className="font-mono text-text-primary">{inZone(date, zone)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Note title="A good habit.">
        Store and send times as UTC (or Unix time) and convert to a local zone only when showing them to a person.
        Mixing local times in a database is a common source of off-by-hours bugs, especially around daylight saving.
      </Note>
    </div>
  )
}
