import React from 'react'
import { Button, IconButton } from '../ui'

export interface TableAction {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  bulk?: boolean
}

export interface TableActionsProps {
  actions?: TableAction[]
  selectedCount?: number
  totalSelected?: number
  onClearSelection?: () => void
  onCreate?: () => void
  disableCreate?: boolean
}

export const TableActions: React.FC<TableActionsProps> = ({
  actions = [],
  selectedCount = 0,
  onClearSelection,
  onCreate,
  disableCreate,
}) => {
  const bulkActions = actions.filter(a => a.bulk)
  const rowActions = actions.filter(a => !a.bulk)

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {onCreate && (
        <Button size="sm" variant="primary" onClick={onCreate} disabled={disableCreate} startIcon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" /></svg>}>
          New
        </Button>
      )}
      {rowActions.map(a => (
        <Button key={a.label} size="sm" variant={a.variant || 'secondary'} onClick={a.onClick} startIcon={a.icon}>{a.label}</Button>
      ))}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 bg-neutral-100 rounded-md px-2 py-1 text-xs">
          <span className="font-medium text-neutral-700">{selectedCount} selected</span>
          {bulkActions.map(a => (
            <Button key={a.label} size="sm" variant={a.variant || 'secondary'} onClick={a.onClick} startIcon={a.icon}>{a.label}</Button>
          ))}
          <IconButton label="Clear selection" variant="ghost" icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>} onClick={onClearSelection} />
        </div>
      )}
    </div>
  )
}
