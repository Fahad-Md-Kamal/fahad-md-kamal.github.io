import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ErrorText, FieldLabel, Note, ResultBox, inputClass } from './shared'

interface Run {
  cost: number
  ms: number
}

const BENCH_COSTS = [4, 6, 8, 10, 11, 12]

export default function BcryptTool() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [cost, setCost] = useState(10)
  const [hash, setHash] = useState('')
  const [runs, setRuns] = useState<Run[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [verifyHash, setVerifyHash] = useState('')
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)

  const byteLength = new TextEncoder().encode(password).length

  const loadBcrypt = () => import('bcryptjs')

  const hashOnce = async () => {
    if (!password) {
      setError('Enter a password first.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const bcrypt = await loadBcrypt()
      const start = performance.now()
      const result = await bcrypt.hash(password, cost)
      const ms = Math.round(performance.now() - start)
      setHash(result)
      setRuns(prev => [{ cost, ms }, ...prev].slice(0, 8))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hashing failed.')
    } finally {
      setBusy(false)
    }
  }

  const benchmark = async () => {
    if (!password) {
      setError('Enter a password first.')
      return
    }
    setBusy(true)
    setError('')
    setRuns([])
    try {
      const bcrypt = await loadBcrypt()
      for (const c of BENCH_COSTS) {
        const start = performance.now()
        await bcrypt.hash(password, c)
        const ms = Math.round(performance.now() - start)
        setRuns(prev => [...prev, { cost: c, ms }])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Benchmark failed.')
    } finally {
      setBusy(false)
    }
  }

  const verify = async () => {
    if (!password || !verifyHash.trim()) {
      setError('Enter the password above and paste a bcrypt hash to check.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const bcrypt = await loadBcrypt()
      setVerifyResult(await bcrypt.compare(password, verifyHash.trim()))
    } catch {
      setVerifyResult(null)
      setError('That does not look like a valid bcrypt hash (it should start with $2a$, $2b$ or $2y$).')
    } finally {
      setBusy(false)
    }
  }

  const maxMs = Math.max(1, ...runs.map(r => r.ms))

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <FieldLabel htmlFor="bcrypt-password">Password</FieldLabel>
        <div className="flex gap-2">
          <input
            id="bcrypt-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            autoComplete="off"
            spellCheck={false}
            onChange={e => { setPassword(e.target.value); setVerifyResult(null) }}
            placeholder="Type a test password"
            className={inputClass}
          />
          <Button type="button" variant="outline" onClick={() => setShowPassword(s => !s)}>
            {showPassword ? 'Hide' : 'Show'}
          </Button>
        </div>
        {byteLength > 72 && (
          <p className="mt-2 text-xs text-amber-400 font-mono">
            bcrypt only uses the first 72 bytes of a password; yours is {byteLength} bytes.
          </p>
        )}
      </div>

      <div>
        <FieldLabel htmlFor="bcrypt-cost">Cost factor: {cost} (2^{cost} = {(2 ** cost).toLocaleString()} rounds)</FieldLabel>
        <input
          id="bcrypt-cost"
          type="range"
          min={4}
          max={13}
          value={cost}
          onChange={e => setCost(Number(e.target.value))}
          className="w-full accent-[hsl(var(--primary))]"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={hashOnce} disabled={busy}>{busy ? 'Working…' : 'Hash with bcrypt'}</Button>
        <Button type="button" variant="outline" onClick={benchmark} disabled={busy}>
          Benchmark costs {BENCH_COSTS[0]}–{BENCH_COSTS[BENCH_COSTS.length - 1]}
        </Button>
      </div>

      {error && <ErrorText>{error}</ErrorText>}
      {hash && <ResultBox label="bcrypt hash (salt is random each time)" value={hash} />}

      {runs.length > 0 && (
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-primary mb-2">Time taken</div>
          <ul className="space-y-1.5">
            {runs.map((run, i) => (
              <li key={`${run.cost}-${i}`} className="flex items-center gap-3 text-[13px] sm:text-sm font-mono">
                <span className="w-14 text-text-secondary">cost {run.cost}</span>
                <span className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${Math.max(2, (run.ms / maxMs) * 100)}%` }}
                  />
                </span>
                <span className="w-20 text-right text-text-primary">{run.ms} ms</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-text-secondary">
            Every +1 on the cost factor doubles the work. This runs in plain JavaScript in your browser, so it is
            slower than a server&apos;s native bcrypt.
          </p>
        </div>
      )}

      <div>
        <FieldLabel htmlFor="bcrypt-verify">Check the password against a hash</FieldLabel>
        <div className="flex gap-2">
          <input
            id="bcrypt-verify"
            type="text"
            value={verifyHash}
            spellCheck={false}
            autoComplete="off"
            onChange={e => { setVerifyHash(e.target.value); setVerifyResult(null) }}
            placeholder="$2b$10$..."
            className={inputClass}
          />
          <Button type="button" variant="outline" onClick={verify} disabled={busy}>Check</Button>
        </div>
        {verifyResult !== null && (
          <p className={`mt-2 text-[13px] sm:text-sm font-mono ${verifyResult ? 'text-green-400' : 'text-red-400'}`} role="status">
            {verifyResult ? '✓ The password matches this hash.' : '✗ The password does not match this hash.'}
          </p>
        )}
      </div>

      <Note title="Why it's slow on purpose.">
        Fast hashes like SHA-256 let an attacker test billions of guesses a second. bcrypt adds a tunable cost, so each
        guess is expensive for them but still fine for one login. Pick the highest cost your server can afford (often
        10–12 today) and raise it over time. Argon2id is the modern alternative; it isn&apos;t included here.
      </Note>
    </div>
  )
}
