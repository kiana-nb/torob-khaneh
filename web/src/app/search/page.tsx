import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SearchResults } from '@/features/results/components/search-results'

export const metadata: Metadata = { title: 'جست‌وجو' }

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  )
}
