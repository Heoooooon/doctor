const SESSION_VERSION = 'v1'
export const ADMIN_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60

type SessionCreationOptions = {
  readonly nowMs?: number
  readonly nonce?: string
}

class AdminSessionConfigError extends Error {
  constructor() {
    super('관리자 세션 서명 비밀값이 설정되지 않았습니다.')
    this.name = 'AdminSessionConfigError'
  }
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

function hexToBuffer(value: string): ArrayBuffer | null {
  if (!/^[0-9a-f]{64}$/.test(value)) return null
  const buffer = new ArrayBuffer(value.length / 2)
  const bytes = new Uint8Array(buffer)
  for (let index = 0; index < bytes.length; index += 1) {
    const pair = value.slice(index * 2, index * 2 + 2)
    bytes[index] = Number.parseInt(pair, 16)
  }
  return buffer
}

async function signingKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

function payload(issuedAt: number, expiresAt: number, nonce: string): string {
  return `${SESSION_VERSION}.${issuedAt}.${expiresAt}.${nonce}`
}

export async function createAdminSessionToken(
  secret: string,
  options: SessionCreationOptions = {},
): Promise<string> {
  if (secret.length === 0) throw new AdminSessionConfigError()
  const issuedAt = options.nowMs ?? Date.now()
  const expiresAt = issuedAt + ADMIN_SESSION_MAX_AGE_SECONDS * 1_000
  const nonce = options.nonce ?? crypto.randomUUID()
  const unsigned = payload(issuedAt, expiresAt, nonce)
  const signature = await crypto.subtle.sign(
    'HMAC',
    await signingKey(secret),
    new TextEncoder().encode(unsigned),
  )
  return `${unsigned}.${bytesToHex(new Uint8Array(signature))}`
}

export async function verifyAdminSessionToken(
  token: string | undefined,
  secret: string | undefined,
  nowMs = Date.now(),
): Promise<boolean> {
  if (!token || !secret) return false
  const [version, issuedValue, expiresValue, nonce, signatureValue, ...rest] =
    token.split('.')
  if (
    rest.length > 0 ||
    version !== SESSION_VERSION ||
    !issuedValue ||
    !expiresValue ||
    !nonce ||
    !signatureValue
  ) {
    return false
  }

  const issuedAt = Number(issuedValue)
  const expiresAt = Number(expiresValue)
  if (
    !Number.isSafeInteger(issuedAt) ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt - issuedAt !== ADMIN_SESSION_MAX_AGE_SECONDS * 1_000 ||
    nowMs < issuedAt ||
    nowMs >= expiresAt
  ) {
    return false
  }

  const signature = hexToBuffer(signatureValue)
  if (!signature) return false
  return crypto.subtle.verify(
    'HMAC',
    await signingKey(secret),
    signature,
    new TextEncoder().encode(payload(issuedAt, expiresAt, nonce)),
  )
}
