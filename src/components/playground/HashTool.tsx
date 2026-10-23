import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ALGORITHMS, digest, formatDigest } from '../../lib/hash'
import type { HashAlgorithm, HashFormat } from '../../lib/hash'
import { ErrorText, FieldLabel, Note, ResultBox, Segmented, inputClass } from './shared'

const FORMATS: { id: HashFormat; label: string }[] = [
  { id: 'hex', label: 'hex' },
  { id: 'HEX', label: 'HEX' },
  { id: 'base64', label: 'base64' },
]

export default function HashTool() {
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256')
  const [format, setFormat] = useState<HashFormat>('hex')
  const [input, setInput] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [bytes, setBytes] = useState<Uint8Array | null>(null)
  const [error, setError] = useState('')

  const selected = ALGORITHMS.find(a => a.id === algorithm)!

  const reset = () => {
    setBytes(null)
    setError('')
  }

  const generate = async () => {
    if (!input) {
      setError('Enter some text first.')
      setBytes(null)
      return
    }
    try {
      setError('')
      setBytes(await digest(algorithm, input))
    } catch {
      setBytes(null)
      setError('Hashing is not available in this browser.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel>Algorithm</FieldLabel>
        <Segmented
          label="Hash algorithm"
          value={algorithm}
          options={ALGORITHMS.map(a => ({ id: a.id }))}
          onChange={a => { setAlgorithm(a); reset() }}
        />
        <p className="mt-2 text-xs text-text-secondary font-mono">
          {selected.bits}-bit digest
          {selected.legacy && (
            <Badge variant="outline" className="ml-2 border-amber-500/40 text-amber-400">
              legacy, not secure
            </Badge>
          )}
        </p>
      </div>

      <div>
        <FieldLabel htmlFor="hash-input">Text or password</FieldLabel>
        <div className="flex gap-2">
          <input
            id="hash-input"
            type={showInput ? 'text' : 'password'}
            value={input}
            autoComplete="off"
            spellCheck={false}
            onChange={e => { setInput(e.target.value); reset() }}
            onKeyDown={e => { if (e.key === 'Enter') generate() }}
            placeholder="Type something to hash"
            className={inputClass}
          />
          <Button type="button" variant="outline" onClick={() => setShowInput(s => !s)}>
            {showInput ? 'Hide' : 'Show'}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={generate}>Generate hash</Button>
        <div className="ml-auto">
          <Segmented label="Output format" value={format} options={FORMATS} onChange={setFormat} size="sm" />
        </div>
      </div>

      {error && <ErrorText>{error}</ErrorText>}
      {bytes && <ResultBox label={`${algorithm} result`} value={formatDigest(bytes, format)} />}

      <Note title="Not for storing passwords.">
        These are fast hashes, so attackers can try billions of guesses per second. MD5 and SHA-1 are also broken for
        security use. Use them for checksums and comparisons. To store passwords, use a slow, salted algorithm such as
        Argon2id or bcrypt.
      </Note>
    </div>
  )
}
