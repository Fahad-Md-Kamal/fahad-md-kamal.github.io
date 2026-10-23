import { useMemo, useState } from 'react'
import { describeCron, nextRuns, parseCron } from '../../lib/cron'
import { ErrorText, FieldLabel, Note, Segmented, inputClass } from './shared'

const PRESETS = [
  { label: 'Every 15 min', value: '*/15 * * * *' },
  { label: 'Weekdays 09:00', value: '0 9 * * 1-5' },
  { label: 'Daily midnight', value: '0 0 * * *' },
  { label: '1st of month', value: '0 0 1 * *' },
  { label: 'Sundays 03:30', value: '30 3 * * 0' },
]

function formatRun(date: Date, utc: boolean): string {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: utc ? 'UTC' : undefined,
  })
}

export default function CronTool() {
  const [expression, setExpression] = useState('0 9 * * 1-5')
  const [zone, setZone] = useState<'local' | 'utc'>('local')

  const result = useMemo(() => {
    try {
      const spec = parseCron(expression)
      const runs = nextRuns(spec, new Date(), 5, zone === 'utc')
      return { description: describeCron(spec), runs, error: '' }
    } catch (e) {
      return { description: '', runs: [] as Date[], error: e instanceof Error ? e.message : 'Invalid expression.' }
    }
  }, [expression, zone])

  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel htmlFor="cron-input">Cron expression</FieldLabel>
        <input
          id="cron-input"
          type="text"
          value={expression}
          autoComplete="off"
          spellCheck={false}
          onChange={e => setExpression(e.target.value)}
          placeholder="*/15 * * * *"
          className={inputClass}
        />
        <p className="mt-2 text-xs font-mono text-text-secondary">minute · hour · day-of-month · month · day-of-week</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(preset => (
          <button
            key={preset.value}
            type="button"
            onClick={() => setExpression(preset.value)}
            className="rounded-lg border border-border/60 px-3 py-1.5 text-xs font-mono text-text-secondary hover:border-primary/40 hover:text-primary transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {result.error ? (
        <ErrorText>{result.error}</ErrorText>
      ) : (
        <>
          <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-text-primary" aria-live="polite">
            {result.description}
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="text-xs font-mono uppercase tracking-wider text-primary">Next 5 runs</div>
              <Segmented
                label="Time zone"
                value={zone}
                options={[
                  { id: 'local', label: `Local (${localZone})` },
                  { id: 'utc', label: 'UTC' },
                ]}
                onChange={setZone}
                size="sm"
              />
            </div>
            {result.runs.length > 0 ? (
              <ol className="space-y-1 text-sm font-mono text-text-secondary">
                {result.runs.map(run => (
                  <li key={run.getTime()}>{formatRun(run, zone === 'utc')}</li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-text-secondary">This expression doesn&apos;t match any date in the next several years.</p>
            )}
          </div>
        </>
      )}

      <Note title="Good to know.">
        This is standard 5-field cron (also <span className="font-mono">@daily</span>, <span className="font-mono">@hourly</span> and
        similar). If both day-of-month and day-of-week are set, the job runs when <em>either</em> matches. Schedulers
        differ: many cloud services use UTC, and some (like AWS EventBridge or Quartz) use 6 fields, so check your
        platform&apos;s syntax before relying on this.
      </Note>
    </div>
  )
}
