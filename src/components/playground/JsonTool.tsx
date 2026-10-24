import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ErrorText, FieldLabel, Note, ResultBox, Segmented, inputClass } from './shared'

type Indent = '2' | '4'

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, sortKeys(v)]),
    )
  }
  return value
}

export default function JsonTool() {
  const [input, setInput] = useState('')
  const [indent, setIndent] = useState<Indent>('2')
  const [output, setOutput] = useState('')
  const [outputLabel, setOutputLabel] = useState('Output')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const run = async (label: string, action: (parsed: unknown) => string | Promise<string>, parseAs: 'json' | 'yaml' = 'json') => {
    setInfo('')
    if (!input.trim()) {
      setError('Paste some input first.')
      setOutput('')
      return
    }
    try {
      let parsed: unknown
      if (parseAs === 'json') {
        parsed = JSON.parse(input)
      } else {
        const { parse } = await import('yaml')
        parsed = parse(input)
      }
      setOutput(await action(parsed))
      setOutputLabel(label)
      setError('')
    } catch (e) {
      setOutput('')
      setError(e instanceof Error ? e.message : 'Could not process this input.')
    }
  }

  const validate = () => {
    if (!input.trim()) {
      setError('Paste some input first.')
      return
    }
    try {
      JSON.parse(input)
      setError('')
      setOutput('')
      setInfo('✓ Valid JSON')
    } catch (e) {
      setInfo('')
      setError(e instanceof Error ? e.message : 'Invalid JSON.')
    }
  }

  const spaces = Number(indent)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <FieldLabel htmlFor="json-input">JSON or YAML</FieldLabel>
          <Button type="button" size="sm" variant="ghost" onClick={() => { setInput(''); setOutput(''); setError(''); setInfo('') }}>
            Clear
          </Button>
        </div>
        <textarea
          id="json-input"
          value={input}
          rows={8}
          spellCheck={false}
          onChange={e => setInput(e.target.value)}
          placeholder='{"name":"Fahad","skills":["python","go"]}'
          className={`${inputClass} resize-y`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={() => run('Formatted JSON', p => JSON.stringify(p, null, spaces))}>Format</Button>
        <Button type="button" variant="outline" onClick={() => run('Minified JSON', p => JSON.stringify(p))}>Minify</Button>
        <Button type="button" variant="outline" onClick={() => run('Sorted JSON', p => JSON.stringify(sortKeys(p), null, spaces))}>
          Sort keys
        </Button>
        <Button type="button" variant="outline" onClick={validate}>Validate</Button>
        <div className="ml-auto">
          <Segmented
            label="Indent"
            value={indent}
            options={[{ id: '2', label: '2 spaces' }, { id: '4', label: '4 spaces' }]}
            onChange={setIndent}
            size="sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => run('YAML', async p => (await import('yaml')).stringify(p))}
        >
          JSON → YAML
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => run('JSON', p => JSON.stringify(p, null, spaces), 'yaml')}
        >
          YAML → JSON
        </Button>
      </div>

      {error && <ErrorText>{error}</ErrorText>}
      {info && <p className="text-[13px] sm:text-sm font-mono text-green-400" role="status">{info}</p>}
      {output && <ResultBox label={outputLabel} value={output} />}

      <Note title="Tip.">
        JSON allows only double quotes, no trailing commas and no comments, which is why many hand-written files fail
        validation. YAML is a superset-style format that allows comments, so converting JSON to YAML is lossless but the
        reverse can drop comments.
      </Note>
    </div>
  )
}
