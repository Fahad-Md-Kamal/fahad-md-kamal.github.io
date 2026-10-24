import { useMemo, useState } from 'react'
import { parseCurl, toFetch, toPython } from '../../lib/curl'
import { ErrorText, FieldLabel, Note, ResultBox, Segmented, inputClass } from './shared'

type Target = 'python' | 'fetch'

const SAMPLE = `curl -X POST https://api.example.com/v1/orders \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"item_id": 42, "quantity": 2}'`

export default function CurlTool() {
  const [command, setCommand] = useState(SAMPLE)
  const [target, setTarget] = useState<Target>('python')

  const result = useMemo(() => {
    if (!command.trim()) return null
    try {
      const parsed = parseCurl(command)
      return { code: target === 'python' ? toPython(parsed) : toFetch(parsed), warnings: parsed.warnings, error: '' }
    } catch (e) {
      return { code: '', warnings: [] as string[], error: e instanceof Error ? e.message : 'Could not parse this command.' }
    }
  }, [command, target])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <FieldLabel htmlFor="curl-input">cURL command</FieldLabel>
        <textarea
          id="curl-input"
          value={command}
          rows={6}
          spellCheck={false}
          onChange={e => setCommand(e.target.value)}
          placeholder="curl https://api.example.com/health"
          className={`${inputClass} resize-y`}
        />
      </div>

      <Segmented
        label="Output language"
        value={target}
        options={[{ id: 'python', label: 'Python (requests)' }, { id: 'fetch', label: 'JavaScript (fetch)' }]}
        onChange={setTarget}
      />

      {result?.error && <ErrorText>{result.error}</ErrorText>}
      {result?.warnings.map(warning => (
        <p key={warning} className="text-[13px] sm:text-sm text-amber-400 font-mono">⚠ {warning}</p>
      ))}
      {result?.code && <ResultBox label={target === 'python' ? 'Python' : 'JavaScript'} value={result.code} />}

      <Note title="Check before you use it.">
        This handles the common options (method, headers, data, basic auth, cookies and --json) and tells you about
        anything it skips. Review the output before running it, and never paste real tokens into a website. This one
        works locally, but the habit matters.
      </Note>
    </div>
  )
}
