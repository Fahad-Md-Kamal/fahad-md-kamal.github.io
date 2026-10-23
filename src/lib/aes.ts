// Passphrase-based encryption with AES-256-GCM, using only the browser's Web Crypto API.
//
// Packed format (then base64-encoded):
//   byte 0        format version (1)
//   bytes 1-16    random salt for PBKDF2
//   bytes 17-28   random 12-byte IV for AES-GCM
//   bytes 29-end  ciphertext followed by the 16-byte GCM authentication tag

const VERSION = 1
const SALT_BYTES = 16
const IV_BYTES = 12
const TAG_BYTES = 16
const PBKDF2_ITERATIONS = 600_000
const HEADER_BYTES = 1 + SALT_BYTES + IV_BYTES

export const AES_INFO = { iterations: PBKDF2_ITERATIONS }

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach(b => { binary += String.fromCharCode(b) })
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value.replace(/\s+/g, ''))
  return Uint8Array.from(binary, c => c.charCodeAt(0))
}

async function deriveKey(passphrase: string, salt: Uint8Array, usage: KeyUsage[]): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    usage,
  )
}

export async function encryptText(plaintext: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await deriveKey(passphrase, salt, ['encrypt'])
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, new TextEncoder().encode(plaintext)),
  )
  const packed = new Uint8Array(HEADER_BYTES + ciphertext.length)
  packed[0] = VERSION
  packed.set(salt, 1)
  packed.set(iv, 1 + SALT_BYTES)
  packed.set(ciphertext, HEADER_BYTES)
  return toBase64(packed)
}

export async function decryptText(encoded: string, passphrase: string): Promise<string> {
  let packed: Uint8Array
  try {
    packed = fromBase64(encoded)
  } catch {
    throw new Error('That is not valid base64 text.')
  }
  if (packed.length < HEADER_BYTES + TAG_BYTES || packed[0] !== VERSION) {
    throw new Error('This does not look like text produced by this tool.')
  }
  const salt = packed.slice(1, 1 + SALT_BYTES)
  const iv = packed.slice(1 + SALT_BYTES, HEADER_BYTES)
  const ciphertext = packed.slice(HEADER_BYTES)
  const key = await deriveKey(passphrase, salt, ['decrypt'])
  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, ciphertext as BufferSource)
    return new TextDecoder('utf-8', { fatal: true }).decode(plain)
  } catch {
    // GCM fails authentication for a wrong passphrase and for tampered data alike.
    throw new Error('Could not decrypt: the passphrase is wrong, or the data was changed.')
  }
}
