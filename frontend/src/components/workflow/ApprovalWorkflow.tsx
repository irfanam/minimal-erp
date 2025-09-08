import React from 'react'

export interface ApprovalStep { id: string; role: string; status: 'Pending' | 'Approved' | 'Rejected'; actedBy?: string; actedAt?: string; remarks?: string }

interface Props { steps: ApprovalStep[]; onApprove?: (id: string) => void; onReject?: (id: string) => void }

export const ApprovalWorkflow: React.FC<Props> = ({ steps, onApprove, onReject }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-neutral-700">Approval Workflow</h4>
      <div className="space-y-2">
        {steps.map(s => (
          <div key={s.id} className="rounded-md border border-neutral-200 bg-white p-3 flex items-center justify-between text-[11px]">
            <div className="flex flex-col">
              <span className="font-medium text-neutral-800">{s.role}</span>
              <span className="text-neutral-500">{s.status}{s.actedBy ? ` by ${s.actedBy}` : ''}</span>
            </div>
            {s.status === 'Pending' && (
              <div className="flex items-center gap-2">
                <button onClick={() => onApprove?.(s.id)} className="h-7 px-2 rounded-md bg-success-600 text-white">Approve</button>
                <button onClick={() => onReject?.(s.id)} className="h-7 px-2 rounded-md bg-danger-600 text-white">Reject</button>
              </div>
            )}
          </div>
        ))}
        {steps.length === 0 && <p className="text-[11px] text-neutral-500">No workflow defined.</p>}
      </div>
    </div>
  )
}
