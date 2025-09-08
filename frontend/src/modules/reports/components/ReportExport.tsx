import React from 'react'

interface Props {
  onExport: (format: 'csv' | 'xlsx' | 'pdf') => void
  className?: string
}

export const ReportExport: React.FC<Props> = ({ onExport, className = '' }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {(['csv','xlsx','pdf'] as const).map(f => (
        <button key={f} onClick={() => onExport(f)} className="h-7 px-2 rounded-md border border-neutral-300 bg-white text-[10px] font-medium text-neutral-600 hover:bg-neutral-50">
          {f.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
