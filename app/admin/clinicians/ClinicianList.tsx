import { Pencil, Trash2, UserRound } from 'lucide-react'
import type { Clinician } from '@/lib/clinicians/domain'

type Props = {
  readonly loading: boolean
  readonly clinicians: readonly Clinician[]
  readonly onEdit: (clinician: Clinician) => void
  readonly onDelete: (clinician: Clinician) => void
}

export default function ClinicianList({
  loading,
  clinicians,
  onEdit,
  onDelete,
}: Props) {
  if (loading) {
    return (
      <div
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        aria-label="의료진 불러오는 중"
      >
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-72 animate-pulse rounded-xl bg-gray-200"
          />
        ))}
      </div>
    )
  }

  if (clinicians.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <UserRound
          size={36}
          className="mx-auto mb-4 text-gray-300"
          aria-hidden="true"
        />
        <p className="font-semibold text-gray-700">
          등록된 의료진이 없습니다.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          의료진 등록 버튼으로 첫 의료진을 추가해 주세요.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {clinicians.map((clinician) => (
        <article
          key={clinician.id}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="aspect-[3/2] overflow-hidden bg-gray-100">
            <img
              src={clinician.image}
              alt={`${clinician.name} ${clinician.role}`}
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-gray-900">
                  {clinician.name} {clinician.role}
                </h2>
                <p className="mt-1 truncate text-sm font-medium text-[#0080C8]">
                  {clinician.specialtyDetail}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  clinician.isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {clinician.isActive ? '공개' : '비공개'}
              </span>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              노출 순서 {clinician.sortOrder}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(clinician)}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0080C8]"
              >
                <Pencil size={16} aria-hidden="true" />
                수정
              </button>
              <button
                type="button"
                onClick={() => onDelete(clinician)}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
              >
                <Trash2 size={16} aria-hidden="true" />
                삭제
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
