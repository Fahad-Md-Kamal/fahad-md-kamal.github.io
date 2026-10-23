import type { ComponentType } from 'react'
import HashTool from './HashTool'
import HmacTool from './HmacTool'
import JwtTool from './JwtTool'
import AesTool from './AesTool'
import PasswordTool from './PasswordTool'
import BcryptTool from './BcryptTool'
import ChecksumTool from './ChecksumTool'
import EncodeTool from './EncodeTool'
import ImageBase64Tool from './ImageBase64Tool'
import JsonTool from './JsonTool'
import RegexTool from './RegexTool'
import CurlTool from './CurlTool'
import TimeTool from './TimeTool'
import CronTool from './CronTool'
import RateLimiterTool from './RateLimiterTool'
import LruTool from './LruTool'
import HashRingTool from './HashRingTool'

export interface ToolMeta {
  id: string
  label: string
  icon: string
  description: string
  keywords: string
  component: ComponentType
}

export interface ToolGroup {
  id: string
  label: string
  tools: ToolMeta[]
}

export const GROUPS: ToolGroup[] = [
  {
    id: 'security',
    label: 'Security',
    tools: [
      { id: 'hash', label: 'Hash', icon: '🔢', description: 'MD5 and SHA-1/256/384/512 of any text.', keywords: 'md5 sha checksum digest', component: HashTool },
      { id: 'hmac', label: 'HMAC', icon: '✍️', description: 'Sign a message with a secret key, and verify signatures.', keywords: 'signature webhook verify sign', component: HmacTool },
      { id: 'jwt', label: 'JWT decoder', icon: '🎫', description: 'Decode a token and read its claims and expiry.', keywords: 'token json web token claims exp', component: JwtTool },
      { id: 'aes', label: 'AES encrypt', icon: '🔒', description: 'Encrypt and decrypt text with a passphrase (AES-256-GCM).', keywords: 'encryption decrypt cipher gcm pbkdf2', component: AesTool },
      { id: 'password', label: 'Password generator', icon: '🔐', description: 'Generate strong random passwords with an entropy estimate.', keywords: 'random entropy strength', component: PasswordTool },
      { id: 'bcrypt', label: 'bcrypt', icon: '🧂', description: 'See how the cost factor slows hashing, and check hashes.', keywords: 'password hashing cost salt argon2', component: BcryptTool },
      { id: 'checksum', label: 'File checksum', icon: '📄', description: 'Hash a file and compare it with a published checksum.', keywords: 'file integrity download sha256', component: ChecksumTool },
    ],
  },
  {
    id: 'data',
    label: 'Data & text',
    tools: [
      { id: 'encode', label: 'Encode / decode', icon: '🔤', description: 'Base64, Base64URL, URL and hex, in both directions.', keywords: 'base64 url hex escape', component: EncodeTool },
      { id: 'image64', label: 'Image ↔ Base64', icon: '🖼️', description: 'Turn an image into a Base64 data URI, or decode one back.', keywords: 'picture photo data uri encode embed png jpg svg', component: ImageBase64Tool },
      { id: 'json', label: 'JSON / YAML', icon: '🧾', description: 'Format, validate and convert JSON and YAML.', keywords: 'format minify validate yaml convert', component: JsonTool },
      { id: 'regex', label: 'Regex tester', icon: '🔎', description: 'Test patterns with live highlighting and capture groups.', keywords: 'regular expression match', component: RegexTool },
      { id: 'curl', label: 'cURL converter', icon: '🌐', description: 'Turn a curl command into Python or JavaScript.', keywords: 'http request python fetch requests', component: CurlTool },
    ],
  },
  {
    id: 'time',
    label: 'Time',
    tools: [
      { id: 'timestamp', label: 'Timestamps', icon: '🕒', description: 'Convert Unix time and see it across time zones.', keywords: 'unix epoch timezone date', component: TimeTool },
      { id: 'cron', label: 'Cron explainer', icon: '⏰', description: 'Explain a cron expression and list its next runs.', keywords: 'schedule crontab', component: CronTool },
    ],
  },
  {
    id: 'visual',
    label: 'Visualizers',
    tools: [
      { id: 'rate', label: 'Rate limiter', icon: '🚦', description: 'Watch token bucket and window limits allow or block traffic.', keywords: 'throttle token bucket sliding window 429', component: RateLimiterTool },
      { id: 'lru', label: 'LRU cache', icon: '🗂️', description: 'See how a least-recently-used cache evicts entries.', keywords: 'cache eviction', component: LruTool },
      { id: 'ring', label: 'Hash ring', icon: '🔄', description: 'See why consistent hashing moves fewer keys.', keywords: 'consistent hashing sharding distributed', component: HashRingTool },
    ],
  },
]

export const ALL_TOOLS: ToolMeta[] = GROUPS.flatMap(g => g.tools)
