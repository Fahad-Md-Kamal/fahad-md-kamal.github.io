// A small cURL command parser and code generator for the common cases:
// method, URL, headers, body, basic auth, cookies and --json.

export interface ParsedCurl {
  url: string
  method: string
  headers: Record<string, string>
  body?: string
  warnings: string[]
}

function tokenize(command: string): string[] {
  const input = command.replace(/\\\r?\n/g, ' ')
  const tokens: string[] = []
  let current = ''
  let started = false
  let i = 0
  while (i < input.length) {
    const ch = input[i]
    if (ch === "'") {
      started = true
      const end = input.indexOf("'", i + 1)
      if (end === -1) throw new Error('Unclosed single quote.')
      current += input.slice(i + 1, end)
      i = end + 1
    } else if (ch === '"') {
      started = true
      i++
      let closed = false
      while (i < input.length) {
        if (input[i] === '\\' && i + 1 < input.length && '"\\$`'.includes(input[i + 1])) {
          current += input[i + 1]
          i += 2
        } else if (input[i] === '"') {
          closed = true
          i++
          break
        } else {
          current += input[i++]
        }
      }
      if (!closed) throw new Error('Unclosed double quote.')
    } else if (ch === '\\' && i + 1 < input.length) {
      started = true
      current += input[i + 1]
      i += 2
    } else if (/\s/.test(ch)) {
      if (started) tokens.push(current)
      current = ''
      started = false
      i++
    } else {
      started = true
      current += ch
      i++
    }
  }
  if (started) tokens.push(current)
  return tokens
}

const SHORT_WITH_ARG = new Set(['X', 'H', 'd', 'u', 'A', 'b', 'F', 'e', 'o', 'm'])
const LONG_WITH_ARG = new Set([
  '--request', '--header', '--data', '--data-raw', '--data-binary', '--data-ascii', '--data-urlencode',
  '--user', '--user-agent', '--cookie', '--url', '--json', '--form', '--referer', '--output', '--max-time',
])
const LONG_IGNORED = new Set([
  '--compressed', '--silent', '--show-error', '--location', '--verbose', '--include', '--fail', '--insecure',
  '--globoff', '--http1.1', '--http2',
])

export function parseCurl(command: string): ParsedCurl {
  const tokens = tokenize(command.trim())
  if (tokens.length === 0) throw new Error('Paste a curl command.')
  if (tokens[0] === 'curl') tokens.shift()

  const result: ParsedCurl = { url: '', method: '', headers: {}, warnings: [] }
  const bodyParts: string[] = []
  let user = ''

  const setHeader = (raw: string) => {
    const index = raw.indexOf(':')
    if (index === -1) {
      result.warnings.push(`Skipped header "${raw}" because it has no colon.`)
      return
    }
    result.headers[raw.slice(0, index).trim()] = raw.slice(index + 1).trim()
  }

  const apply = (flag: string, value: string) => {
    switch (flag) {
      case '-X': case '--request': result.method = value.toUpperCase(); break
      case '-H': case '--header': setHeader(value); break
      case '-d': case '--data': case '--data-raw': case '--data-binary': case '--data-ascii':
        bodyParts.push(value); break
      case '--data-urlencode':
        bodyParts.push(value)
        result.warnings.push('--data-urlencode: the value is used as-is and is not URL-encoded here.')
        break
      case '--json':
        bodyParts.push(value)
        result.headers['Content-Type'] ??= 'application/json'
        result.headers['Accept'] ??= 'application/json'
        break
      case '-u': case '--user': user = value; break
      case '-A': case '--user-agent': result.headers['User-Agent'] = value; break
      case '-b': case '--cookie': result.headers['Cookie'] = value; break
      case '-e': case '--referer': result.headers['Referer'] = value; break
      case '--url': result.url = value; break
      case '-F': case '--form':
        result.warnings.push('Multipart form data (-F) is not converted.'); break
      default: break
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.startsWith('--')) {
      const eq = token.indexOf('=')
      const name = eq === -1 ? token : token.slice(0, eq)
      if (LONG_WITH_ARG.has(name)) {
        const value = eq === -1 ? tokens[++i] : token.slice(eq + 1)
        if (value === undefined) throw new Error(`${name} needs a value.`)
        apply(name, value)
      } else if (name === '--insecure') {
        result.warnings.push('--insecure turns off certificate checks and is not carried over.')
      } else if (!LONG_IGNORED.has(name)) {
        result.warnings.push(`Ignored unsupported option ${name}.`)
      }
    } else if (token.startsWith('-') && token.length > 1) {
      for (let c = 1; c < token.length; c++) {
        const letter = token[c]
        if (SHORT_WITH_ARG.has(letter)) {
          const rest = token.slice(c + 1)
          const value = rest || tokens[++i]
          if (value === undefined) throw new Error(`-${letter} needs a value.`)
          apply(`-${letter}`, value)
          break
        }
        if (letter === 'k') result.warnings.push('-k turns off certificate checks and is not carried over.')
        if (letter === 'G') result.warnings.push('-G (send data as query string) is not converted.')
      }
    } else if (!result.url) {
      result.url = token
    } else {
      result.warnings.push(`Ignored extra argument "${token}".`)
    }
  }

  if (!result.url) throw new Error('No URL found in the command.')
  if (bodyParts.length) result.body = bodyParts.join('&')
  if (!result.method) result.method = result.body !== undefined ? 'POST' : 'GET'

  if (user) {
    const bytes = new TextEncoder().encode(user)
    let binary = ''
    bytes.forEach(b => { binary += String.fromCharCode(b) })
    result.headers['Authorization'] ??= `Basic ${btoa(binary)}`
  }
  return result
}

export function toPython(parsed: ParsedCurl): string {
  const lines = ['import requests', '', 'response = requests.request(', `    ${JSON.stringify(parsed.method)},`, `    ${JSON.stringify(parsed.url)},`]
  if (Object.keys(parsed.headers).length) {
    const headers = JSON.stringify(parsed.headers, null, 4).split('\n').join('\n    ')
    lines.push(`    headers=${headers},`)
  }
  if (parsed.body !== undefined) lines.push(`    data=${JSON.stringify(parsed.body)},`)
  lines.push(')', '', 'print(response.status_code)', 'print(response.text)')
  return lines.join('\n')
}

export function toFetch(parsed: ParsedCurl): string {
  const options: string[] = [`  method: ${JSON.stringify(parsed.method)},`]
  if (Object.keys(parsed.headers).length) {
    const headers = JSON.stringify(parsed.headers, null, 2).split('\n').join('\n  ')
    options.push(`  headers: ${headers},`)
  }
  if (parsed.body !== undefined) options.push(`  body: ${JSON.stringify(parsed.body)},`)
  return [
    `const response = await fetch(${JSON.stringify(parsed.url)}, {`,
    ...options,
    '});',
    '',
    'console.log(response.status);',
    'console.log(await response.text());',
  ].join('\n')
}
