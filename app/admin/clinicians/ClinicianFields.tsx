import type { ClinicianFormValue } from './form-state'

type Props = {
  readonly value: ClinicianFormValue
  readonly onChange: (value: ClinicianFormValue) => void
}

const inputClass =
  'h-11 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-[#0080C8]'
const textareaClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-[#0080C8]'

export function ClinicianIdentityFields({ value, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-2 text-sm font-medium text-gray-700">
        이름 *
        <input
          required
          value={value.name}
          onChange={(event) =>
            onChange({ ...value, name: event.target.value })
          }
          className={inputClass}
        />
      </label>
      <label className="space-y-2 text-sm font-medium text-gray-700">
        직책 *
        <input
          required
          value={value.role}
          onChange={(event) =>
            onChange({ ...value, role: event.target.value })
          }
          className={inputClass}
          placeholder="대표원장 또는 원장"
        />
      </label>
      <label className="space-y-2 text-sm font-medium text-gray-700">
        학위 표기
        <input
          value={value.title}
          onChange={(event) =>
            onChange({ ...value, title: event.target.value })
          }
          className={inputClass}
          placeholder="DDS, MSD"
        />
      </label>
      <label className="space-y-2 text-sm font-medium text-gray-700">
        진료 분야 *
        <input
          required
          value={value.specialty}
          onChange={(event) =>
            onChange({ ...value, specialty: event.target.value })
          }
          className={inputClass}
          placeholder="임플란트 · 심미보철"
        />
      </label>
      <label className="space-y-2 text-sm font-medium text-gray-700">
        자격·역할
        <input
          value={value.subRole}
          onChange={(event) =>
            onChange({ ...value, subRole: event.target.value })
          }
          className={inputClass}
          placeholder="교정과 전문의"
        />
      </label>
      <label className="space-y-2 text-sm font-medium text-gray-700">
        카드 진료 분야
        <input
          value={value.specialtyDetail}
          onChange={(event) =>
            onChange({ ...value, specialtyDetail: event.target.value })
          }
          className={inputClass}
          placeholder="투명교정 · 성장기교정"
        />
      </label>
    </div>
  )
}

export function ClinicianDetailFields({ value, onChange }: Props) {
  return (
    <>
      <label className="block space-y-2 text-sm font-medium text-gray-700">
        주요 경력
        <textarea
          value={value.careers}
          onChange={(event) =>
            onChange({ ...value, careers: event.target.value })
          }
          rows={5}
          className={textareaClass}
          placeholder="한 줄에 하나씩 입력"
        />
      </label>
      <label className="block space-y-2 text-sm font-medium text-gray-700">
        학회·활동
        <textarea
          value={value.memberships}
          onChange={(event) =>
            onChange({ ...value, memberships: event.target.value })
          }
          rows={4}
          className={textareaClass}
          placeholder="한 줄에 하나씩 입력"
        />
      </label>
      <label className="block space-y-2 text-sm font-medium text-gray-700">
        의료진 한마디
        <textarea
          value={value.letter}
          onChange={(event) =>
            onChange({ ...value, letter: event.target.value })
          }
          rows={4}
          className={textareaClass}
        />
      </label>

      <details className="rounded-lg border border-gray-200 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-gray-800">
          사진 맞춤·노출 순서
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-gray-700">
            카드 확대 배율
            <input
              type="number"
              min="0.5"
              max="3"
              step="0.01"
              value={value.teamCardZoom}
              onChange={(event) =>
                onChange({ ...value, teamCardZoom: event.target.value })
              }
              className={inputClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700">
            카드 세로 이동(%)
            <input
              type="number"
              min="-50"
              max="50"
              step="0.5"
              value={value.teamCardShiftYPercent}
              onChange={(event) =>
                onChange({
                  ...value,
                  teamCardShiftYPercent: event.target.value,
                })
              }
              className={inputClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700">
            상세 사진 맞춤
            <select
              value={value.profileImageFit}
              onChange={(event) => {
                const fit = event.target.value
                if (
                  fit === '' ||
                  fit === 'cover' ||
                  fit === 'contain-natural-ratio'
                ) {
                  onChange({ ...value, profileImageFit: fit })
                }
              }}
              className={inputClass}
            >
              <option value="">기본(영역에 맞춰 자르기)</option>
              <option value="cover">영역에 맞춰 자르기</option>
              <option value="contain-natural-ratio">원본 비율 유지</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700">
            노출 순서
            <input
              type="number"
              required
              value={value.sortOrder}
              onChange={(event) =>
                onChange({ ...value, sortOrder: event.target.value })
              }
              className={inputClass}
            />
          </label>
        </div>
      </details>

      <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          checked={value.isActive}
          onChange={(event) =>
            onChange({ ...value, isActive: event.target.checked })
          }
          className="size-5 accent-[#0080C8]"
        />
        소개 페이지에 공개
      </label>
    </>
  )
}
