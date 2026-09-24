import { Mail } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

const LINKEDIN = 'https://www.linkedin.com/in/kiana-nb/'
const GITHUB = 'https://github.com/kiana-nb'
const EMAIL = 'kiana.nabipour07@gmail.com'

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
)
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5z" />
  </svg>
)

function LinkChip({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
  const external = href.startsWith('http')
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold transition',
        primary ? 'bg-brand text-brand-ink hover:bg-brand-strong' : 'bg-surface text-ink ring-1 ring-line hover:ring-line-strong',
      )}
    >
      {children}
    </a>
  )
}

const STATS: Array<[string, string]> = [
  ['۳+ سال', 'از ایده تا production'],
  ['۵۴۰+', 'ریلیز روی یک محصول'],
  ['۴', 'محصول هم‌زمان در production'],
  ['۱۲', 'زبان، از جمله راست‌به‌چپ'],
]

/** "Who built this": photo, role, a short bio and contact links. */
export function AuthorCard() {
  return (
    <div className="grid gap-8 rounded-[28px] bg-surface p-6 shadow-e1 ring-1 ring-line md:grid-cols-[auto_minmax(0,1fr)] md:gap-10 md:p-10">
      <div className="flex flex-col items-center gap-3 md:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, a 320px local photo */}
        <img src="/about/kiana.jpg" alt="کیانا نبی‌پور" width={144} height={144} className="size-32 rounded-full object-cover shadow-e2 ring-4 ring-surface md:size-36" />
      </div>
      <div className="min-w-0 text-center md:text-start">
        <p className="flex items-center justify-center gap-2 text-[12.5px] font-semibold text-muted md:justify-start">
          <span className="h-px w-6 bg-brand" />
          سازنده
        </p>
        <h2 className="mt-2 text-[28px] font-black md:text-[32px]">کیانا نبی‌پور</h2>
        <p className="mt-1 text-[15px] font-semibold text-brand"><span dir="ltr">Frontend Developer / AI Product Engineer</span></p>
        <p className="mx-auto mt-4 max-w-2xl text-[14.5px] leading-8 text-ink-2 md:mx-0">
          بیش از سه سال است محصول را از ایده تا production می‌برم: کشف مسئله، طراحی UX، معماری فرانت، API و انتشار. در کلاسه، Product Engineer یک پلتفرم دانش بین‌المللی مبتنی بر AI به نام Uryva هستم، و فیچرهای AI برای تیم فروش و یک دنیای سه‌بعدی آموزشی برای دانش‌آموزان هم ساخته‌ام. کارم AI-native است؛ همین دمو هم از تحقیق تا دیپلوی با Claude Code ساخته شد.
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map(([n, l]) => (
            <div key={l} className="rounded-[16px] bg-surface-2 px-3 py-3 ring-1 ring-line">
              <dt className="sr-only">{l}</dt>
              <dd className="tabular text-[20px] font-black">{n}</dd>
              <dd className="mt-0.5 text-[12px] leading-5 text-muted">{l}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
          <LinkChip href={LINKEDIN} primary><LinkedinIcon />LinkedIn</LinkChip>
          <LinkChip href={GITHUB}><GithubIcon />GitHub</LinkChip>
          <LinkChip href={`mailto:${EMAIL}`}><Mail className="size-4" /><span dir="ltr">{EMAIL}</span></LinkChip>
        </div>
      </div>
    </div>
  )
}

/** One-line credit for the video page. */
export function AuthorLine() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[18px] bg-surface p-3 pe-4 ring-1 ring-line">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, a 320px local photo */}
      <img src="/about/kiana.jpg" alt="" width={44} height={44} className="size-11 rounded-full object-cover" />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold">ساخته‌شده توسط کیانا نبی‌پور</p>
        <p className="text-[12.5px] text-muted"><span dir="ltr">Frontend Developer / AI Product Engineer</span></p>
      </div>
      <div className="flex gap-2">
        <LinkChip href={LINKEDIN}><LinkedinIcon />LinkedIn</LinkChip>
        <LinkChip href={`mailto:${EMAIL}`}><Mail className="size-4" />ایمیل</LinkChip>
      </div>
    </div>
  )
}
