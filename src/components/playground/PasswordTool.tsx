import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { FieldLabel, Note, ResultBox } from './shared'

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/',
} as const
type SetKey = keyof typeof SETS

const AMBIGUOUS = /[Il1O0o]/g

const SET_LABELS: Record<SetKey, string> = {
  lower: 'a–z',
  upper: 'A–Z',
  digits: '0–9',
  symbols: '!@#$',
}

// Uniform random integer in [0, max) using rejection sampling to avoid modulo bias.
function secureInt(max: number): number {
  const range = 2 ** 32
  const limit = range - (range % max)
  const buffer = new Uint32Array(1)
  let value: number
  do {
    crypto.getRandomValues(buffer)
    value = buffer[0]
  } while (value >= limit)
  return value % max
}

function buildPools(enabled: Record<SetKey, boolean>, skipAmbiguous: boolean): string[] {
  return (Object.keys(SETS) as SetKey[])
    .filter(key => enabled[key])
    .map(key => (skipAmbiguous ? SETS[key].replace(AMBIGUOUS, '') : SETS[key]))
    .filter(pool => pool.length > 0)
}

function generatePassword(length: number, pools: string[]): string {
  if (pools.length === 0) return ''
  const all = pools.join('')
  // Guarantee at least one character from every selected set, then fill the rest.
  const chars: string[] = pools.map(pool => pool[secureInt(pool.length)])
  while (chars.length < length) chars.push(all[secureInt(all.length)])
  // Fisher–Yates shuffle with secure randomness so the guaranteed characters are not predictable.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.slice(0, length).join('')
}

function strengthLabel(bits: number): { label: string; color: string } {
  if (bits < 40) return { label: 'Weak', color: 'text-red-400' }
  if (bits < 60) return { label: 'Fair', color: 'text-amber-400' }
  if (bits < 80) return { label: 'Strong', color: 'text-green-400' }
  return { label: 'Very strong', color: 'text-green-400' }
}

export default function PasswordTool() {
  const [length, setLength] = useState(20)
  const [enabled, setEnabled] = useState<Record<SetKey, boolean>>({ lower: true, upper: true, digits: true, symbols: true })
  const [skipAmbiguous, setSkipAmbiguous] = useState(false)
  const [password, setPassword] = useState('')

  const pools = useMemo(() => buildPools(enabled, skipAmbiguous), [enabled, skipAmbiguous])
  const poolSize = pools.join('').length
  const bits = poolSize > 1 ? Math.round(length * Math.log2(poolSize)) : 0
  const strength = strengthLabel(bits)
  const effectiveLength = Math.max(length, pools.length)

  const regenerate = () => setPassword(generatePassword(effectiveLength, pools))

  // Generate a fresh password on first load and whenever the options change.
  useEffect(() => {
    setPassword(generatePassword(effectiveLength, pools))
  }, [effectiveLength, pools])

  const toggle = (key: SetKey) => {
    const next = { ...enabled, [key]: !enabled[key] }
    // Keep at least one character set selected.
    if (Object.values(next).some(Boolean)) setEnabled(next)
  }

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel htmlFor="password-length">Length: {length}</FieldLabel>
        <input
          id="password-length"
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={e => setLength(Number(e.target.value))}
          className="w-full accent-[hsl(var(--primary))]"
        />
      </div>

      <div>
        <FieldLabel>Characters</FieldLabel>
        <div className="flex flex-wrap gap-4">
          {(Object.keys(SETS) as SetKey[]).map(key => (
            <label key={key} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input type="checkbox" checked={enabled[key]} onChange={() => toggle(key)} className="accent-[hsl(var(--primary))]" />
              <span className="font-mono">{SET_LABELS[key]}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={skipAmbiguous}
              onChange={() => setSkipAmbiguous(s => !s)}
              className="accent-[hsl(var(--primary))]"
            />
            <span>Avoid look-alikes (I, l, 1, O, 0)</span>
          </label>
        </div>
      </div>

      <ResultBox label="Generated password" value={password} />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={regenerate}>Generate another</Button>
        <p className="text-sm font-mono text-text-secondary">
          ~{bits} bits of entropy · <span className={strength.color}>{strength.label}</span>
        </p>
      </div>

      <Note title="How it works.">
        Characters come from your browser&apos;s cryptographic random number generator, with no bias toward any
        character. Entropy is length × log₂(pool size), which assumes every character is random. A password manager
        is still the best way to store and use them.
      </Note>
    </div>
  )
}
