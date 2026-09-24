'use client'
import { useState } from 'react'

export function Description({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  if (!text) return <p className="text-[14px] text-muted">آگهی توضیحی ندارد.</p>
  const long = text.length > 320
  return (
    <div>
      <p className={`whitespace-pre-line text-[14px] leading-8 text-ink-2 ${!open && long ? 'line-clamp-5' : ''}`}>{text}</p>
      {long ? (
        <button onClick={() => setOpen(!open)} className="mt-2 text-[13px] font-semibold text-brand hover:underline">
          {open ? 'بستن' : 'ادامه‌ی توضیحات'}
        </button>
      ) : null}
    </div>
  )
}
