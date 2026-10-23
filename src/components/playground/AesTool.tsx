import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AES_INFO, decryptText, encryptText } from '../../lib/aes'
import { ErrorText, FieldLabel, Note, ResultBox, Segmented, inputClass } from './shared'

type Mode = 'encrypt' | 'decrypt'

export default function AesTool() {
  const [mode, setMode] = useState<Mode>('encrypt')
  const [passphrase, setPassphrase] = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setOutput('')
    setError('')
  }

  const run = async () => {
    if (!passphrase) {
      setError('Enter a passphrase.')
      setOutput('')
      return
    }
    if (!input) {
      setError(mode === 'encrypt' ? 'Enter the text to encrypt.' : 'Paste the encrypted text.')
      setOutput('')
      return
    }
    setBusy(true)
    setError('')
    try {
      setOutput(mode === 'encrypt' ? await encryptText(input, passphrase) : await decryptText(input.trim(), passphrase))
    } catch (e) {
      setOutput('')
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <Segmented
        label="Mode"
        value={mode}
        options={[{ id: 'encrypt', label: 'Encrypt' }, { id: 'decrypt', label: 'Decrypt' }]}
        onChange={m => { setMode(m); reset() }}
      />

      <div>
        <FieldLabel htmlFor="aes-passphrase">Passphrase</FieldLabel>
        <div className="flex gap-2">
          <input
            id="aes-passphrase"
            type={showPassphrase ? 'text' : 'password'}
            value={passphrase}
            autoComplete="off"
            spellCheck={false}
            onChange={e => { setPassphrase(e.target.value); reset() }}
            placeholder="A long, unique passphrase"
            className={inputClass}
          />
          <Button type="button" variant="outline" onClick={() => setShowPassphrase(s => !s)}>
            {showPassphrase ? 'Hide' : 'Show'}
          </Button>
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="aes-input">{mode === 'encrypt' ? 'Text to encrypt' : 'Encrypted text'}</FieldLabel>
        <textarea
          id="aes-input"
          value={input}
          rows={5}
          spellCheck={false}
          onChange={e => { setInput(e.target.value); reset() }}
          placeholder={mode === 'encrypt' ? 'Your message' : 'Paste the base64 text produced by Encrypt'}
          className={`${inputClass} resize-y ${mode === 'decrypt' ? 'break-all' : ''}`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={run} disabled={busy}>
          {busy ? 'Working…' : mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
        </Button>
        {output && mode === 'encrypt' && (
          <Button
            type="button"
            variant="outline"
            onClick={() => { setMode('decrypt'); setInput(output); setOutput('') }}
          >
            Try decrypting this
          </Button>
        )}
      </div>

      {error && <ErrorText>{error}</ErrorText>}
      {output && <ResultBox label={mode === 'encrypt' ? 'Encrypted (base64)' : 'Decrypted text'} value={output} />}

      <Note title="How it works.">
        Your passphrase is stretched into a 256-bit key with PBKDF2 ({AES_INFO.iterations.toLocaleString()} rounds of
        SHA-256) and a random salt, then the text is encrypted with AES-GCM using a random IV. Both are stored inside the
        output, so the same text encrypts to different output every time. GCM also detects tampering, so a wrong
        passphrase or edited data fails to decrypt instead of producing garbage. Everything happens in your browser,
        but this is a learning tool: the passphrase is the only protection, so it must be long and unique, and for real
        secrets use a vetted tool such as age or a password manager.
      </Note>
    </div>
  )
}
