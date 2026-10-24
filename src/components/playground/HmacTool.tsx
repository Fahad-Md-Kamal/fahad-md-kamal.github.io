import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { HMAC_ALGORITHMS, hmacDigest, formatDigest } from '../../lib/hash'
import type { HashAlgorithm, HashFormat } from '../../lib/hash'
import { ErrorText, FieldLabel, Note, ResultBox, Segmented, inputClass } from './shared'

type HmacAlgorithm = Exclude<HashAlgorithm, 'MD5'>

// Constant-time string comparison, as you would do when verifying a signature on a server.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// Accepts hex or base64/base64url, with or without a "sha256=" style prefix.
function signatureMatches(bytes: Uint8Array, pasted: string): boolean {
  const cleaned = pasted.trim().replace(/^sha(1|256|384|512)=/i, '')
  if (!cleaned) return false
  if (/^[0-9a-f]+$/i.test(cleaned)) return safeEqual(formatDigest(bytes, 'hex'), cleaned.toLowerCase())
  const normalize = (s: string) => s.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '')
  return safeEqual(normalize(formatDigest(bytes, 'base64')), normalize(cleaned))
}

const FORMATS: { id: HashFormat; label: string }[] = [
  { id: 'hex', label: 'hex' },
  { id: 'HEX', label: 'HEX' },
  { id: 'base64', label: 'base64' },
]

export default function HmacTool() {
  const [algorithm, setAlgorithm] = useState<HmacAlgorithm>('SHA-256')
  const [format, setFormat] = useState<HashFormat>('hex')
  const [key, setKey] = useState('')
  const [message, setMessage] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [bytes, setBytes] = useState<Uint8Array | null>(null)
  const [error, setError] = useState('')
  const [expected, setExpected] = useState('')
  const verdict = useMemo(
    () => (bytes && expected.trim() ? signatureMatches(bytes, expected) : null),
    [bytes, expected],
  )

  const reset = () => {
    setBytes(null)
    setError('')
  }

  const generate = async () => {
    if (!key) {
      setError('Enter a secret key.')
      setBytes(null)
      return
    }
    try {
      setError('')
      setBytes(await hmacDigest(algorithm, key, message))
    } catch {
      setBytes(null)
      setError('HMAC is not available in this browser.')
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <FieldLabel>Algorithm</FieldLabel>
        <Segmented
          label="HMAC algorithm"
          value={algorithm}
          options={HMAC_ALGORITHMS.map(a => ({ id: a.id as HmacAlgorithm }))}
          onChange={a => { setAlgorithm(a); reset() }}
        />
      </div>

      <div>
        <FieldLabel htmlFor="hmac-key">Secret key</FieldLabel>
        <div className="flex gap-2">
          <input
            id="hmac-key"
            type={showKey ? 'text' : 'password'}
            value={key}
            autoComplete="off"
            spellCheck={false}
            onChange={e => { setKey(e.target.value); reset() }}
            placeholder="Shared secret"
            className={inputClass}
          />
          <Button type="button" variant="outline" onClick={() => setShowKey(s => !s)}>
            {showKey ? 'Hide' : 'Show'}
          </Button>
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="hmac-message">Message</FieldLabel>
        <textarea
          id="hmac-message"
          value={message}
          spellCheck={false}
          rows={4}
          onChange={e => { setMessage(e.target.value); reset() }}
          placeholder='e.g. a webhook body: {"id":"evt_123","type":"payment.succeeded"}'
          className={`${inputClass} resize-y`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={generate}>Generate HMAC</Button>
        <div className="ml-auto">
          <Segmented label="Output format" value={format} options={FORMATS} onChange={setFormat} size="sm" />
        </div>
      </div>

      {error && <ErrorText>{error}</ErrorText>}
      {bytes && <ResultBox label={`HMAC-${algorithm} result`} value={formatDigest(bytes, format)} />}

      <div>
        <FieldLabel htmlFor="hmac-expected">Verify a signature (optional)</FieldLabel>
        <input
          id="hmac-expected"
          type="text"
          value={expected}
          spellCheck={false}
          autoComplete="off"
          onChange={e => setExpected(e.target.value)}
          placeholder="Paste the signature you received (hex or base64, e.g. sha256=ab12…)"
          className={inputClass}
        />
        {expected.trim() && !bytes && (
          <p className="mt-2 text-xs font-mono text-text-secondary">Generate the HMAC first, then it is compared with this signature.</p>
        )}
        {verdict !== null && (
          <p className={`mt-2 text-[13px] sm:text-sm font-mono ${verdict ? 'text-green-400' : 'text-red-400'}`} role="status">
            {verdict
              ? '✓ Valid: this key and message produce that signature.'
              : '✗ Not valid: the key, message or algorithm differs, or the signature was altered.'}
          </p>
        )}
      </div>

      <Note title="Where this is used.">
        HMAC is one-way: you can&apos;t decrypt it, and the message itself is not hidden. Verifying means recomputing the
        signature with the same key and message and comparing the two. A match proves the message came from someone who
        knows the secret and wasn&apos;t changed on the way, which is how webhook signatures (Stripe, GitHub) work. On your
        server, compare in constant time and reject old timestamps to stop replays. Never put a real production secret
        into any website.
      </Note>
    </div>
  )
}
