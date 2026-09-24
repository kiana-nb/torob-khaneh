'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, Columns3, MapPinned, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Logo } from './logo'
import { ThemeToggle } from './theme-toggle'
import { useShortlist } from '@/shared/lib/stores'
import { cn } from '@/shared/lib/cn'
import { faNum } from '@/shared/lib/format'

const NAV = [
  { href: '/search/', label: 'جست‌وجو', icon: Search },
  { href: '/areas/', label: 'محله‌ها', icon: MapPinned },
  { href: '/compare/', label: 'مقایسه', icon: Columns3, count: 'compare' as const },
  { href: '/saved/', label: 'ذخیره‌ها', icon: Bookmark, count: 'saved' as const },
]

function useCounts() {
  const saved = useShortlist((s) => s.saved.length)
  const compare = useShortlist((s) => s.compare.length)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted ? { saved, compare } : { saved: 0, compare: 0 }
}

export function SiteHeader() {
  const pathname = usePathname()
  const counts = useCounts()
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-4 px-4 md:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="ناوبری اصلی">
          {NAV.map(({ href, label, icon: Icon, count }) => {
            const active = pathname.startsWith(href.replace(/\/$/, ''))
            const n = count ? counts[count] : 0
            return (
              <Link key={href} href={href} className={cn('relative flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-medium text-ink-2 transition hover:bg-surface-3 hover:text-ink', active && 'bg-surface text-ink shadow-e1')}>
                <Icon className="size-[17px]" />
                {label}
                {n > 0 ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-brand-ink">{faNum(n)}</span> : null}
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center gap-1">
          <Link href="/about/" className="hidden h-10 items-center rounded-full px-3 text-[13px] font-medium text-muted hover:text-ink lg:flex">
            این دمو چطور ساخته شد؟
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  const counts = useCounts()
  if (pathname.startsWith('/home/')) return null
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden" aria-label="ناوبری پایین">
      <div className="grid grid-cols-4">
        {NAV.map(({ href, label, icon: Icon, count }) => {
          const active = pathname.startsWith(href.replace(/\/$/, ''))
          const n = count ? counts[count] : 0
          return (
            <Link key={href} href={href} className={cn('relative flex h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted', active && 'text-brand')}>
              <span className="relative">
                <Icon className="size-[21px]" strokeWidth={active ? 2.3 : 1.9} />
                {n > 0 ? <span className="absolute -end-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-ink">{faNum(n)}</span> : null}
              </span>
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
