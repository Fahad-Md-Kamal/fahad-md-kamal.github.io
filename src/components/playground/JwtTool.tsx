import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Note, ResultBox, inputClass } from './shared'

interface Decoded {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
}

function base64UrlToText(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

function parseSegment(segment: string, name: string): Record<string, unknown> {
  let parsed: unknown
  try {
    parsed = JSON.parse(base64UrlToText(segment))
  } catch {
    throw new Error(`The ${name} is not valid base64url-encoded JSON.`)
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`The ${name} must be a JSON object.`)
  }
  return parsed as Record<string, unknown>
}

function decodeJwt(token: string): Decoded {
  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    throw new Error('A JWT has three parts separated by dots (header.payload.signature).')
  }
  return {
    header: parseSegment(parts[0], 'header'),
    payload: parseSegment(parts[1], 'payload'),
    signature: parts[2],
  }
}

function relative(seconds: number): string {
  const abs = Math.abs(seconds)
  const units: [number, string][] = [[86400, 'day'], [3600, 'hour'], [60, 'minute']]
  for (const [size, name] of units) {
    if (abs >= size) {
      const n = Math.floor(abs / size)
      return `${n} ${name}${n === 1 ? '' : 's'}`
    }
  }
  return `${Math.floor(abs)} seconds`
}

function describeTime(claim: string, value: unknown, now: number): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  const date = new Date(value * 1000)
  if (Number.isNaN(date.getTime())) return null
  const when = `${date.toLocaleString()} (${date.toISOString()})`
  const diff = value - now
  if (claim === 'exp') return `${when}: ${diff < 0 ? `expired ${relative(diff)} ago` : `expires in ${relative(diff)}`}`
  if (claim === 'nbf') return `${when}: ${diff > 0 ? `not valid for another ${relative(diff)}` : 'already valid'}`
  return `${when}: ${diff < 0 ? `${relative(diff)} ago` : `in ${relative(diff)}`}`
}

const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

export default function JwtTool() {
  const [token, setToken] = useState('')

  const result = useMemo(() => {
    if (!token.trim()) return null
    try {
      return { decoded: decodeJwt(token), error: '' }
    } catch (e) {
      return { decoded: null, error: e instanceof Error ? e.message : 'Could not decode this token.' }
    }
  }, [token])

  const decoded = result?.decoded ?? null
  const now = Math.floor(Date.now() / 1000)
  const timeClaims = decoded
    ? (['exp', 'nbf', 'iat'] as const)
        .map(claim => ({ claim, text: describeTime(claim, decoded.payload[claim], now) }))
        .filter((c): c is { claim: 'exp' | 'nbf' | 'iat'; text: string } => c.text !== null)
    : []
  const alg = decoded ? String(decoded.header.alg ?? '') : ''

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="jwt-input" className="text-xs font-mono uppercase tracking-wider text-primary">
            JWT
          </label>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setToken(SAMPLE)}>Use sample</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setToken('')}>Clear</Button>
          </div>
        </div>
        <textarea
          id="jwt-input"
          value={token}
          spellCheck={false}
          autoComplete="off"
          rows={4}
          onChange={e => setToken(e.target.value)}
          placeholder="Paste a token: xxxxx.yyyyy.zzzzz"
          className={`${inputClass} resize-y break-all`}
        />
      </div>

      {result?.error && <p className="text-[13px] sm:text-sm text-red-400" role="alert">{result.error}</p>}

      {decoded && (
        <div className="space-y-4 sm:space-y-5">
          {alg.toLowerCase() === 'none' && (
            <p className="text-[13px] sm:text-sm text-red-400" role="alert">
              This token uses alg &quot;none&quot;, which means it has no signature. A server must never accept it.
            </p>
          )}
          <ResultBox label="Header" value={JSON.stringify(decoded.header, null, 2)} />
          <ResultBox label="Payload" value={JSON.stringify(decoded.payload, null, 2)} />

          {timeClaims.length > 0 && (
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-primary mb-2">Time claims</div>
              <ul className="space-y-1 text-[13px] sm:text-sm text-text-secondary font-mono">
                {timeClaims.map(c => (
                  <li key={c.claim}>
                    <span className="text-text-primary">{c.claim}</span>: {c.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ResultBox label="Signature (not verified)" value={decoded.signature || '(empty)'} />
        </div>
      )}

      <Note title="Decoding is not verifying.">
        Anyone can create a token with any payload, so this page only shows what the token claims. A server must
        verify the signature, the expiry, the issuer and the audience before trusting it. This decoder runs in
        your browser and sends nothing anywhere, but avoid pasting live production tokens into any website.
      </Note>
    </div>
  )
}
