import React from 'react'
import { Button } from '../ui/Button'
import { ArrowPathIcon, CheckCircleIcon, DocumentPlusIcon, TrashIcon } from '@heroicons/react/24/outline'

export interface FormActionsProps {
  loading?: boolean
  canSubmit?: boolean
  isDirty?: boolean
  onSave?: (mode?: 'save' | 'save_new' | 'save_close' | 'submit' | 'draft') => void
  onDelete?: () => void
  onReset?: () => void
  allowDelete?: boolean
  allowSubmit?: boolean
  submitting?: boolean
  variant?: 'create' | 'edit'
}

export const FormActions: React.FC<FormActionsProps> = ({
  loading,
  canSubmit = true,
  isDirty,
  onSave,
  onDelete,
  onReset,
  allowDelete = false,
  allowSubmit = true,
  submitting,
  variant = 'create'
}) => {
  return (
    <div className="flex flex-wrap gap-2 justify-end border-t border-border/40 pt-4 mt-6">
      <Button variant="ghost" size="sm" onClick={() => onReset?.()} disabled={loading || submitting} startIcon={<ArrowPathIcon className="h-4 w-4" />}>Reset</Button>
      {allowDelete && variant === 'edit' && (
        <Button variant="danger" size="sm" onClick={() => onDelete?.()} disabled={loading || submitting} startIcon={<TrashIcon className="h-4 w-4" />}>Delete</Button>
      )}
      <Button variant="secondary" size="sm" onClick={() => onSave?.('save')} disabled={loading || submitting || !isDirty}>Save</Button>
      <Button variant="secondary" size="sm" onClick={() => onSave?.('save_new')} disabled={loading || submitting}>Save & New</Button>
      <Button variant="secondary" size="sm" onClick={() => onSave?.('save_close')} disabled={loading || submitting}>Save & Close</Button>
      {allowSubmit && (
        <Button variant="primary" size="sm" onClick={() => onSave?.('submit')} disabled={loading || submitting || !canSubmit} startIcon={<CheckCircleIcon className="h-4 w-4" />}>{variant === 'create' ? 'Create' : 'Submit'}</Button>
      )}
      {variant === 'edit' && (
        <Button variant="ghost" size="sm" onClick={() => onSave?.('draft')} disabled={loading || submitting} startIcon={<DocumentPlusIcon className="h-4 w-4" />}>Draft</Button>
      )}
    </div>
  )
}
