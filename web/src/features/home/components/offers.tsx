import { BadgeCheck, ExternalLink, ImageOff, Megaphone, Store, UserRound } from 'lucide-react'
import type { Listing } from '@/shared/types/home'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/cn'
import { ago, toman } from '@/shared/lib/format'

/** Torob-style «فروشندگان» list: every ad of the same home, cheapest first. */
export function Offers({ listings, deal }: { listings: Listing[]; deal: 'rent' | 'buy' }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-sheet bg-surface ring-1 ring-line">
      {listings.map((l, i) => (
        <li key={l.id} className={cn('flex flex-col gap-3 p-4 sm:flex-row sm:items-center', i === 0 && 'bg-good-soft/40')}>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-[#a62626] text-[13px] font-extrabold text-white" aria-label="دیوار">دیوار</span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold">{l.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-muted">
                <span>{ago(l.postedAt)}</span>
                <Badge tone={l.isAgency ? 'neutral' : 'info'}>{l.isAgency ? <><Store className="size-3" />مشاور املاک</> : <><UserRound className="size-3" />شخصی</>}</Badge>
                {l.bumped ? <Badge tone="neutral"><Megaphone className="size-3" />نردبان‌شده</Badge> : null}
                {l.stockPhotos ? <Badge tone="warn"><ImageOff className="size-3" />عکس نمونه</Badge> : null}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <div className="text-end">
              {i === 0 && listings.length > 1 ? (
                <p className="mb-0.5 inline-flex items-center gap-1 text-[11.5px] font-bold text-good"><BadgeCheck className="size-3.5" />ارزان‌ترین</p>
              ) : null}
              {deal === 'rent' ? (
                <>
                  <p className="tabular text-[14px] font-bold">{l.negotiable ? 'توافقی' : `${toman(l.deposit, { unit: false, zero: '۰' })} / ${toman(l.rent, { unit: false, zero: '۰' })}`}</p>
                  {!l.negotiable ? <p className="text-[11.5px] text-muted">رهن / اجاره · معادل {toman(l.equivRent)}</p> : null}
                </>
              ) : (
                <p className="tabular text-[14px] font-bold">{toman(l.price)}</p>
              )}
            </div>
            <a href={l.url} target="_blank" rel="noreferrer" className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[12px] bg-ink px-3.5 text-[13px] font-semibold text-surface transition hover:opacity-90">
              رفتن به آگهی
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </li>
      ))}
    </ul>
  )
}
