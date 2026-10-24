import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ALGORITHMS, digestBytes, formatDigest } from '../../lib/hash'
import type { HashAlgorithm } from '../../lib/hash'
import { ErrorText, FieldLabel, Note, ResultBox, Segmented, inputClass } from './shared'

const MAX_BYTES = 200 * 1024 * 1024

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

export default function ChecksumTool() {
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256')
  const [file, setFile] = useState<File | null>(null)
  const [hash, setHash] = useState('')
  const [expected, setExpected] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const compute = async (target: File, alg: HashAlgorithm) => {
    if (target.size > MAX_BYTES) {
      setError(`This file is larger than ${formatSize(MAX_BYTES)}. The browser has to read the whole file into memory to hash it.`)
      setHash('')
      return
    }
    setBusy(true)
    setError('')
    try {
      const buffer = await target.arrayBuffer()
      const bytes = await digestBytes(alg, new Uint8Array(buffer))
      setHash(formatDigest(bytes, 'hex'))
    } catch {
      setHash('')
      setError('Could not read or hash this file.')
    } finally {
      setBusy(false)
    }
  }

  const choose = (target: File | undefined) => {
    if (!target) return
    setFile(target)
    setHash('')
    compute(target, algorithm)
  }

  const changeAlgorithm = (alg: HashAlgorithm) => {
    setAlgorithm(alg)
    setHash('')
    if (file) compute(file, alg)
  }

  const normalizedExpected = expected.trim().toLowerCase()
  const match = hash && normalizedExpected ? hash === normalizedExpected : null

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <FieldLabel>Algorithm</FieldLabel>
        <Segmented
          label="Checksum algorithm"
          value={algorithm}
          options={ALGORITHMS.map(a => ({ id: a.id }))}
          onChange={changeAlgorithm}
        />
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); choose(e.dataTransfer.files[0]) }}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? 'border-primary bg-primary/10' : 'border-border/60 bg-background/40'
        }`}
      >
        <p className="text-[13px] sm:text-sm text-text-secondary mb-3">Drop a file here, or choose one. It is read locally and never uploaded.</p>
        <input ref={inputRef} type="file" className="hidden" onChange={e => choose(e.target.files?.[0])} />
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>Choose file</Button>
        {file && (
          <p className="mt-3 text-xs font-mono text-text-secondary break-all">
            {file.name} · {formatSize(file.size)}
          </p>
        )}
      </div>

      {busy && <p className="text-[13px] sm:text-sm text-text-secondary font-mono" aria-live="polite">Hashing…</p>}
      {error && <ErrorText>{error}</ErrorText>}
      {hash && <ResultBox label={`${algorithm} checksum`} value={hash} />}

      <div>
        <FieldLabel htmlFor="expected-hash">Compare with expected hash (optional)</FieldLabel>
        <input
          id="expected-hash"
          type="text"
          value={expected}
          spellCheck={false}
          autoComplete="off"
          onChange={e => setExpected(e.target.value)}
          placeholder="Paste the checksum published by the download page"
          className={inputClass}
        />
        {match !== null && (
          <p className={`mt-2 text-[13px] sm:text-sm font-mono ${match ? 'text-green-400' : 'text-red-400'}`} role="status">
            {match ? '✓ Match: the file is identical.' : '✗ No match: the file differs from the expected hash.'}
          </p>
        )}
      </div>

      <Note title="Why check?">
        A matching checksum shows the file wasn&apos;t corrupted or altered after the publisher computed it. It only
        helps if the expected hash comes from a trustworthy place, such as the publisher&apos;s own HTTPS page, and
        it should be SHA-256 or stronger because MD5 and SHA-1 can be forged.
      </Note>
    </div>
  )
}
