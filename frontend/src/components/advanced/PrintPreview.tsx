import React, { useRef } from 'react'

interface PrintPreviewProps {
  title?: string
  onClose?: () => void
  children: React.ReactNode
  /** Optional custom stylesheet appended into the print window */
  extraCSS?: string
}

/**
 * PrintPreview renders content in an A4 styled surface and lets user open
 * a native print dialog. Avoids external deps by injecting a new window.
 */
export const PrintPreview: React.FC<PrintPreviewProps> = ({ title = 'Print Preview', onClose, children, extraCSS }) => {
  const areaRef = useRef<HTMLDivElement>(null)

  function handlePrint() {
    if (!areaRef.current) return
    const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1000')
    if (!win) return
    const baseStyles = `
      * { box-sizing: border-box; }
      body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: #fff; }
      .a4 { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; padding: 24mm 18mm; position: relative; }
      h1,h2,h3,h4 { margin: 0 0 8px; font-weight: 600; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th,td { border: 1px solid #ddd; padding: 4px 6px; }
      th { background: #f1f5f9; text-align: left; }
      .muted { color: #64748b; }
      @media print { .page-break { page-break-after: always; } }
    ` + (extraCSS || '')
    win.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>${baseStyles}</style></head><body>${areaRef.current.innerHTML}</body></html>`)
    win.document.close()
    // Delay to allow resources to render
    setTimeout(() => { win.print(); win.focus(); }, 200)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start overflow-auto p-8">
      <div className="bg-white rounded-md shadow-xl w-full max-w-5xl mx-auto flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h2 className="text-sm font-semibold">{title}</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="px-3 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-500">Print</button>
            <button onClick={onClose} className="px-2 py-1 text-xs rounded border hover:bg-gray-50">Close</button>
          </div>
        </div>
        <div className="p-4 overflow-auto">
          <div ref={areaRef} className="a4 bg-white shadow print:shadow-none mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
