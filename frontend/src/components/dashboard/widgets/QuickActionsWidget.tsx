import React from 'react'
import { Button } from '../../ui/Button'
import { PlusIcon, DocumentTextIcon, ArrowPathIcon, UserPlusIcon } from '@heroicons/react/24/outline'

interface Props { metrics?: any; loading?: boolean; error?: string; fetching?: boolean }

export const QuickActionsWidget: React.FC<Props> = () => {
  return (
    <div className="h-full flex flex-col rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-medium text-neutral-700 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <Button variant="secondary" size="sm" startIcon={<PlusIcon className="h-4 w-4" />}>New Item</Button>
        <Button variant="secondary" size="sm" startIcon={<DocumentTextIcon className="h-4 w-4" />}>New Invoice</Button>
        <Button variant="secondary" size="sm" startIcon={<UserPlusIcon className="h-4 w-4" />}>New Customer</Button>
        <Button variant="secondary" size="sm" startIcon={<ArrowPathIcon className="h-4 w-4" />}>Sync Data</Button>
      </div>
    </div>
  )
}
