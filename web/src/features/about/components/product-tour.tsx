'use client'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export interface TourStep {
  icon: ReactNode
  title: string
  text: string
  src: string
  path: string
  /** show in a phone frame instead of a browser window */
  phone?: boolean
}

const STEP_MS = 6000
const ease = [0.22, 1, 0.36, 1] as const

function BrowserFrame({ path, children }: { path: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[18px] bg-surface shadow-[0_30px_80px_-24px_rgb(20_20_25/0.35)] ring-1 ring-line">
      <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-4 py-2.5" dir="ltr">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto max-w-[60%] truncate rounded-full bg-surface-3 px-4 py-1 text-[11.5px] text-muted">torob-khaneh.demo{path}</span>
        <span className="w-[42px]" />
      </div>
      <div className="relative aspect-[1600/1000] overflow-hidden bg-surface-3">{children}</div>
    </div>
  )
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-[min(300px,70%)] rounded-[42px] bg-[#111114] p-2.5 shadow-[0_30px_80px_-24px_rgb(20_20_25/0.45)] ring-1 ring-black/20">
      <div className="overflow-hidden rounded-[33px] bg-surface">
        {/* status bar: the camera pill sits here, not on top of the app's header */}
        <div className="relative flex h-9 items-center justify-between px-6 text-[11px] font-semibold text-ink" dir="ltr">
          <span className="tabular">9:41</span>
          <span className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-[#111114]" />
          <span className="flex items-center gap-1" aria-hidden>
            <span className="flex h-2.5 items-end gap-[2px]">{[4, 6, 8, 10].map((h) => <span key={h} className="w-[3px] rounded-sm bg-ink" style={{ height: h }} />)}</span>
            <span className="ms-1 h-2.5 w-5 rounded-[3px] p-[1.5px] ring-1 ring-ink/60"><span className="block h-full w-3/4 rounded-[1.5px] bg-ink" /></span>
          </span>
        </div>
        <div className="relative aspect-[390/844] overflow-hidden bg-surface-3">{children}</div>
      </div>
    </div>
  )
}

export function ProductTour({ steps }: { steps: TourStep[] }) {
  const [i, setI] = useState(0)
  const [auto, setAuto] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref, { amount: 0.4 })
  const running = auto && visible

  useEffect(() => {
    if (!running) return
    const t = setTimeout(() => setI((x) => (x + 1) % steps.length), STEP_MS)
    return () => clearTimeout(t)
  }, [running, i, steps.length])

  const s = steps[i]
  const shot = (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.img
        key={s.src}
        src={s.src}
        alt={s.title}
        loading="lazy"
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease }}
        className="absolute inset-0 size-full object-cover object-top"
      />
    </AnimatePresence>
  )

  return (
    <div ref={ref} className="grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-center">
      <div role="tablist" aria-label="تور محصول" className="flex gap-2 overflow-x-auto pb-1 no-scrollbar lg:flex-col lg:overflow-visible lg:pb-0">
        {steps.map((t, k) => {
          const on = k === i
          return (
            <button
              key={t.title}
              role="tab"
              aria-selected={on}
              onClick={() => { setI(k); setAuto(false) }}
              className={cn('relative shrink-0 overflow-hidden rounded-[16px] p-3.5 text-start transition lg:p-4', on ? 'bg-surface shadow-e1 ring-1 ring-line' : 'hover:bg-surface/60')}
            >
              <span className="flex items-center gap-3">
                <span className={cn('grid size-9 shrink-0 place-items-center rounded-[11px] transition', on ? 'bg-brand text-brand-ink' : 'bg-surface-3 text-ink-2')}>{t.icon}</span>
                <span className={cn('whitespace-nowrap text-[14.5px] font-bold transition', on ? 'text-ink' : 'text-ink-2')}>{t.title}</span>
              </span>
              <AnimatePresence initial={false}>
                {on ? (
                  <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }} className="hidden overflow-hidden ps-12 text-[13px] leading-7 text-muted lg:block">
                    <span className="block pt-1.5">{t.text}</span>
                  </motion.p>
                ) : null}
              </AnimatePresence>
              {on && running ? (
                <motion.span key={`p${i}`} className="absolute inset-x-0 bottom-0 h-0.5 origin-right bg-brand" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: STEP_MS / 1000, ease: 'linear' }} />
              ) : null}
            </button>
          )
        })}
      </div>

      <div>
        <p className="mb-4 text-[13.5px] leading-7 text-muted lg:hidden">{s.text}</p>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, ease }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={s.phone ? 'phone' : 'browser'} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.3, ease }}>
              {s.phone ? <PhoneFrame>{shot}</PhoneFrame> : <BrowserFrame path={s.path}>{shot}</BrowserFrame>}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
