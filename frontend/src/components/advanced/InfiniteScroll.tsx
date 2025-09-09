import React, { useEffect, useRef, useState } from 'react'

interface Props<T> {
  loadMore: (cursor?: any) => Promise<{ items: T[]; nextCursor?: any }>
  renderItem: (item: T, index: number) => React.ReactNode
  initial?: T[]
  className?: string
}

export function InfiniteScroll<T>({ loadMore, renderItem, initial = [], className = '' }: Props<T>) {
  const [items, setItems] = useState<T[]>(initial)
  const [cursor, setCursor] = useState<any>(undefined)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const sentinel = useRef<HTMLDivElement | null>(null)

  const fetchMore = async () => {
    if (loading || done) return
    setLoading(true)
    try {
      const res = await loadMore(cursor)
      setItems(i => [...i, ...res.items])
      setCursor(res.nextCursor)
      if (!res.nextCursor || res.items.length === 0) setDone(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const el = sentinel.current
    if (!el || done) return
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !loading) fetchMore()
      })
    }, { rootMargin: '200px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [cursor, loading, done])

  return (
    <div className={`relative ${className}`}>
      <div className="space-y-2">
        {items.map((it, i) => renderItem(it, i))}
      </div>
      {!done && <div ref={sentinel} className="h-10" />}
      {loading && <p className="text-[11px] text-neutral-500 py-2">Loading...</p>}
      {done && <p className="text-[11px] text-neutral-400 py-2 text-center">End of results</p>}
    </div>
  )
}
