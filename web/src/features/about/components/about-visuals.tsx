'use client'
import { motion, type Variants } from 'framer-motion'
import { ArrowLeft, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { faNum } from '@/shared/lib/format'

const ease = [0.22, 1, 0.36, 1] as const
const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.3 } } as const

/** Small section label with a red rule, as on jobs.torob.com. */
export function Eyebrow({ children, onDark }: { children: ReactNode; onDark?: boolean }) {
  return (
    <p className={cn('flex items-center gap-2 text-[12.5px] font-semibold', onDark ? 'text-white/70' : 'text-muted')}>
      <span className="h-px w-6 bg-brand" />
      {children}
    </p>
  )
}

/* ───────── hero: the problems behind one search ───────── */

// node positions in % of the stage; the search box sits in the middle
const NODES: Array<{ x: number; y: number }> = [
  { x: 14, y: 12 }, { x: 50, y: 5 }, { x: 86, y: 12 },
  { x: 7, y: 50 }, { x: 93, y: 50 },
  { x: 14, y: 88 }, { x: 50, y: 95 }, { x: 86, y: 88 },
]

export function ProblemOrbit({ problems, query }: { problems: Array<{ icon: ReactNode; label: string }>; query: string }) {
  const center = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
      className="relative z-10 w-[min(300px,100%)] rounded-[18px] bg-[#1c1c21] p-3 shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_24px_60px_-10px_rgb(225_29_72/0.45)]"
    >
      <div className="flex items-center gap-2 rounded-[12px] bg-white/[0.06] px-3 py-2.5 text-[12.5px] text-white/85 ring-1 ring-white/10">
        <Search className="size-4 shrink-0 text-white/50" />
        <span className="truncate">{query}</span>
        <span className="typing-caret ms-auto h-4 w-px shrink-0 bg-brand" />
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {['دوخوابه', 'نزدیک مترو', 'رهن ≤ ۲ میلیارد', 'پارکینگ'].map((c, i) => (
          <motion.span key={c} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55 + i * 0.08, type: 'spring', stiffness: 320, damping: 22 }} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/80">
            {c}
          </motion.span>
        ))}
      </div>
    </motion.div>
  )

  return (
    <>
      {/* desktop: orbit with connectors */}
      <div className="relative hidden aspect-[1.2] w-full lg:block" aria-hidden>
        <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {NODES.map((n, i) => (
            <motion.line
              key={i}
              x1="50" y1="50" x2={n.x} y2={n.y}
              stroke="url(#orbit-line)"
              strokeWidth="0.22"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease, delay: 0.6 + i * 0.07 }}
            />
          ))}
          <defs>
            {/* userSpaceOnUse: a bounding-box gradient has no box on perfectly horizontal/vertical lines, which then don't paint */}
            <linearGradient id="orbit-line" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fb5475" stopOpacity=".7" />
              <stop offset="1" stopColor="#fb5475" stopOpacity=".2" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">{center}</div>
        {problems.slice(0, NODES.length).map((p, i) => (
          <motion.div
            key={p.label}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.9 + i * 0.07 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${NODES[i].x}%`, top: `${NODES[i].y}%` }}
          >
            <span className="flex items-center gap-2 whitespace-nowrap rounded-[12px] bg-[#18181c]/95 px-3 py-2 text-[12px] font-semibold text-white/90 shadow-lg ring-1 ring-white/10 backdrop-blur transition hover:ring-brand/60">
              <span className="grid size-6 place-items-center rounded-[8px] bg-brand/15 text-[#ff7a93]">{p.icon}</span>
              {p.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* mobile: search box + chips */}
      <div className="lg:hidden" aria-hidden>
        {center}
        <div className="mt-4 flex flex-wrap gap-2">
          {problems.map((p, i) => (
            <motion.span key={p.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.05 }} className="flex items-center gap-1.5 rounded-[10px] bg-white/[0.06] px-2.5 py-1.5 text-[12px] text-white/85 ring-1 ring-white/10">
              <span className="text-[#ff7a93]">{p.icon}</span>
              {p.label}
            </motion.span>
          ))}
        </div>
      </div>
    </>
  )
}

/* ───────── numbers ───────── */

export function Donut({ value, tone = 'warn' }: { value: number; tone?: 'warn' | 'brand' }) {
  const r = 38
  const c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 100 100" className="size-[108px] -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" strokeWidth="11" className="stroke-surface-3" />
      <motion.circle
        cx="50" cy="50" r={r} fill="none" strokeWidth="11" strokeLinecap="round"
        className={tone === 'warn' ? 'stroke-warn' : 'stroke-brand'}
        strokeDasharray={c}
        variants={{ hidden: { strokeDashoffset: c }, show: { strokeDashoffset: c * (1 - value), transition: { duration: 1.2, ease, delay: 0.2 } } }}
        {...inView}
      />
    </svg>
  )
}

export function Meter({ value, className }: { value: number; className?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-surface-3">
      <motion.div
        className={cn('h-full origin-right rounded-full', className ?? 'bg-brand')}
        style={{ width: `${value * 100}%` }}
        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1, ease, delay: 0.15 } } }}
        {...inView}
      />
    </div>
  )
}

export function SplitBar({ a, b }: { a: { n: number; label: string }; b: { n: number; label: string } }) {
  const share = a.n / (a.n + b.n)
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-surface-3">
        <motion.div className="h-full origin-right bg-brand" style={{ width: `${share * 100}%` }} variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1, ease } } }} {...inView} />
        <motion.div className="h-full origin-right bg-ink/70" style={{ width: `${(1 - share) * 100}%` }} variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.8, ease, delay: 0.5 } } }} {...inView} />
      </div>
      <div className="mt-2 flex justify-between text-[12px] text-muted">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-brand" />{a.label} <b className="tabular text-ink">{faNum(a.n)}</b></span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-ink/70" />{b.label} <b className="tabular text-ink">{faNum(b.n)}</b></span>
      </div>
    </div>
  )
}

/** Many ads collapse into fewer homes: dots gather into clusters. */
export function MergeDots({ listings, homes }: { listings: number; homes: number }) {
  // distribute listings across homes as evenly as the real numbers allow (39 → 19: mostly pairs, one triple)
  const sizes = Array.from({ length: homes }, (_, i) => Math.floor(listings / homes) + (i < listings % homes ? 1 : 0))
  return (
    <motion.div className="flex flex-wrap gap-x-2.5 gap-y-2" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }} {...inView}>
      {sizes.map((s, i) => (
        <motion.span key={i} className="flex -space-x-1.5 space-x-reverse" variants={{ hidden: { opacity: 0, scale: 0.5 }, show: { opacity: 1, scale: 1 } }}>
          {Array.from({ length: s }, (_, j) => (
            <span key={j} className={cn('size-3 rounded-full ring-2 ring-surface', j === 0 ? 'bg-good' : 'bg-good/45')} />
          ))}
        </motion.span>
      ))}
    </motion.div>
  )
}

/* ───────── pipeline timeline ───────── */

export function Pipeline({ steps }: { steps: Array<{ en: string; fa: string; text: string; example: [string, string] }> }) {
  return (
    <motion.ol className="relative grid gap-4 lg:grid-cols-4 lg:gap-5" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }} {...inView}>
      {/* the rail fills in reading direction as the steps appear */}
      <div className="absolute inset-x-[12%] top-[22px] hidden h-0.5 rounded-full bg-line lg:block" aria-hidden>
        <motion.div className="h-full origin-right rounded-full bg-brand" variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.4, ease, delay: 0.1 } } }} />
      </div>
      <div className="absolute bottom-6 start-[21px] top-6 w-0.5 rounded-full bg-line lg:hidden" aria-hidden>
        <motion.div className="h-full origin-top rounded-full bg-brand" variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 1.4, ease, delay: 0.1 } } }} />
      </div>
      {steps.map((s, i) => (
        <motion.li key={s.en} className="relative flex gap-4 lg:block" variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}>
          <span className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full bg-surface text-[15px] font-black text-brand shadow-e1 ring-2 ring-brand/30 lg:mx-auto">{faNum(i + 1)}</span>
          <div className="min-w-0 flex-1 rounded-[20px] bg-surface p-4 shadow-e1 ring-1 ring-line lg:mt-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted" dir="ltr">{s.en}</p>
            <p className="mt-0.5 text-[16px] font-extrabold">{s.fa}</p>
            <p className="mt-1.5 text-[13px] leading-7 text-ink-2">{s.text}</p>
            <p className="mt-3 flex flex-wrap items-center gap-1.5 rounded-[12px] bg-surface-2 px-2.5 py-2 font-mono text-[11.5px] ring-1 ring-line">
              <span className="text-muted line-through decoration-brand/50">{s.example[0]}</span>
              <ArrowLeft className="size-3.5 text-brand" />
              <span className="font-semibold text-ink">{s.example[1]}</span>
            </p>
          </div>
        </motion.li>
      ))}
    </motion.ol>
  )
}

/* ───────── before / after ───────── */

export function BeforeAfter({ raw, after }: { raw: Array<{ title: string; price: string; tag: string }>; after: Array<[string, string]> }) {
  const card: Variants = { hidden: { opacity: 0, y: 14, rotate: 0 }, show: (i: number) => ({ opacity: 1, y: 0, rotate: [-2.5, 1.5, -1][i % 3], transition: { duration: 0.6, ease, delay: i * 0.12 } }) }
  return (
    <motion.div className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
      <div className="space-y-2.5">
        {raw.map((r, i) => (
          <motion.div key={i} custom={i} variants={card} className="rounded-[16px] bg-surface p-3.5 shadow-e1 ring-1 ring-line">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[13px] font-semibold">«{r.title}»</p>
              <span className="shrink-0 rounded-full bg-surface-3 px-2 py-0.5 text-[10.5px] text-muted">{r.tag}</span>
            </div>
            <p className="tabular mt-1 text-[12px] text-muted">{r.price}</p>
          </motion.div>
        ))}
      </div>
      <motion.div variants={{ hidden: { opacity: 0, scale: 0.6 }, show: { opacity: 1, scale: 1, transition: { delay: 0.5, type: 'spring', stiffness: 260, damping: 18 } } }} className="mx-auto grid size-12 place-items-center rounded-full bg-brand text-brand-ink shadow-[0_10px_30px_-8px_rgb(225_29_72/0.6)]">
        <ArrowLeft className="size-5 max-md:-rotate-90" />
      </motion.div>
      <motion.div variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { delay: 0.65, duration: 0.6, ease, staggerChildren: 0.06, delayChildren: 0.8 } } }} className="rounded-[20px] bg-[#16161a] p-4 font-mono text-[12.5px] text-zinc-300 shadow-e2 ring-1 ring-white/5" dir="ltr">
        <p className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wider text-zinc-500"><span className="size-2 rounded-full bg-emerald-400" />home · normalized</p>
        {after.map(([k, v]) => (
          <motion.p key={k} variants={{ hidden: { opacity: 0, x: -6 }, show: { opacity: 1, x: 0 } }} className="flex justify-between gap-4 border-b border-white/5 py-1.5 last:border-0">
            <span className="text-[#ff8aa0]">{k}</span>
            <span className="text-zinc-100">{v}</span>
          </motion.p>
        ))}
      </motion.div>
    </motion.div>
  )
}

/* ───────── ranking weights ───────── */

export function WeightBars({ rows }: { rows: Array<{ label: string; w: number }> }) {
  const max = Math.max(...rows.map((r) => r.w))
  return (
    <motion.div className="space-y-3" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }} {...inView}>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 text-[13.5px] font-medium">{r.label}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-3">
            <motion.div className="h-full origin-right rounded-full bg-gradient-to-l from-brand to-[#ff7a93]" style={{ width: `${(r.w / max) * 100}%` }} variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.9, ease } } }} />
          </div>
          <span className="tabular w-10 text-end text-[13px] font-bold">{faNum(Math.round(r.w * 100))}٪</span>
        </div>
      ))}
    </motion.div>
  )
}
