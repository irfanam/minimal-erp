import React from 'react'
import { AdjustmentsHorizontalIcon, ArrowsPointingOutIcon, ArrowPathIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Button, IconButton } from '../ui/Button'

export interface WidgetMeta {
  id: string
  title: string
  removable?: boolean
  resizable?: boolean
}

interface WidgetControlsProps {
  onAdd?: () => void
  onRefresh?: (id: string) => void
  onRemove?: (id: string) => void
  onToggleFullscreen?: (id: string) => void
  onConfigure?: (id: string) => void
  widgets: WidgetMeta[]
}

export const WidgetControls: React.FC<WidgetControlsProps> = ({ onAdd, onRefresh, onRemove, onToggleFullscreen, onConfigure, widgets }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Button variant="primary" size="sm" startIcon={<PlusIcon className="h-4 w-4" />} onClick={onAdd}>Add Widget</Button>
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        {widgets.map(w => (
          <div key={w.id} className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-neutral-200 shadow-sm">
            <span className="font-medium text-neutral-700 truncate max-w-[8rem]" title={w.title}>{w.title}</span>
            <IconButton label="Refresh" size="sm" variant="ghost" icon={<ArrowPathIcon className="h-4 w-4" />} onClick={() => onRefresh?.(w.id)} />
            <IconButton label="Fullscreen" size="sm" variant="ghost" icon={<ArrowsPointingOutIcon className="h-4 w-4" />} onClick={() => onToggleFullscreen?.(w.id)} />
            <IconButton label="Settings" size="sm" variant="ghost" icon={<AdjustmentsHorizontalIcon className="h-4 w-4" />} onClick={() => onConfigure?.(w.id)} />
            {w.removable && <IconButton label="Remove" size="sm" variant="ghost" icon={<XMarkIcon className="h-4 w-4" />} onClick={() => onRemove?.(w.id)} />}
          </div>
        ))}
      </div>
    </div>
  )
}
