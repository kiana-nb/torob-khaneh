import Link from 'next/link'
import { cn } from '@/shared/lib/cn'

/** The mark: a house with a radish sprout (ترب) on the roof. Same drawing as app/icon.svg (favicon). */
export function LogoMark({ className, id = 'tk' }: { className?: string; id?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn('size-9 drop-shadow-[0_2px_6px_rgb(225_29_72/0.35)]', className)} aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="6" y1="2" x2="42" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff5d7e" />
          <stop offset=".55" stopColor="#e11d48" />
          <stop offset="1" stopColor="#b3123c" />
        </linearGradient>
        <linearGradient id={`${id}-leaf`} x1="24" y1="4" x2="24" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#86efac" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill={`url(#${id}-bg)`} />
      <path d="M24 17.6c-.9-4.6-4.3-7.7-9.4-7.9.6 5 4.4 8.3 9.4 7.9z" fill={`url(#${id}-leaf)`} />
      <path d="M24 17.6c.2-5.7 3.6-10 9.8-11 .2 6.2-3.6 10.6-9.8 11z" fill={`url(#${id}-leaf)`} />
      <path d="M11.8 26.3 22.1 18a3 3 0 0 1 3.8 0l10.3 8.3c.5.4.8 1 .8 1.6V37a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4v-9.1c0-.6.3-1.2.8-1.6z" fill="#fff" />
      <path d="M20.4 41v-5.6a3.6 3.6 0 0 1 7.2 0V41z" fill={`url(#${id}-bg)`} />
    </svg>
  )
}

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="ترب خانه — صفحه‌ی اصلی">
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105" />
      <span className="leading-none">
        <span className="block text-[18px] font-black tracking-tight">
          ترب <span className="text-brand">خانه</span>
        </span>
        <span className="mt-1 block text-[10.5px] font-medium text-muted">مقایسه‌ی خانه، مثل ترب</span>
      </span>
    </Link>
  )
}
