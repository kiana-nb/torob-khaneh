import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="ترب خانه — صفحه‌ی اصلی">
      <span className="grid size-9 place-items-center rounded-[11px] bg-brand text-brand-ink shadow-e1">
        <svg viewBox="0 0 24 24" className="size-[20px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 11.2 12 4.5l8 6.7" />
          <path d="M6.5 9.8V19h11V9.8" />
          <circle cx="12" cy="14" r="2.2" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-[17px] font-extrabold tracking-tight">ترب خانه</span>
        <span className="mt-0.5 block text-[10.5px] font-medium text-muted">مقایسه‌ی خانه، مثل ترب</span>
      </span>
    </Link>
  )
}
