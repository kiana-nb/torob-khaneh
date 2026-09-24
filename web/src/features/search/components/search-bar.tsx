'use client'
import { ArrowLeft, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { EXAMPLE_QUERIES, parseQuery } from '../lib/intent'
import { IntentChips } from './intent-chips'
import { cn } from '@/shared/lib/cn'

interface Props {
  variant?: 'hero' | 'compact'
  initial?: string
  onSubmit?: (q: string) => void
  autoFocus?: boolean
}

export function SearchBar({ variant = 'hero', initial = '', onSubmit, autoFocus }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(initial)
  const [ph, setPh] = useState(0)
  useEffect(() => setQ(initial), [initial])
  useEffect(() => {
    if (variant !== 'hero') return
    const t = setInterval(() => setPh((p) => (p + 1) % EXAMPLE_QUERIES.length), 3200)
    return () => clearInterval(t)
  }, [variant])
  const parsed = useMemo(() => parseQuery(q), [q])

  const submit = (e?: FormEvent, value = q) => {
    e?.preventDefault()
    if (onSubmit) return onSubmit(value.trim())
    router.push(`/search/?q=${encodeURIComponent(value.trim())}`)
  }

  const hero = variant === 'hero'
  return (
    <div className="w-full">
      <form onSubmit={submit} role="search" className={cn('group relative flex items-center bg-surface transition-shadow focus-within:shadow-e3', hero ? 'h-[62px] rounded-[20px] shadow-e2 ring-1 ring-black/5' : 'h-12 rounded-[14px] shadow-e1 ring-1 ring-line')}>
        <Search className={cn('pointer-events-none absolute text-muted', hero ? 'start-5 size-[22px]' : 'start-4 size-[18px]')} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus={autoFocus}
          placeholder={hero ? EXAMPLE_QUERIES[ph] : 'مثلاً دوخوابه نزدیک مترو تا ۴۰۰ رهن'}
          aria-label="خانه‌ی مورد نظرت را توصیف کن"
          className={cn('h-full w-full min-w-0 bg-transparent text-ink outline-none placeholder:text-muted placeholder:truncate', hero ? 'ps-12 pe-[70px] text-[15px] md:ps-14 md:pe-36 md:text-[17px]' : 'ps-11 pe-[58px] text-[15px] sm:pe-28')}
        />
        <button type="submit" aria-label="جست‌وجو" className={cn('absolute inline-flex items-center gap-1.5 bg-brand font-semibold text-brand-ink transition hover:bg-brand-strong active:scale-[0.98]', hero ? 'end-2 h-[46px] rounded-[14px] px-4 text-[15px] md:px-5' : 'end-1.5 h-9 rounded-[10px] px-3 text-sm')}>
          <span className={hero ? 'hidden md:inline' : 'hidden sm:inline'}>{hero ? 'بگرد' : 'جست‌وجو'}</span>
          <ArrowLeft className="size-[18px]" />
        </button>
      </form>
      {hero ? (
        <div className="mt-3 min-h-8">
          {q.trim() ? (
            <IntentChips chips={parsed.chips} leftover={parsed.leftover} tone="onDark" />
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_QUERIES.slice(0, 3).map((ex) => (
                <button key={ex} onClick={() => { setQ(ex); submit(undefined, ex) }} className="h-8 rounded-full bg-white/12 px-3 text-[12.5px] text-white/90 ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/20">
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
