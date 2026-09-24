import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CompareView } from '@/features/compare/components/compare-view'

export const metadata: Metadata = { title: 'مقایسه' }

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-10 pt-8 md:px-6">
      <h1 className="mb-1 text-[26px] font-black md:text-[30px]">مقایسه‌ی کنار هم</h1>
      <p className="mb-6 text-[14px] text-muted">بهترین مقدار هر ردیف سبز می‌شود. لینکش را برای هم‌خانه‌ات بفرست.</p>
      <Suspense>
        <CompareView />
      </Suspense>
    </div>
  )
}
