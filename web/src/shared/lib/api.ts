import type { HomeCard } from '@/shared/types/home'

/**
 * Mock API layer. The frontend talks to these functions exactly as it would to a real backend;
 * today they read the static JSON produced by the crawl pipeline, with realistic latency.
 */
const latency = () => new Promise((r) => setTimeout(r, 180 + Math.random() * 220))

let indexCache: Promise<HomeCard[]> | null = null

export function GetHomeIndex(): Promise<HomeCard[]> {
  if (!indexCache) {
    indexCache = fetch('/data/homes-index.json')
      .then((r) => {
        if (!r.ok) throw new Error('بارگذاری داده‌ها ناموفق بود')
        return r.json() as Promise<HomeCard[]>
      })
      .catch((e) => {
        indexCache = null
        throw e
      })
  }
  return latency().then(() => indexCache!)
}
