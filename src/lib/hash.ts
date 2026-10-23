export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
export type HashFormat = 'hex' | 'HEX' | 'base64'

export const ALGORITHMS: { id: HashAlgorithm; bits: number; legacy: boolean }[] = [
  { id: 'MD5', bits: 128, legacy: true },
  { id: 'SHA-1', bits: 160, legacy: true },
  { id: 'SHA-256', bits: 256, legacy: false },
  { id: 'SHA-384', bits: 384, legacy: false },
  { id: 'SHA-512', bits: 512, legacy: false },
]

// Per-round left-rotation amounts and sine-derived constants from RFC 1321.
const SHIFTS = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
]
const CONSTANTS = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0)

const rotl = (x: number, n: number) => ((x << n) | (x >>> (32 - n))) >>> 0

// Web Crypto does not provide MD5, so it is implemented here (RFC 1321).
function md5(input: Uint8Array): Uint8Array {
  const length = input.length
  const padded = new Uint8Array((((length + 8) >> 6) + 1) << 6)
  padded.set(input)
  padded[length] = 0x80
  const view = new DataView(padded.buffer)
  view.setUint32(padded.length - 8, (length * 8) >>> 0, true)
  view.setUint32(padded.length - 4, Math.floor((length * 8) / 2 ** 32), true)

  let a0 = 0x67452301
  let b0 = 0xefcdab89
  let c0 = 0x98badcfe
  let d0 = 0x10325476

  for (let offset = 0; offset < padded.length; offset += 64) {
    const words = new Uint32Array(16)
    for (let j = 0; j < 16; j++) words[j] = view.getUint32(offset + j * 4, true)

    let a = a0
    let b = b0
    let c = c0
    let d = d0

    for (let i = 0; i < 64; i++) {
      let f: number
      let g: number
      if (i < 16) {
        f = (b & c) | (~b & d)
        g = i
      } else if (i < 32) {
        f = (d & b) | (~d & c)
        g = (5 * i + 1) % 16
      } else if (i < 48) {
        f = b ^ c ^ d
        g = (3 * i + 5) % 16
      } else {
        f = c ^ (b | ~d)
        g = (7 * i) % 16
      }
      f = (f + a + CONSTANTS[i] + words[g]) >>> 0
      a = d
      d = c
      c = b
      b = (b + rotl(f, SHIFTS[i])) >>> 0
    }

    a0 = (a0 + a) >>> 0
    b0 = (b0 + b) >>> 0
    c0 = (c0 + c) >>> 0
    d0 = (d0 + d) >>> 0
  }

  const out = new Uint8Array(16)
  const outView = new DataView(out.buffer)
  outView.setUint32(0, a0, true)
  outView.setUint32(4, b0, true)
  outView.setUint32(8, c0, true)
  outView.setUint32(12, d0, true)
  return out
}

export async function digestBytes(algorithm: HashAlgorithm, bytes: Uint8Array): Promise<Uint8Array> {
  if (algorithm === 'MD5') return md5(bytes)
  const result = await crypto.subtle.digest(algorithm, bytes as BufferSource)
  return new Uint8Array(result)
}

export function digest(algorithm: HashAlgorithm, text: string): Promise<Uint8Array> {
  return digestBytes(algorithm, new TextEncoder().encode(text))
}

export function formatDigest(bytes: Uint8Array, format: HashFormat): string {
  if (format === 'base64') {
    let binary = ''
    bytes.forEach(b => { binary += String.fromCharCode(b) })
    return btoa(binary)
  }
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
  return format === 'HEX' ? hex.toUpperCase() : hex
}

export const HMAC_ALGORITHMS = ALGORITHMS.filter(a => a.id !== 'MD5')

// HMAC is provided by Web Crypto for the SHA family (MD5 is not offered).
export async function hmacDigest(algorithm: Exclude<HashAlgorithm, 'MD5'>, key: string, message: string): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
  return new Uint8Array(signature)
}
