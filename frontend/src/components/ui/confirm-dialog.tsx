import { Modal } from './modal'
import { Button, type ButtonVariant } from './button'
import type { ReactNode } from 'react'

export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message?: string
  description?: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'primary'
  confirmVariant?: ButtonVariant
  isLoading?: boolean
  isConfirmDisabled?: boolean
  onConfirm: () => void
  onClose: () => void
}

const variantConfig = {
  danger: {
    buttonVariant: 'danger' as const,
  },
  warning: {
    buttonVariant: 'primary' as const,
  },
  primary: {
    buttonVariant: 'primary' as const,
  },
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  confirmVariant,
  isLoading = false,
  isConfirmDisabled = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const config = variantConfig[variant] || variantConfig.danger
  const buttonVariant = confirmVariant || config.buttonVariant

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={buttonVariant} onClick={onConfirm} isLoading={isLoading} disabled={isConfirmDisabled}>
            {confirmText}
          </Button>
        </div>
      }
    >
      {description ?? (message && <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>)}
    </Modal>
  )
}
