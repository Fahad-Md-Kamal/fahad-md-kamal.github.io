import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CopyButton, ErrorText, FieldLabel, Note, Segmented, inputClass } from './shared'

type Mode = 'encode' | 'decode'
type Format = 'uri' | 'base64' | 'img' | 'css' | 'md'

const MAX_BYTES = 10 * 1024 * 1024
const PREVIEW_CHARS = 600

const FORMATS: { id: Format; label: string }[] = [
  { id: 'uri', label: 'Data URI' },
  { id: 'base64', label: 'Base64' },
  { id: 'img', label: '<img>' },
  { id: 'css', label: 'CSS' },
  { id: 'md', label: 'Markdown' },
]

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`
}

// Guess an image type from the first bytes of the decoded data.
function sniffMime(base64: string): string | null {
  let head: string
  try {
    head = atob(base64.slice(0, 48 - (48 % 4)))
  } catch {
    return null
  }
  const b = (i: number) => head.charCodeAt(i)
  if (b(0) === 0x89 && head.slice(1, 4) === 'PNG') return 'image/png'
  if (b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return 'image/jpeg'
  if (head.startsWith('GIF8')) return 'image/gif'
  if (head.startsWith('RIFF') && head.slice(8, 12) === 'WEBP') return 'image/webp'
  if (head.startsWith('BM')) return 'image/bmp'
  if (b(0) === 0 && b(1) === 0 && b(2) === 1 && b(3) === 0) return 'image/x-icon'
  const text = head.trimStart().toLowerCase()
  if (text.startsWith('<svg') || text.startsWith('<?xml')) return 'image/svg+xml'
  return null
}

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/x-icon': 'ico',
  'image/svg+xml': 'svg',
}

// Long strings are slow to put in the page, so only a preview is shown; Copy always copies everything.
function LongOutput({ label, value }: { label: string; value: string }) {
  const shown = value.length > PREVIEW_CHARS ? `${value.slice(0, PREVIEW_CHARS)}…` : value
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-mono uppercase tracking-wider text-primary">
          {label} · {value.length.toLocaleString()} characters
        </div>
        <CopyButton text={value} />
      </div>
      <output className="block rounded-xl border border-border/60 bg-background/60 px-4 py-3 text-[13px] sm:text-sm font-mono text-text-primary break-all">
        {shown}
      </output>
      {value.length > PREVIEW_CHARS && (
        <p className="mt-1 text-xs text-text-secondary">Showing the first {PREVIEW_CHARS} characters. Copy gives you the whole thing.</p>
      )}
    </div>
  )
}

export default function ImageBase64Tool() {
  const [mode, setMode] = useState<Mode>('encode')
  const [format, setFormat] = useState<Format>('uri')
  const [dataUri, setDataUri] = useState('')
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null)
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [pasted, setPasted] = useState('')
  const [decoded, setDecoded] = useState<{ uri: string; mime: string; bytes: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const switchMode = (next: Mode) => {
    setMode(next)
    setError('')
  }

  const choose = (file: File | undefined) => {
    if (!file) return
    setError('')
    if (!file.type.startsWith('image/')) {
      setError("That doesn't look like an image file.")
      return
    }
    if (file.size > MAX_BYTES) {
      setError(`That image is ${formatSize(file.size)}. The limit here is ${formatSize(MAX_BYTES)}.`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setDataUri(String(reader.result))
      setFileInfo({ name: file.name, size: file.size })
      setDimensions(null)
    }
    reader.onerror = () => setError('Could not read that file.')
    reader.readAsDataURL(file)
  }

  const comma = dataUri.indexOf(',')
  const base64 = comma >= 0 ? dataUri.slice(comma + 1) : ''
  const sizeAttrs = dimensions ? ` width="${dimensions.w}" height="${dimensions.h}"` : ''
  const outputs: Record<Format, string> = {
    uri: dataUri,
    base64,
    img: `<img src="${dataUri}"${sizeAttrs} alt="">`,
    css: `background-image: url("${dataUri}");`,
    md: `![](${dataUri})`,
  }

  const decode = () => {
    setError('')
    setDecoded(null)
    const input = pasted.trim()
    if (!input) {
      setError('Paste a Base64 string or a data URI first.')
      return
    }
    let raw: string
    let mime: string | null = null
    if (input.startsWith('data:')) {
      const match = /^data:([^;,]*)(;base64)?,(.*)$/s.exec(input)
      if (!match || !match[2]) {
        setError('Only Base64 data URIs are supported (they look like data:image/png;base64,…).')
        return
      }
      mime = match[1] || null
      raw = match[3]
    } else {
      raw = input
    }
    raw = raw.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/')
    try {
      atob(raw.slice(0, 64 - (64 % 4)))
    } catch {
      setError('That is not valid Base64.')
      return
    }
    const type = mime && mime.startsWith('image/') ? mime : sniffMime(raw)
    if (!type) {
      setError('Could not tell what kind of image this is. Paste a full data URI that starts with data:image/…')
      return
    }
    const padding = raw.endsWith('==') ? 2 : raw.endsWith('=') ? 1 : 0
    setDecoded({ uri: `data:${type};base64,${raw}`, mime: type, bytes: Math.floor((raw.length * 3) / 4) - padding })
  }

  const download = async () => {
    if (!decoded) return
    try {
      const blob = await (await fetch(decoded.uri)).blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `image.${EXTENSIONS[decoded.mime] ?? 'bin'}`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Could not prepare the download.')
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Segmented
        label="Direction"
        value={mode}
        options={[{ id: 'encode', label: 'Image → Base64' }, { id: 'decode', label: 'Base64 → Image' }]}
        onChange={switchMode}
      />

      {mode === 'encode' ? (
        <>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); choose(e.dataTransfer.files[0]) }}
            className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragging ? 'border-primary bg-primary/10' : 'border-border/60 bg-background/40'
            }`}
          >
            <p className="text-[13px] sm:text-sm text-text-secondary mb-3">Drop an image here, or choose one. It is read locally and never uploaded.</p>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => choose(e.target.files?.[0])} />
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>Choose image</Button>
          </div>

          {error && <ErrorText>{error}</ErrorText>}

          {dataUri && fileInfo && (
            <div className="space-y-4 sm:space-y-5">
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/60 bg-background/40 p-4">
                <img
                  src={dataUri}
                  alt="Preview of the chosen image"
                  onLoad={e => setDimensions({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
                  className="h-20 w-20 object-contain rounded-lg bg-white/5 border border-border/60"
                />
                <div className="text-[13px] sm:text-sm font-mono min-w-0">
                  <div className="text-text-primary break-all">{fileInfo.name}</div>
                  <div className="text-text-secondary">
                    {dimensions ? `${dimensions.w}×${dimensions.h} px · ` : ''}file {formatSize(fileInfo.size)} → Base64 {formatSize(base64.length)}
                  </div>
                </div>
              </div>

              <Segmented label="Output format" value={format} options={FORMATS} onChange={setFormat} size="sm" />
              <LongOutput label={FORMATS.find(f => f.id === format)!.label} value={outputs[format]} />
            </div>
          )}
        </>
      ) : (
        <>
          <div>
            <FieldLabel htmlFor="image64-input">Base64 string or data URI</FieldLabel>
            <textarea
              id="image64-input"
              value={pasted}
              rows={5}
              spellCheck={false}
              onChange={e => { setPasted(e.target.value); setDecoded(null); setError('') }}
              placeholder="data:image/png;base64,iVBORw0KGgo…"
              className={`${inputClass} resize-y break-all`}
            />
          </div>
          <Button type="button" onClick={decode}>Show image</Button>

          {error && <ErrorText>{error}</ErrorText>}

          {decoded && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-background/40 p-4 flex flex-col items-start gap-3">
                <img
                  src={decoded.uri}
                  alt="Decoded image"
                  onError={() => { setDecoded(null); setError('That Base64 is not a readable image.') }}
                  className="max-h-72 max-w-full object-contain rounded-lg bg-white/5"
                />
                <p className="text-xs font-mono text-text-secondary">{decoded.mime} · about {formatSize(decoded.bytes)}</p>
              </div>
              <Button type="button" variant="outline" onClick={download}>Download image</Button>
            </div>
          )}
        </>
      )}

      <Note title="Use it sparingly.">
        Base64 makes data about 33% bigger and the browser can&apos;t cache it separately from the page, so it only makes
        sense for tiny images such as icons under about 10 KB. For larger images use a normal file or a CDN. SVGs are
        usually better inlined as text. It is also an encoding, not protection, because anyone can decode it.
      </Note>
    </div>
  )
}
