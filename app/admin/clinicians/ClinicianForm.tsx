'use client'

import { useState, type FormEvent } from 'react'
import { ImagePlus, X } from 'lucide-react'
import type { ClinicianFormValue } from './form-state'
import {
  ClinicianDetailFields,
  ClinicianIdentityFields,
} from './ClinicianFields'

type Props = {
  readonly value: ClinicianFormValue
  readonly saving: boolean
  readonly submitLabel: string
  readonly onChange: (value: ClinicianFormValue) => void
  readonly onCancel: () => void
  readonly onSubmit: () => void
}

export default function ClinicianForm({
  value,
  saving,
  submitLabel,
  onChange,
  onCancel,
  onSubmit,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploadImage = async (file: File) => {
    setUploading(true)
    setUploadError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'clinic')
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const body: unknown = await response.json()
      if (
        response.ok &&
        typeof body === 'object' &&
        body !== null &&
        'url' in body &&
        typeof body.url === 'string'
      ) {
        onChange({ ...value, image: body.url })
        return
      }
      const message =
        typeof body === 'object' &&
        body !== null &&
        'error' in body &&
        typeof body.error === 'string'
          ? body.error
          : '이미지를 업로드하지 못했습니다.'
      setUploadError(message)
    } catch (error) {
      if (!(error instanceof Error)) throw error
      setUploadError('이미지를 업로드하지 못했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
        학력, 경력, 전문의 표기는 증빙이 확인된 사실만 입력해 주세요.
      </p>

      <ClinicianIdentityFields value={value} onChange={onChange} />

      <div>
        <span className="mb-2 block text-sm font-medium text-gray-700">
          프로필 사진 *
        </span>
        {value.image ? (
          <div className="relative h-56 w-44 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <img
              src={value.image}
              alt="업로드한 의료진 프로필 미리보기"
              className="h-full w-full object-cover object-top"
            />
            <button
              type="button"
              onClick={() => onChange({ ...value, image: '' })}
              className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-full bg-black/70 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0080C8]"
              aria-label="프로필 사진 제거"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:border-[#0080C8] hover:text-[#0080C8] focus-within:ring-2 focus-within:ring-[#0080C8]">
            <ImagePlus size={24} className="mb-2" aria-hidden="true" />
            {uploading ? '업로드 중...' : '프로필 사진 선택'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={!value.image}
              disabled={uploading}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void uploadImage(file)
                event.target.value = ''
              }}
            />
          </label>
        )}
        {uploadError ? (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {uploadError}
          </p>
        ) : null}
      </div>

      <ClinicianDetailFields value={value} onChange={onChange} />

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-lg px-5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0080C8]"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={saving || uploading}
          className="min-h-11 rounded-lg bg-[#0080C8] px-6 text-sm font-semibold text-white hover:bg-[#006BA8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0080C8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? '저장 중...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
