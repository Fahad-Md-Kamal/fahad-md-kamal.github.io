import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ALGORITHMS, digest, formatDigest } from '../lib/hash'
import type { HashAlgorithm, HashFormat } from '../lib/hash'
import DecodeText from './DecodeText'
import Reveal from './Reveal'

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
  const [copied, setCopied] = useState(false)

  const selected = ALGORITHMS.find(a => a.id === algorithm)!
  const output = bytes ? formatDigest(bytes, format) : ''

  const reset = () => {
    setBytes(null)
    setCopied(false)
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
      setCopied(false)
    } catch {
      setBytes(null)
      setError('Hashing is not available in this browser.')
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setError('Could not copy. Select the hash and copy it manually.')
    }
  }

  return (
    <section id="playground" className="py-20 md:py-28 bg-surface/90">
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          <Reveal className="mb-10">
            <div className="section-eyebrow">
              <DecodeText text="Playground" />
            </div>
            <DecodeText as="h2" text="Hash generator" className="section-title mb-4" />
            <p className="text-lg text-text-secondary leading-relaxed">
              Pick an algorithm, enter text, and get its hash. It runs entirely in your browser; nothing you type is sent anywhere.
            </p>
          </Reveal>

          <Reveal>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-primary mb-2">Algorithm</div>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Hash algorithm">
                    {ALGORITHMS.map(a => (
                      <button
                        key={a.id}
                        type="button"
                        role="radio"
                        aria-checked={algorithm === a.id}
                        onClick={() => { setAlgorithm(a.id); reset() }}
                        className={`rounded-xl border px-4 py-2 text-sm font-mono transition-colors ${
                          algorithm === a.id
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-border/60 text-text-secondary hover:border-primary/40 hover:text-text-primary'
                        }`}
                      >
                        {a.id}
                      </button>
                    ))}
                  </div>
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
                  <label htmlFor="hash-input" className="text-xs font-mono uppercase tracking-wider text-primary mb-2 block">
                    Text or password
                  </label>
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
                      className="flex-1 min-w-0 rounded-xl border border-border/60 bg-background/60 px-4 py-3 text-sm font-mono text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary/60"
                    />
                    <Button type="button" variant="outline" onClick={() => setShowInput(s => !s)}>
                      {showInput ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="button" onClick={generate}>Generate hash</Button>
                  <div className="flex items-center gap-1 ml-auto" role="radiogroup" aria-label="Output format">
                    {FORMATS.map(f => (
                      <button
                        key={f.id}
                        type="button"
                        role="radio"
                        aria-checked={format === f.id}
                        onClick={() => setFormat(f.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-colors ${
                          format === f.id ? 'bg-primary/15 text-primary' : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-sm text-red-400" role="alert">{error}</p>}

                {output && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-mono uppercase tracking-wider text-primary">
                        {algorithm} result
                      </div>
                      <Button type="button" size="sm" variant="outline" onClick={copy}>
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                    <output
                      aria-live="polite"
                      className="block rounded-xl border border-border/60 bg-background/60 px-4 py-3 text-sm font-mono text-text-primary break-all select-all"
                    >
                      {output}
                    </output>
                  </div>
                )}

                <div className="rounded-xl border border-border/60 bg-background/40 p-4 text-sm text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">Not for storing passwords.</strong> These are fast hashes,
                  so attackers can try billions of guesses per second. MD5 and SHA-1 are also broken for security
                  use. Use them for checksums and comparisons. To store passwords, use a slow, salted algorithm such
                  as Argon2id or bcrypt.
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
