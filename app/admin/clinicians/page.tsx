'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  parseClinicianRows,
  type Clinician,
} from '@/lib/clinicians/domain'
import ClinicianDialogs from './ClinicianDialogs'
import ClinicianList from './ClinicianList'
import {
  clinicianToForm,
  emptyClinicianForm,
  formToPayload,
  type ClinicianFormValue,
} from './form-state'

function errorMessage(value: unknown, fallback: string): string {
  if (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof value.error === 'string'
  ) {
    return value.error
  }
  return fallback
}

export default function CliniciansAdminPage() {
  const [clinicians, setClinicians] = useState<readonly Clinician[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ClinicianFormValue | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Clinician | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadClinicians = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/clinicians')
      const body: unknown = await response.json()
      if (!response.ok) {
        setError(errorMessage(body, '의료진 목록을 불러오지 못했습니다.'))
        return
      }
      const parsed = parseClinicianRows(body)
      if (!parsed.ok) {
        setError(parsed.error)
        return
      }
      setClinicians(parsed.value)
    } catch (caught) {
      if (!(caught instanceof Error)) throw caught
      setError('의료진 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadClinicians()
  }, [loadClinicians])

  const closeForm = useCallback(() => setForm(null), [])
  const closeDelete = useCallback(() => setDeleteTarget(null), [])

  const openAdd = () => {
    const nextOrder =
      clinicians.reduce(
        (maximum, clinician) => Math.max(maximum, clinician.sortOrder),
        -1,
      ) + 1
    setEditingId(null)
    setForm(emptyClinicianForm(nextOrder))
    setError(null)
  }

  const openEdit = (clinician: Clinician) => {
    setEditingId(clinician.id)
    setForm(clinicianToForm(clinician))
    setError(null)
  }

  const save = async () => {
    if (!form) return
    setSaving(true)
    setError(null)
    try {
      const response = await fetch(
        editingId ? `/api/clinicians/${editingId}` : '/api/clinicians',
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formToPayload(form)),
        },
      )
      const body: unknown = await response.json()
      if (!response.ok) {
        setError(errorMessage(body, '의료진 정보를 저장하지 못했습니다.'))
        return
      }
      const parsed = parseClinicianRows([body])
      if (!parsed.ok || !parsed.value[0]) {
        setError(
          parsed.ok ? '저장된 의료진 응답이 없습니다.' : parsed.error,
        )
        return
      }
      const saved = parsed.value[0]
      setClinicians((current) => {
        const next = editingId
          ? current.map((clinician) =>
              clinician.id === editingId ? saved : clinician,
            )
          : [...current, saved]
        return [...next].sort(
          (left, right) => left.sortOrder - right.sortOrder,
        )
      })
      setForm(null)
      setEditingId(null)
    } catch (caught) {
      if (!(caught instanceof Error)) throw caught
      setError('의료진 정보를 저장하지 못했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const deleteClinician = async () => {
    if (!deleteTarget) return
    setError(null)
    const response = await fetch(`/api/clinicians/${deleteTarget.id}`, {
      method: 'DELETE',
    })
    const body: unknown = await response.json()
    if (!response.ok) {
      setError(errorMessage(body, '의료진을 삭제하지 못했습니다.'))
      return
    }
    setClinicians((current) =>
      current.filter((clinician) => clinician.id !== deleteTarget.id),
    )
    setDeleteTarget(null)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">의료진 관리</h1>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            의료진 사진, 경력과 소개 순서를 관리합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex min-h-11 items-center gap-2 rounded-lg bg-[#0080C8] px-4 text-sm font-semibold text-white hover:bg-[#006BA8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0080C8]"
        >
          <Plus size={18} aria-hidden="true" />
          의료진 등록
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <ClinicianList
        loading={loading}
        clinicians={clinicians}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />
      <ClinicianDialogs
        form={form}
        editingId={editingId}
        saving={saving}
        deleteTarget={deleteTarget}
        onFormChange={setForm}
        onSave={save}
        onCloseForm={closeForm}
        onDelete={() => void deleteClinician()}
        onCloseDelete={closeDelete}
      />
    </div>
  )
}
