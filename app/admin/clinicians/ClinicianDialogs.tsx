import { X } from 'lucide-react'
import type { Clinician } from '@/lib/clinicians/domain'
import ClinicianForm from './ClinicianForm'
import ModalShell from './ModalShell'
import type { ClinicianFormValue } from './form-state'

type Props = {
  readonly form: ClinicianFormValue | null
  readonly editingId: string | null
  readonly saving: boolean
  readonly deleteTarget: Clinician | null
  readonly onFormChange: (value: ClinicianFormValue) => void
  readonly onSave: () => void
  readonly onCloseForm: () => void
  readonly onDelete: () => void
  readonly onCloseDelete: () => void
}

export default function ClinicianDialogs({
  form,
  editingId,
  saving,
  deleteTarget,
  onFormChange,
  onSave,
  onCloseForm,
  onDelete,
  onCloseDelete,
}: Props) {
  return (
    <>
      {form ? (
        <ModalShell
          role="dialog"
          labelId="clinician-form-title"
          onClose={onCloseForm}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/55 p-4"
        >
          <div className="mx-auto my-4 w-full max-w-2xl rounded-xl bg-white shadow-xl sm:my-8">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2
                id="clinician-form-title"
                className="text-lg font-bold text-gray-900"
              >
                {editingId ? '의료진 수정' : '의료진 등록'}
              </h2>
              <button
                type="button"
                data-autofocus
                onClick={onCloseForm}
                className="flex size-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0080C8]"
                aria-label="창 닫기"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="p-6">
              <ClinicianForm
                value={form}
                saving={saving}
                submitLabel={editingId ? '수정 저장' : '등록'}
                onChange={onFormChange}
                onCancel={onCloseForm}
                onSubmit={onSave}
              />
            </div>
          </div>
        </ModalShell>
      ) : null}

      {deleteTarget ? (
        <ModalShell
          role="alertdialog"
          labelId="delete-clinician-title"
          onClose={onCloseDelete}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2
              id="delete-clinician-title"
              className="text-lg font-bold text-gray-900"
            >
              의료진을 삭제할까요?
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {deleteTarget.name} 의료진 정보가 소개 페이지에서 삭제되며 복구할
              수 없습니다.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                data-autofocus
                onClick={onCloseDelete}
                className="min-h-11 rounded-lg px-4 text-sm font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0080C8]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="min-h-11 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        </ModalShell>
      ) : null}
    </>
  )
}
