'use client'
import * as Dialog from '@radix-ui/react-dialog'
import { ChevronLeft, ChevronRight, Grid2x2, ImageOff, Maximize2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { SmartImg } from '@/shared/components/ui/smart-img'
import { faNum } from '@/shared/lib/format'

/** The whole photo, uncropped, over a blurred copy of itself so the empty sides don't look like a layout gap. */
function FullPhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="relative block h-full w-full overflow-hidden bg-surface-3">
      <SmartImg src={src} aria-hidden wrapperClassName="absolute inset-0" className="scale-125 blur-2xl brightness-90 saturate-150" />
      <span className="absolute inset-0 bg-black/10" aria-hidden />
      <SmartImg src={src} alt={alt} loading="eager" wrapperClassName="absolute inset-0 bg-transparent" className="object-contain drop-shadow-[0_8px_24px_rgb(0_0_0/0.25)] transition-transform duration-500 group-hover:scale-[1.015]" />
    </span>
  )
}

export function Gallery({ images, title, stock }: { images: string[]; title: string; stock?: boolean }) {
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(0)
  const [cur, setCur] = useState(0)
  const strip = useRef<HTMLDivElement>(null)
  const show = (i: number) => { setIdx(i); setOpen(true) }
  const go = useCallback((d: number) => setIdx((i) => (i + d + images.length) % images.length), [images.length])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') go(1); if (e.key === 'ArrowRight') go(-1) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, go])

  if (!images.length)
    return (
      <div className="grid aspect-[16/9] place-items-center rounded-sheet bg-surface-3 text-muted">
        <ImageOff className="size-10" />
      </div>
    )

  const single = images.length === 1
  // the mosaic only has slots for 1, 2, 3 (hero + 2) or 5 (hero + 4) photos; the rest live in the lightbox
  const tiles = images.length >= 5 ? 5 : images.length >= 3 ? 3 : images.length

  return (
    <>
      {/* mobile: swipe strip */}
      <div className="relative -mx-4 md:hidden">
        {single ? (
          <button onClick={() => show(0)} className="block aspect-[4/3] w-full" aria-label="بزرگ‌نمایی عکس">
            <FullPhoto src={images[0]} alt={title} />
          </button>
        ) : (
          <>
            <div ref={strip} onScroll={(e) => setCur(Math.round(Math.abs(e.currentTarget.scrollLeft) / e.currentTarget.clientWidth))} className="no-scrollbar flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto">
              {images.map((src, i) => (
                <button key={src} onClick={() => show(i)} className="h-full w-full shrink-0 snap-center" aria-label={`عکس ${faNum(i + 1)}`}>
                  <SmartImg src={src} alt={i === 0 ? title : ''} loading={i < 2 ? 'eager' : 'lazy'} />
                </button>
              ))}
            </div>
            <span className="absolute bottom-3 end-3 rounded-full bg-black/60 px-2.5 py-1 text-[12px] font-medium text-white backdrop-blur-md">
              {faNum(cur + 1)} / {faNum(images.length)}
            </span>
          </>
        )}
      </div>

      {/* desktop: mosaic */}
      <div className={cn('relative hidden gap-2 overflow-hidden rounded-sheet md:grid', tiles === 5 ? 'h-[440px] grid-cols-4 grid-rows-2' : tiles === 3 ? 'h-[420px] grid-cols-3 grid-rows-2' : tiles === 2 ? 'h-[420px] grid-cols-2' : 'h-[460px] grid-cols-1')}>
        {single ? (
          <button onClick={() => show(0)} className="group relative overflow-hidden" aria-label="بزرگ‌نمایی عکس">
            <FullPhoto src={images[0]} alt={title} />
          </button>
        ) : (
          images.slice(0, tiles).map((src, i) => (
            <button key={src} onClick={() => show(i)} className={cn('group relative overflow-hidden bg-surface-3', i === 0 && tiles >= 3 && 'col-span-2 row-span-2')}>
              <SmartImg src={src} alt={i === 0 ? title : ''} className="transition-[opacity,transform,filter] duration-500 group-hover:scale-[1.03] group-hover:brightness-95" />
            </button>
          ))
        )}
        <button onClick={() => show(0)} className="absolute bottom-4 end-4 inline-flex h-9 items-center gap-1.5 rounded-full bg-surface px-3.5 text-[13px] font-semibold text-ink shadow-e2">
          {single ? <Maximize2 className="size-4" /> : <Grid2x2 className="size-4" />}
          {single ? 'تمام‌صفحه' : `همه‌ی ${faNum(images.length)} عکس`}
        </button>
        {stock ? <span className="absolute start-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-md">به گفته‌ی آگهی‌دهنده، عکس‌ها مال همین ملک نیست</span> : null}
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/92" />
          <Dialog.Content className="fixed inset-0 z-[81] flex flex-col outline-none" dir="rtl">
            <Dialog.Title className="sr-only">{title}</Dialog.Title>
            <Dialog.Description className="sr-only">گالری عکس</Dialog.Description>
            <div className="flex items-center justify-between p-4 text-white">
              <span className="tabular text-sm">{faNum(idx + 1)} / {faNum(images.length)}</span>
              <Dialog.Close className="grid size-10 place-items-center rounded-full hover:bg-white/10" aria-label="بستن"><X className="size-6" /></Dialog.Close>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-6 md:px-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={images[idx]} src={images[idx]} alt="" referrerPolicy="no-referrer" className="max-h-full max-w-full animate-[fade-in_200ms_ease-out] rounded-lg object-contain" />
              {single ? null : (
                <>
                  <button onClick={() => go(-1)} className="absolute start-2 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 md:start-4" aria-label="قبلی"><ChevronRight className="size-6" /></button>
                  <button onClick={() => go(1)} className="absolute end-2 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 md:end-4" aria-label="بعدی"><ChevronLeft className="size-6" /></button>
                </>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
