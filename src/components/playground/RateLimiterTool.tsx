import { useEffect, useReducer, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { FieldLabel, Note, Segmented } from './shared'

type Algorithm = 'token' | 'fixed' | 'sliding'

interface Evt {
  t: number
  ok: boolean
}

const VISIBLE_SECONDS = 20
const WIDTH = 640
const HEIGHT = 150

const ALGORITHMS: { id: Algorithm; label: string }[] = [
  { id: 'token', label: 'Token bucket' },
  { id: 'fixed', label: 'Fixed window' },
  { id: 'sliding', label: 'Sliding window' },
]

const EXPLAIN: Record<Algorithm, string> = {
  token:
    'Tokens refill steadily and each request spends one. It allows short bursts up to the bucket size, then settles to the refill rate. Popular because it is smooth and cheap.',
  fixed:
    'Counts requests in fixed time slots that reset on the clock. Simple, but a client can send a full quota at the end of one window and another at the start of the next, doubling the burst at the boundary.',
  sliding:
    'Counts requests in the last N seconds, measured from now. It avoids the boundary burst of a fixed window but has to remember every recent request.',
}

interface LimiterState {
  tokens: number
  lastRefill: number
  windowStart: number
  windowCount: number
  log: number[]
}

const freshState = (limit: number): LimiterState => ({ tokens: limit, lastRefill: 0, windowStart: 0, windowCount: 0, log: [] })

export default function RateLimiterTool() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('token')
  const [limit, setLimit] = useState(5)
  const [windowSec, setWindowSec] = useState(5)
  const [rate, setRate] = useState(2)
  const [running, setRunning] = useState(false)
  const [, rerender] = useReducer((n: number) => n + 1, 0)

  const timeRef = useRef(0)
  const eventsRef = useRef<Evt[]>([])
  const stateRef = useRef<LimiterState>(freshState(limit))
  const carryRef = useRef(0)
  const totalsRef = useRef({ allowed: 0, blocked: 0 })

  const reset = () => {
    timeRef.current = 0
    eventsRef.current = []
    stateRef.current = freshState(limit)
    carryRef.current = 0
    totalsRef.current = { allowed: 0, blocked: 0 }
    rerender()
  }

  // Any change to the rules starts a fresh simulation.
  useEffect(() => {
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithm, limit, windowSec])

  const handle = (t: number) => {
    const s = stateRef.current
    let ok = false
    if (algorithm === 'token') {
      const ratePerSecond = limit / windowSec
      s.tokens = Math.min(limit, s.tokens + (t - s.lastRefill) * ratePerSecond)
      s.lastRefill = t
      if (s.tokens >= 1) { s.tokens -= 1; ok = true }
    } else if (algorithm === 'fixed') {
      const start = Math.floor(t / windowSec) * windowSec
      if (start !== s.windowStart) { s.windowStart = start; s.windowCount = 0 }
      if (s.windowCount < limit) { s.windowCount += 1; ok = true }
    } else {
      s.log = s.log.filter(x => x > t - windowSec)
      if (s.log.length < limit) { s.log.push(t); ok = true }
    }
    eventsRef.current.push({ t, ok })
    if (eventsRef.current.length > 500) eventsRef.current.shift()
    totalsRef.current[ok ? 'allowed' : 'blocked'] += 1
  }

  const send = (count: number) => {
    for (let i = 0; i < count; i++) handle(timeRef.current + i * 0.01)
    rerender()
  }

  useEffect(() => {
    if (!running) return
    let last = performance.now()
    const timer = setInterval(() => {
      const nowMs = performance.now()
      const dt = (nowMs - last) / 1000
      last = nowMs
      timeRef.current += dt
      carryRef.current += rate * dt
      while (carryRef.current >= 1) {
        carryRef.current -= 1
        handle(timeRef.current)
      }
      rerender()
    }, 60)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, rate, algorithm, limit, windowSec])

  const now = timeRef.current
  const s = stateRef.current
  const left = now - VISIBLE_SECONDS
  const xFor = (t: number) => ((t - left) / VISIBLE_SECONDS) * WIDTH

  let usage = ''
  if (algorithm === 'token') {
    const projected = Math.min(limit, s.tokens + (now - s.lastRefill) * (limit / windowSec))
    usage = `${projected.toFixed(1)} / ${limit} tokens in the bucket`
  } else if (algorithm === 'fixed') {
    const start = Math.floor(now / windowSec) * windowSec
    usage = `${start === s.windowStart ? s.windowCount : 0} / ${limit} used in the current ${windowSec}s window`
  } else {
    usage = `${s.log.filter(x => x > now - windowSec).length} / ${limit} used in the last ${windowSec}s`
  }

  const boundaries: number[] = []
  if (algorithm === 'fixed') {
    for (let b = Math.ceil(left / windowSec) * windowSec; b <= now; b += windowSec) boundaries.push(b)
  }

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel>Algorithm</FieldLabel>
        <Segmented label="Rate limiting algorithm" value={algorithm} options={ALGORITHMS} onChange={setAlgorithm} />
        <p className="mt-3 text-sm text-text-secondary leading-relaxed">{EXPLAIN[algorithm]}</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <FieldLabel htmlFor="rl-limit">Allow: {limit} requests</FieldLabel>
          <input id="rl-limit" type="range" min={1} max={10} value={limit} onChange={e => setLimit(Number(e.target.value))} className="w-full accent-[hsl(var(--primary))]" />
        </div>
        <div>
          <FieldLabel htmlFor="rl-window">Per: {windowSec} seconds</FieldLabel>
          <input id="rl-window" type="range" min={1} max={10} value={windowSec} onChange={e => setWindowSec(Number(e.target.value))} className="w-full accent-[hsl(var(--primary))]" />
        </div>
        <div>
          <FieldLabel htmlFor="rl-rate">Traffic: {rate} req/s</FieldLabel>
          <input id="rl-rate" type="range" min={0.5} max={10} step={0.5} value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full accent-[hsl(var(--primary))]" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => setRunning(r => !r)}>{running ? 'Pause traffic' : 'Start traffic'}</Button>
        <Button type="button" variant="outline" onClick={() => send(1)}>Send 1 request</Button>
        <Button type="button" variant="outline" onClick={() => send(10)}>Send a burst of 10</Button>
        <Button type="button" variant="ghost" onClick={() => { setRunning(false); reset() }}>Reset</Button>
      </div>

      <div>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full rounded-xl border border-border/60 bg-background/60" role="img" aria-label="Timeline of allowed and blocked requests">
          <text x="8" y="22" className="fill-green-400" fontSize="11" fontFamily="monospace">allowed</text>
          <text x="8" y={HEIGHT - 12} className="fill-red-400" fontSize="11" fontFamily="monospace">blocked</text>
          <line x1="0" x2={WIDTH} y1={HEIGHT / 2} y2={HEIGHT / 2} stroke="currentColor" className="text-border" strokeDasharray="3 4" />
          {algorithm === 'sliding' && (
            <rect x={xFor(now - windowSec)} y="0" width={(windowSec / VISIBLE_SECONDS) * WIDTH} height={HEIGHT} className="fill-primary/10" />
          )}
          {boundaries.map(b => (
            <line key={b} x1={xFor(b)} x2={xFor(b)} y1="0" y2={HEIGHT} stroke="currentColor" className="text-primary/50" strokeDasharray="4 4" />
          ))}
          {eventsRef.current.filter(e => e.t >= left).map((e, i) => (
            <circle key={`${e.t}-${i}`} cx={xFor(e.t)} cy={e.ok ? 38 : HEIGHT - 38} r="4.5" className={e.ok ? 'fill-green-400' : 'fill-red-400'} />
          ))}
        </svg>
        <p className="mt-2 text-xs font-mono text-text-secondary">
          Last {VISIBLE_SECONDS} seconds · {usage}
        </p>
        <p className="mt-1 text-sm font-mono text-text-primary">
          <span className="text-green-400">{totalsRef.current.allowed} allowed</span> ·{' '}
          <span className="text-red-400">{totalsRef.current.blocked} blocked</span>
        </p>
      </div>

      <Note title="Try this.">
        Pick &quot;Fixed window&quot;, wait for a window line, then send two bursts of 10, one just before the line and one just
        after. You&apos;ll see about twice the quota get through. Switch to &quot;Sliding window&quot; and repeat to see it hold.
        Real systems usually return HTTP 429 with a Retry-After header when a request is blocked.
      </Note>
    </div>
  )
}
