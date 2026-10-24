import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { FieldLabel, Note, ResultBox, Segmented, inputClass } from './shared'

type Mode = 'base64' | 'base64url' | 'url' | 'hex'
type Direction = 'encode' | 'decode'

const MODES: { id: Mode; label: string }[] = [
  { id: 'base64', label: 'Base64' },
  { id: 'base64url', label: 'Base64URL' },
  { id: 'url', label: 'URL' },
  { id: 'hex', label: 'Hex' },
]

const bytesToBinary = (bytes: Uint8Array) => {
  let binary = ''
  bytes.forEach(b => { binary += String.fromCharCode(b) })
  return binary
}

function toBase64(text: string): string {
  return btoa(bytesToBinary(new TextEncoder().encode(text)))
}

function fromBase64(value: string): string {
  const cleaned = value.replace(/\s+/g, '')
  const binary = atob(cleaned)
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

function transform(mode: Mode, direction: Direction, input: string): string {
  if (direction === 'encode') {
    switch (mode) {
      case 'base64': return toBase64(input)
      case 'base64url': return toBase64(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      case 'url': return encodeURIComponent(input)
      case 'hex': return Array.from(new TextEncoder().encode(input), b => b.toString(16).padStart(2, '0')).join('')
    }
  }
  switch (mode) {
    case 'base64': return fromBase64(input)
    case 'base64url': {
      const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
      return fromBase64(base64 + '='.repeat((4 - (base64.replace(/\s+/g, '').length % 4)) % 4))
    }
    case 'url': return decodeURIComponent(input)
    case 'hex': {
      const hex = input.replace(/\s+/g, '').replace(/^0x/i, '')
      if (hex.length % 2 !== 0 || /[^0-9a-f]/i.test(hex)) throw new Error('Not valid hex.')
      const bytes = Uint8Array.from(hex.match(/.{2}/g) ?? [], pair => parseInt(pair, 16))
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    }
  }
}

export default function EncodeTool() {
  const [mode, setMode] = useState<Mode>('base64')
  const [direction, setDirection] = useState<Direction>('encode')
  const [input, setInput] = useState('')

  const result = useMemo(() => {
    if (!input) return { output: '', error: '' }
    try {
      return { output: transform(mode, direction, input), error: '' }
    } catch {
      return { output: '', error: `That input isn't valid ${MODES.find(m => m.id === mode)!.label} to decode.` }
    }
  }, [mode, direction, input])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <Segmented label="Format" value={mode} options={MODES} onChange={setMode} />
        <Segmented
          label="Direction"
          value={direction}
          options={[{ id: 'encode', label: 'Encode' }, { id: 'decode', label: 'Decode' }]}
          onChange={setDirection}
          size="sm"
        />
      </div>

      <div>
        <FieldLabel htmlFor="encode-input">Input</FieldLabel>
        <textarea
          id="encode-input"
          value={input}
          rows={4}
          spellCheck={false}
          onChange={e => setInput(e.target.value)}
          placeholder={direction === 'encode' ? 'Text to encode' : 'Encoded text to decode'}
          className={`${inputClass} resize-y`}
        />
      </div>

      {result.error && <p className="text-[13px] sm:text-sm text-red-400" role="alert">{result.error}</p>}
      {result.output && (
        <>
          <ResultBox label="Output" value={result.output} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setInput(result.output); setDirection(d => (d === 'encode' ? 'decode' : 'encode')) }}
          >
            Use output as input (flip direction)
          </Button>
        </>
      )}

      <Note title="Encoding is not encryption.">
        Base64, URL encoding and hex only change how data is written, so anyone can reverse them. Never use them to
        hide a secret. Base64URL is the variant JWTs use (no + / or = padding).
      </Note>
    </div>
  )
}
