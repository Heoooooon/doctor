import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { checkAdminPassword } from '../lib/admin-password.ts'
import {
  createAdminSessionToken,
  verifyAdminSessionToken,
} from '../lib/admin-session.ts'

const SECRET = 'local-test-password-with-enough-entropy'
const NOW = 1_788_451_200_000
const NONCE = '3fe3a8d2-6d52-4f9d-9dc0-11a767ca3107'

test('signed admin session accepts an untampered token before expiry', async () => {
  const token = await createAdminSessionToken(SECRET, {
    nowMs: NOW,
    nonce: NONCE,
  })

  const valid = await verifyAdminSessionToken(token, SECRET, NOW + 60_000)

  assert.equal(valid, true)
  assert.equal(token.includes(SECRET), false)
})

test('signed admin session rejects a tampered token', async () => {
  const token = await createAdminSessionToken(SECRET, {
    nowMs: NOW,
    nonce: NONCE,
  })
  const replacement = token.endsWith('a') ? 'b' : 'a'
  const tampered = `${token.slice(0, -1)}${replacement}`

  const valid = await verifyAdminSessionToken(
    tampered,
    SECRET,
    NOW + 60_000,
  )

  assert.equal(valid, false)
})

test('signed admin session rejects an expired token', async () => {
  const token = await createAdminSessionToken(SECRET, {
    nowMs: NOW,
    nonce: NONCE,
  })

  const valid = await verifyAdminSessionToken(
    token,
    SECRET,
    NOW + 8 * 60 * 60 * 1_000 + 1,
  )

  assert.equal(valid, false)
})

test('administrator password fails closed when no password is configured', () => {
  assert.deepEqual(checkAdminPassword('egun2024', undefined), {
    kind: 'unconfigured',
  })
  assert.deepEqual(checkAdminPassword('egun2024', 'different-password'), {
    kind: 'invalid',
  })
})

test('admin guards reject the legacy static token and development bypass', async () => {
  const sources = await Promise.all([
    readFile(new URL('../lib/admin-auth.ts', import.meta.url), 'utf8'),
    readFile(new URL('../proxy.ts', import.meta.url), 'utf8'),
  ])

  for (const source of sources) {
    assert.match(source, /verifyAdminSessionToken/)
    assert.doesNotMatch(source, /egun-admin-authenticated/)
    assert.doesNotMatch(source, /NODE_ENV\s*!==\s*['"]production['"]/)
  }
})
