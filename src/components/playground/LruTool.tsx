import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FieldLabel, Note, inputClass } from './shared'

interface Entry {
  key: string
  value: string
}

interface LogLine {
  id: number
  text: string
  kind: 'hit' | 'miss' | 'evict' | 'put'
}

const COLORS: Record<LogLine['kind'], string> = {
  hit: 'text-green-400',
  miss: 'text-amber-400',
  evict: 'text-red-400',
  put: 'text-text-secondary',
}

export default function LruTool() {
  const [capacity, setCapacity] = useState(4)
  const [entries, setEntries] = useState<Entry[]>([])
  const [log, setLog] = useState<LogLine[]>([])
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState('')
  const [counter, setCounter] = useState(0)

  // Applies a list of operations to a working copy so a whole example can run in one render.
  const apply = (ops: { type: 'get' | 'put'; key: string; value?: string }[], startEntries: Entry[], cap: number) => {
    let current = [...startEntries]
    const lines: Omit<LogLine, 'id'>[] = []
    let last = ''
    for (const op of ops) {
      const index = current.findIndex(e => e.key === op.key)
      if (op.type === 'get') {
        if (index === -1) {
          lines.push({ kind: 'miss', text: `get "${op.key}" → miss (not in cache)` })
        } else {
          const [entry] = current.splice(index, 1)
          current.unshift(entry)
          last = op.key
          lines.push({ kind: 'hit', text: `get "${op.key}" → hit, value "${entry.value}", moved to front` })
        }
      } else {
        const val = op.value ?? ''
        if (index !== -1) {
          current.splice(index, 1)
          current.unshift({ key: op.key, value: val })
          lines.push({ kind: 'put', text: `put "${op.key}" → updated, moved to front` })
        } else {
          if (current.length >= cap) {
            const evicted = current.pop()!
            lines.push({ kind: 'evict', text: `cache full: evicted least recently used "${evicted.key}"` })
          }
          current.unshift({ key: op.key, value: val })
          lines.push({ kind: 'put', text: `put "${op.key}" → added to front` })
        }
        last = op.key
      }
    }
    return { current, lines, last }
  }

  const run = (ops: { type: 'get' | 'put'; key: string; value?: string }[], start = entries, cap = capacity) => {
    const { current, lines, last } = apply(ops, start, cap)
    setEntries(current)
    setTouched(last)
    setLog(prev => [...lines.map((l, i) => ({ ...l, id: counter + i })).reverse(), ...prev].slice(0, 8))
    setCounter(c => c + lines.length)
  }

  const clean = key.trim().slice(0, 8)

  const changeCapacity = (next: number) => {
    setCapacity(next)
    // Shrinking the cache drops the least recently used entries.
    if (entries.length > next) {
      const dropped = entries.slice(next)
      setEntries(entries.slice(0, next))
      setLog(prev => [
        ...dropped.map((d, i) => ({ id: counter + i, kind: 'evict' as const, text: `capacity reduced: evicted "${d.key}"` })),
        ...prev,
      ].slice(0, 8))
      setCounter(c => c + dropped.length)
    }
  }

  const example = () => {
    setLog([])
    run(
      [
        { type: 'put', key: 'A', value: '1' },
        { type: 'put', key: 'B', value: '2' },
        { type: 'put', key: 'C', value: '3' },
        { type: 'put', key: 'D', value: '4' },
        { type: 'get', key: 'A' },
        { type: 'put', key: 'E', value: '5' },
        { type: 'get', key: 'B' },
      ],
      [],
      4,
    )
    setCapacity(4)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <FieldLabel htmlFor="lru-capacity">Cache capacity: {capacity}</FieldLabel>
        <input id="lru-capacity" type="range" min={2} max={8} value={capacity} onChange={e => changeCapacity(Number(e.target.value))} className="w-full accent-[hsl(var(--primary))]" />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <FieldLabel htmlFor="lru-key">Key</FieldLabel>
          <input id="lru-key" type="text" value={key} maxLength={8} autoComplete="off" spellCheck={false} onChange={e => setKey(e.target.value)} placeholder="e.g. user42" className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="lru-value">Value (for put)</FieldLabel>
          <input id="lru-value" type="text" value={value} maxLength={12} autoComplete="off" spellCheck={false} onChange={e => setValue(e.target.value)} placeholder="e.g. profile" className={inputClass} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={!clean} onClick={() => run([{ type: 'put', key: clean, value: value || clean }])}>Put</Button>
        <Button type="button" variant="outline" disabled={!clean} onClick={() => run([{ type: 'get', key: clean }])}>Get</Button>
        <Button type="button" variant="outline" onClick={example}>Run an example</Button>
        <Button type="button" variant="ghost" onClick={() => { setEntries([]); setLog([]); setTouched('') }}>Clear</Button>
      </div>

      <div>
        <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">
          <span>Most recently used</span>
          <span>Least recently used</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Cache contents from most to least recently used">
          {Array.from({ length: capacity }, (_, i) => {
            const entry = entries[i]
            return (
              <div
                key={i}
                className={`flex-1 min-w-[4.5rem] rounded-xl border px-2 py-3 text-center font-mono text-[13px] sm:text-sm transition-colors ${
                  entry
                    ? entry.key === touched
                      ? 'border-primary bg-primary/15 text-text-primary'
                      : 'border-border/60 bg-background/60 text-text-primary'
                    : 'border-dashed border-border/40 text-text-secondary/50'
                }`}
              >
                {entry ? (
                  <>
                    <div className="font-semibold break-all">{entry.key}</div>
                    <div className="text-xs text-text-secondary break-all">{entry.value}</div>
                  </>
                ) : (
                  'empty'
                )}
              </div>
            )
          })}
        </div>
      </div>

      {log.length > 0 && (
        <ul className="space-y-1 text-[13px] sm:text-sm font-mono" aria-live="polite">
          {log.map(line => (
            <li key={line.id} className={COLORS[line.kind]}>{line.text}</li>
          ))}
        </ul>
      )}

      <Note title="What to notice.">
        Reading or writing a key moves it to the front, so the entry that gets evicted is the one nobody has touched for the
        longest time. Real LRU caches use a hash map plus a doubly linked list so both lookup and reordering take constant
        time. It&apos;s a good default, but a single big scan can flush useful entries, which is why some systems use
        variants such as LRU-K or TinyLFU.
      </Note>
    </div>
  )
}
