import React, { useRef, useState } from 'react'

interface DraggableItem { id: string; content: React.ReactNode }
interface Props { items: DraggableItem[]; onReorder?: (ids: string[]) => void }

export const DragDropManager: React.FC<Props> = ({ items, onReorder }) => {
  const [order, setOrder] = useState(items.map(i => i.id))
  const dragging = useRef<string | null>(null)

  const handleDragStart = (id: string) => { dragging.current = id }
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, overId: string) => {
    e.preventDefault()
    const dragId = dragging.current
    if (!dragId || dragId === overId) return
    setOrder(o => {
      const next = o.filter(x => x !== dragId)
      const idx = next.indexOf(overId)
      next.splice(idx, 0, dragId)
      return [...next]
    })
  }
  const handleDrop = () => {
    if (dragging.current) onReorder?.(order)
    dragging.current = null
  }

  return (
    <div className="space-y-2">
      {order.map(id => {
        const item = items.find(i => i.id === id)!
        return (
          <div
            key={id}
            draggable
            onDragStart={() => handleDragStart(id)}
            onDragOver={e => handleDragOver(e, id)}
            onDrop={handleDrop}
            className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-[11px] cursor-move hover:border-neutral-300 flex items-center gap-2"
          >
            <span className="text-neutral-400">☰</span>
            <div className="flex-1">{item.content}</div>
          </div>
        )
      })}
    </div>
  )
}
