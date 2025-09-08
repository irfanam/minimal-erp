import React, { useRef } from 'react'

interface Props {
  images: string[]
  onChange: (images: string[]) => void
}

export const ImageGallery: React.FC<Props> = ({ images, onChange }) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const readers = Array.from(files).map(file => new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    }))
    Promise.all(readers).then(list => onChange([...images, ...list]))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        {images.map((src, i) => (
          <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden group border border-neutral-200 bg-neutral-100">
            <img src={src} className="object-cover w-full h-full" />
            <button className="absolute top-1 right-1 bg-white/80 text-[10px] px-1 rounded opacity-0 group-hover:opacity-100" onClick={() => onChange(images.filter((_, idx) => idx !== i))}>✕</button>
          </div>
        ))}
        <button onClick={() => inputRef.current?.click()} className="w-24 h-24 rounded-md border border-dashed border-neutral-300 flex items-center justify-center text-[10px] text-neutral-500 bg-neutral-50 hover:bg-neutral-100">
          Add Image
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
    </div>
  )
}
