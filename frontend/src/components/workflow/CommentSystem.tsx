import React, { useState } from 'react'

export interface Comment { id: string; author: string; body: string; createdAt: string }
interface Props { comments: Comment[]; onAdd?: (body: string) => void }

export const CommentSystem: React.FC<Props> = ({ comments, onAdd }) => {
  const [draft, setDraft] = useState('')
  const submit = () => {
    if (!draft.trim()) return
    onAdd?.(draft.trim())
    setDraft('')
  }
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-neutral-700">Comments</h4>
      <div className="space-y-2">
        {comments.map(c => (
          <div key={c.id} className="rounded-md border border-neutral-200 bg-white p-3 text-[11px] space-y-1">
            <p className="font-medium text-neutral-700">{c.author} <span className="text-neutral-400 font-normal">• {new Date(c.createdAt).toLocaleString()}</span></p>
            <p className="text-neutral-600 whitespace-pre-line leading-relaxed">{c.body}</p>
          </div>
        ))}
        {comments.length === 0 && <p className="text-[11px] text-neutral-500">No comments yet.</p>}
      </div>
      <div className="space-y-2">
        <textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder="Add a comment" className="w-full h-20 rounded-md border border-neutral-300 px-3 py-2 text-[11px]" />
        <div className="flex justify-end">
          <button onClick={submit} className="h-8 px-3 rounded-md bg-primary-600 text-white text-[11px] font-medium disabled:opacity-50" disabled={!draft.trim()}>Post Comment</button>
        </div>
      </div>
    </div>
  )
}
