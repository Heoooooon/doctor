'use client'

import { useEffect, useRef, type ReactNode } from 'react'

type Props = {
  readonly role: 'dialog' | 'alertdialog'
  readonly labelId: string
  readonly className: string
  readonly onClose: () => void
  readonly children: ReactNode
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export default function ModalShell({
  role,
  labelId,
  className,
  onClose,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const container = ref.current
    if (!container) return

    const focusable = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => !element.hasAttribute('aria-hidden'))
    const initial =
      container.querySelector<HTMLElement>('[data-autofocus]') ??
      focusable()[0] ??
      container
    initial.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const elements = focusable()
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (!first || !last) {
        event.preventDefault()
        container.focus()
        return
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      role={role}
      aria-modal="true"
      aria-labelledby={labelId}
      tabIndex={-1}
      className={className}
    >
      {children}
    </div>
  )
}
