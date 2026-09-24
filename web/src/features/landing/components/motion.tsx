'use client'
import { animate, motion, useInView, type Variants } from 'framer-motion'
import { Combine, Sparkles, TrendingDown } from 'lucide-react'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { SmartImg } from '@/shared/components/ui/smart-img'
import { cn } from '@/shared/lib/cn'
import { faNum, percent } from '@/shared/lib/format'

const ease = [0.22, 1, 0.36, 1] as const

/* ───────── hero copy ───────── */

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }
const word: Variants = {
  hidden: { opacity: 0, y: '0.45em', filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease } },
}
const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
}

/** Staggers everything inside; direct pieces use <HeroItem>, the headline <HeroTitle>. */
export function HeroCopy({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {children}
    </motion.div>
  )
}

export function HeroItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={rise} className={className}>
      {children}
    </motion.div>
  )
}

/** Line one comes in word by word; line two (the promise) is wiped in right-to-left, in reading direction. */
export function HeroTitle({ lead, accent }: { lead: string; accent: string }) {
  const words = lead.split(' ')
  return (
    <motion.h1 variants={stagger} className="mt-5 text-[34px] font-black leading-[1.25] tracking-tight md:text-[52px]">
      {words.map((w, i) => (
        <span key={i}>
          <motion.span variants={word} className="inline-block">{w}</motion.span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
      <br />
      <motion.span
        variants={{
          hidden: { clipPath: 'inset(-20% 0 -20% 100%)', opacity: 0.4 },
          show: { clipPath: 'inset(-20% 0 -20% 0%)', opacity: 1, transition: { duration: 0.9, ease, delay: 0.1 } },
        }}
        className="inline-block bg-gradient-to-l from-[#ff8aa0] to-white bg-clip-text pb-1 text-transparent"
      >
        {accent}
      </motion.span>
    </motion.h1>
  )
}

/* ───────── hero photo wall ───────── */

function Column({ photos, dir, duration }: { photos: string[]; dir: 'up' | 'down'; duration: number }) {
  // the list is rendered twice and the track moves by exactly one copy, so the loop is seamless
  return (
    <div className="overflow-hidden">
      <div className={cn('wall-track flex flex-col gap-3', dir === 'up' ? 'wall-up' : 'wall-down')} style={{ animationDuration: `${duration}s` }}>
        {[...photos, ...photos].map((src, i) => (
          <SmartImg key={i} src={src} loading={i < 4 ? 'eager' : 'lazy'} wrapperClassName="aspect-[3/4] shrink-0 rounded-[18px] ring-1 ring-white/10" className="opacity-90" />
        ))}
      </div>
    </div>
  )
}

function FloatCard({ children, className, delay, bob }: { children: ReactNode; className: string; delay: number; bob: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22, delay }}
      className={cn('absolute z-10', className)}
    >
      <div className="float-bob rounded-[16px] bg-white/95 p-3 text-zinc-900 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.55)] ring-1 ring-black/5 backdrop-blur" style={{ animationDuration: `${bob}s` }}>
        {children}
      </div>
    </motion.div>
  )
}

export interface WallDeal {
  neighborhood: string
  rooms: string
  price: string
  pct: string
}

export function PhotoWall({ photos, deal, merged }: { photos: string[]; deal?: WallDeal; merged: { listings: number; homes: number } }) {
  const cols = [0, 1, 2].map((c) => photos.filter((_, i) => i % 3 === c))
  return (
    <div className="relative hidden h-[460px] lg:block" aria-hidden>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease, delay: 0.25 }}
        className="wall-mask absolute inset-[-40px_-10px] grid rotate-[-6deg] grid-cols-3 gap-3"
      >
        <Column photos={cols[0]} dir="up" duration={46} />
        <Column photos={cols[1]} dir="down" duration={54} />
        <Column photos={cols[2]} dir="up" duration={50} />
      </motion.div>

      {deal ? (
        <FloatCard className="-start-6 top-16" delay={0.9} bob={7}>
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-[11px] bg-emerald-100 text-emerald-700"><TrendingDown className="size-[18px]" /></span>
            <div className="leading-tight">
              <p className="text-[11px] text-zinc-500">{deal.rooms} · {deal.neighborhood}</p>
              <p className="text-[14px] font-extrabold">{deal.price} <span className="text-[11px] font-medium text-zinc-500">در ماه</span></p>
            </div>
            <span className="ms-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">{deal.pct} زیر محله</span>
          </div>
        </FloatCard>
      ) : null}

      <FloatCard className="-end-4 bottom-14" delay={1.15} bob={8.5}>
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-[11px] bg-rose-100 text-rose-600"><Combine className="size-[18px]" /></span>
          <div className="leading-tight">
            <p className="text-[11px] text-zinc-500">آگهی تکراری، ادغام‌شده</p>
            <p className="text-[14px] font-extrabold">{faNum(merged.listings)} آگهی ← {faNum(merged.homes)} خانه</p>
          </div>
        </div>
      </FloatCard>

      <FloatCard className="end-10 top-2" delay={1.35} bob={9.5}>
        <p className="flex items-center gap-1.5 text-[12px] font-semibold">
          <Sparkles className="size-3.5 text-rose-500" />
          فهمیدم: <span className="rounded-full bg-zinc-100 px-2 py-0.5">دوخوابه</span><span className="rounded-full bg-zinc-100 px-2 py-0.5">نزدیک مترو</span>
        </p>
      </FloatCard>
    </div>
  )
}

/* ───────── numbers & scroll reveals ───────── */

/** Counts up to `value` the first time it scrolls into view. Server HTML already holds the final number. */
export function CountUp({ value, kind = 'int' }: { value: number; kind?: 'int' | 'pct' }) {
  const format = (n: number) => (kind === 'pct' ? percent(n) : faNum(Math.round(n)))
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [shown, setShown] = useState(value)
  useLayoutEffect(() => {
    if (!inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = animate(0, value, { duration: 1.4, ease, delay: 0.5, onUpdate: (v) => setShown(v) })
    return () => c.stop()
  }, [inView, value])
  return <span ref={ref}>{format(inView ? shown : value)}</span>
}

/** Fades a block up once, when it first enters the viewport. */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease, delay }}
    >
      {children}
    </motion.div>
  )
}

/** A list whose items (<RevealItem>) come in one after another when the list scrolls into view. */
export function RevealGroup({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'ol' | 'ul' }) {
  const Tag = as === 'ol' ? motion.ol : as === 'ul' ? motion.ul : motion.div
  return (
    <Tag className={className} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
      {children}
    </Tag>
  )
}

export function RevealItem({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'li' }) {
  const Tag = as === 'li' ? motion.li : motion.div
  return (
    <Tag className={className} variants={rise}>
      {children}
    </Tag>
  )
}
