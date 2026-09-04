import assert from 'node:assert/strict'
import test from 'node:test'
import { CLINICIAN_COLUMNS } from '../lib/clinicians/columns.ts'

test('clinician database projection preserves every public profile field', () => {
  const requiredFields = ['letter', 'highlights', 'documents'] as const

  const projectedFields = new Set(CLINICIAN_COLUMNS)

  for (const field of requiredFields) {
    assert.equal(projectedFields.has(field), true, `${field} must be projected`)
  }
})
