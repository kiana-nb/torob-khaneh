'use client'
import { Bookmark } from 'lucide-react'
import Link from 'next/link'
import { HomeCard } from '@/features/results/components/home-card'
import { buttonVariants } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useHomeIndex } from '@/shared/hooks/use-home-index'
import { useMounted } from '@/shared/hooks/use-mounted'
import { cn } from '@/shared/lib/cn'
import { faNum } from '@/shared/lib/format'
import { useShortlist } from '@/shared/lib/stores'

export default function SavedPage() {
  const mounted = useMounted()
  const saved = useShortlist((s) => s.saved)
  const { data, isLoading } = useHomeIndex()
  const homes = data ? saved.map((id) => data.find((h) => h.id === id)).filter((h) => !!h) : []

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-10 pt-8 md:px-6">
      <h1 className="text-[26px] font-black md:text-[30px]">ذخیره‌ها</h1>
      <p className="mb-6 mt-1 text-[14px] text-muted">روی همین دستگاه ذخیره می‌شوند؛ بدون ثبت‌نام.{mounted && homes.length ? ` ${faNum(homes.length)} خانه.` : ''}</p>
      {!mounted || isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-80" />)}</div>
      ) : homes.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{homes.map((h) => <HomeCard key={h!.id} h={h!} />)}</div>
      ) : (
        <div className="grid place-items-center rounded-[22px] bg-surface px-6 py-16 text-center ring-1 ring-line">
          <span className="grid size-14 place-items-center rounded-full bg-brand-soft text-brand"><Bookmark className="size-7" /></span>
          <p className="mt-4 text-[17px] font-bold">هنوز چیزی ذخیره نکرده‌ای</p>
          <p className="mt-1 max-w-sm text-[13.5px] leading-7 text-muted">با آیکون نشان روی هر کارت، خانه‌های مورد علاقه‌ات را این‌جا جمع کن.</p>
          <Link href="/search/" className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'mt-5')}>شروع جست‌وجو</Link>
        </div>
      )}
    </div>
  )
}
