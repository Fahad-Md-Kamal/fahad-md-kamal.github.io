import { useMemo, useState } from 'react'
import { ErrorText, FieldLabel, Note, inputClass } from './shared'

const FLAGS = [
  { id: 'i', label: 'i', title: 'Ignore case' },
  { id: 'm', label: 'm', title: 'Multiline: ^ and $ match at each line' },
  { id: 's', label: 's', title: 'Dot matches newlines' },
  { id: 'u', label: 'u', title: 'Unicode mode' },
]

const MAX_TEXT = 5000
const MAX_MATCHES = 200

interface Segment {
  text: string
  hit: boolean
}

export default function RegexTool() {
  const [pattern, setPattern] = useState('(\\w+)@(\\w+)\\.com')
  const [flags, setFlags] = useState<string[]>(['i'])
  const [text, setText] = useState('Contact: alice@example.com, bob@test.com')

  const result = useMemo(() => {
    if (!pattern) return { matches: [] as RegExpMatchArray[], segments: [] as Segment[], error: '', truncated: false }
    try {
      const regex = new RegExp(pattern, `${flags.join('')}g`)
      const subject = text.slice(0, MAX_TEXT)
      const all = [...subject.matchAll(regex)]
      const matches = all.slice(0, MAX_MATCHES)

      const segments: Segment[] = []
      let cursor = 0
      for (const m of matches) {
        const start = m.index ?? 0
        if (m[0].length === 0) continue
        if (start > cursor) segments.push({ text: subject.slice(cursor, start), hit: false })
        segments.push({ text: m[0], hit: true })
        cursor = start + m[0].length
      }
      if (cursor < subject.length) segments.push({ text: subject.slice(cursor), hit: false })
      return { matches, segments, error: '', truncated: all.length > MAX_MATCHES || text.length > MAX_TEXT }
    } catch (e) {
      return { matches: [] as RegExpMatchArray[], segments: [] as Segment[], error: e instanceof Error ? e.message : 'Invalid pattern.', truncated: false }
    }
  }, [pattern, flags, text])

  const toggleFlag = (id: string) =>
    setFlags(current => (current.includes(id) ? current.filter(f => f !== id) : [...current, id]))

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <FieldLabel htmlFor="regex-pattern">Pattern</FieldLabel>
        <div className="flex gap-2 items-center">
          <span className="font-mono text-text-secondary">/</span>
          <input
            id="regex-pattern"
            type="text"
            value={pattern}
            spellCheck={false}
            autoComplete="off"
            onChange={e => setPattern(e.target.value)}
            className={inputClass}
          />
          <span className="font-mono text-text-secondary">/g{flags.join('')}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {FLAGS.map(flag => (
            <button
              key={flag.id}
              type="button"
              title={flag.title}
              aria-pressed={flags.includes(flag.id)}
              onClick={() => toggleFlag(flag.id)}
              className={`rounded-lg border px-3 py-1 max-sm:min-w-11 max-sm:min-h-9 text-xs font-mono transition-colors ${
                flags.includes(flag.id)
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border/60 text-text-secondary hover:border-primary/40'
              }`}
            >
              {flag.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="regex-text">Test string</FieldLabel>
        <textarea
          id="regex-text"
          value={text}
          rows={5}
          spellCheck={false}
          onChange={e => setText(e.target.value)}
          className={`${inputClass} resize-y`}
        />
      </div>

      {result.error && <ErrorText>{result.error}</ErrorText>}

      {!result.error && pattern && (
        <>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-primary mb-2">
              {result.matches.length} {result.matches.length === 1 ? 'match' : 'matches'}
            </div>
            <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-3 text-[13px] sm:text-sm font-mono text-text-secondary whitespace-pre-wrap break-all">
              {result.segments.map((seg, i) =>
                seg.hit ? (
                  <mark key={i} className="rounded bg-primary/30 text-text-primary px-0.5">{seg.text}</mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                ),
              )}
            </div>
            {result.truncated && (
              <p className="mt-2 text-xs text-amber-400 font-mono">
                Showing the first {MAX_MATCHES} matches of the first {MAX_TEXT} characters.
              </p>
            )}
          </div>

          {result.matches.length > 0 && (
            <ol className="space-y-2 text-[13px] sm:text-sm font-mono">
              {result.matches.slice(0, 20).map((m, i) => (
                <li key={`${m.index}-${i}`} className="rounded-xl border border-border/60 bg-background/40 px-4 py-2">
                  <div className="text-text-primary break-all">
                    <span className="text-text-secondary">#{i + 1} @ {m.index}: </span>
                    {m[0] === '' ? '(empty match)' : m[0]}
                  </div>
                  {m.length > 1 &&
                    Array.from(m).slice(1).map((group, g) => (
                      <div key={g} className="text-text-secondary break-all">
                        group {g + 1}: {group === undefined ? '(did not participate)' : group}
                      </div>
                    ))}
                  {m.groups &&
                    Object.entries(m.groups).map(([name, value]) => (
                      <div key={name} className="text-text-secondary break-all">
                        {name}: {value === undefined ? '(did not participate)' : value}
                      </div>
                    ))}
                </li>
              ))}
              {result.matches.length > 20 && (
                <li className="text-xs text-text-secondary">…and {result.matches.length - 20} more (all are highlighted above).</li>
              )}
            </ol>
          )}
        </>
      )}

      <Note title="Watch out.">
        This uses JavaScript&apos;s regex engine, so syntax differs slightly from Python, Go or PCRE (for example,
        Go has no look-behind). Patterns with nested repeats such as <span className="font-mono">(a+)+$</span> can
        take exponential time on some inputs and freeze the page, which is also a real denial-of-service risk
        (&quot;ReDoS&quot;) on servers.
      </Note>
    </div>
  )
}
