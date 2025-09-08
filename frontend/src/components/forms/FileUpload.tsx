import React, { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import clsx from 'clsx'

export interface FileUploadProps {
  accept?: string
  disabled?: boolean
  multiple?: boolean
  onFiles?: (files: FileList) => void
  maxSizeMB?: number
  error?: string
  helpText?: string
  label?: string
  className?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  disabled,
  multiple,
  onFiles,
  maxSizeMB = 10,
  error,
  helpText,
  label,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [fileNames, setFileNames] = useState<string[]>([])

  function open() {
    if (!disabled) inputRef.current?.click()
  }
  function handleFiles(files: FileList) {
    if (!files.length) return
    const valid: File[] = []
    for (const f of Array.from(files)) {
      if (f.size / 1024 / 1024 <= maxSizeMB) valid.push(f)
    }
    setFileNames(valid.map(f => f.name))
    if (valid.length) onFiles?.(files)
  }
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) handleFiles(e.target.files)
  }
  function onDrag(e: DragEvent) {
    e.preventDefault(); e.stopPropagation()
    if (disabled) return
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }
  function onDrop(e: DragEvent) {
    e.preventDefault(); e.stopPropagation()
    if (disabled) return
    setDragActive(false)
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
  }

  return (
    <div className={clsx('w-full', className)}>
      {label && <p className={clsx('text-sm font-medium mb-1', error ? 'text-danger-600' : 'text-neutral-700')}>{label}</p>}
      <div
        onClick={open}
        onDragEnter={onDrag}
        onDragOver={onDrag}
        onDragLeave={onDrag}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && open()}
        aria-disabled={disabled || undefined}
        className={clsx(
          'relative flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center cursor-pointer transition',
          'bg-white border-neutral-300 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500',
          dragActive && 'border-primary-500 bg-primary-50',
          disabled && 'opacity-60 cursor-not-allowed',
          error && 'border-danger-500 focus:ring-danger-500'
        )}
      >
        <svg className="h-8 w-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <div className="text-sm">
          <span className="font-medium text-neutral-700">Click to upload</span> <span className="text-neutral-500">or drag and drop</span>
        </div>
        <p className="text-xs text-neutral-500">{accept || 'Any file'} up to {maxSizeMB}MB</p>
        <input
          ref={inputRef}
          type="file"
            className="hidden"
          aria-hidden
          tabIndex={-1}
          accept={accept}
          multiple={multiple}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      {fileNames.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-neutral-600">
          {fileNames.map(n => <li key={n} className="truncate">{n}</li>)}
        </ul>
      )}
      {helpText && !error && <p className="mt-1 text-xs text-neutral-500">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  )
}
