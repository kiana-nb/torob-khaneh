import 'server-only'
import homesJson from '@/data/homes.json'
import neighborhoodsJson from '@/data/neighborhoods.json'
import metroJson from '@/data/metro.json'
import reportJson from '@/data/report.json'
import type { DataReport, Home, HomeCard, MetroStation, Neighborhood } from '@/shared/types/home'

export const homes = homesJson as unknown as Home[]
export const neighborhoods = neighborhoodsJson as Neighborhood[]
export const metro = metroJson as MetroStation[]
export const report = reportJson as DataReport

const byId = new Map(homes.map((h) => [h.id, h]))
export const getHome = (id: string) => byId.get(id)
export const getNeighborhood = (slug: string) => neighborhoods.find((n) => n.slug === slug)
export const getStation = (name?: string) => (name ? metro.find((s) => s.name === name) : undefined)

const BASE_KEYS = [
  'id', 'deal', 'districtId', 'neighborhood', 'region', 'title', 'area', 'rooms', 'yearBuilt', 'age', 'floor', 'totalFloors', 'features', 'geo',
  'deposit', 'rent', 'convertible', 'equivRent', 'equivRentPerM2', 'price', 'pricePerM2', 'negotiable', 'postedAt', 'nearestMetro', 'areaMedianPerM2', 'vsAreaMedian',
] as const

/** Full home → lightweight card (same shape as public/data/homes-index.json). */
export function toCard(h: Home): HomeCard {
  const base = Object.fromEntries(BASE_KEYS.map((k) => [k, h[k]])) as Pick<Home, (typeof BASE_KEYS)[number]>
  return { ...base, cover: h.images[0] ?? h.thumbs[0], thumbs: h.thumbs.slice(0, 4), imageCount: h.images.length, sources: h.listings.length, flags: h.trust.flags, pros: h.ai.pros.slice(0, 3), owner: h.trust.owner }
}

/** Per-m² values of the same deal type in the same neighborhood (for the histogram). */
export function districtValues(h: Pick<Home, 'deal' | 'districtId'>) {
  return homes
    .filter((x) => x.deal === h.deal && x.districtId === h.districtId)
    .map((x) => (x.deal === 'rent' ? x.equivRentPerM2 : x.pricePerM2))
    .filter((v): v is number => typeof v === 'number')
}

export function similarHomes(h: Home, n = 4): HomeCard[] {
  const key = (x: Home) => (x.deal === 'rent' ? x.equivRent : x.price) ?? 0
  const k = key(h) || 1
  return homes
    .filter((x) => x.id !== h.id && x.deal === h.deal && (x.districtId === h.districtId || Math.abs(key(x) - k) / k < 0.15))
    .map((x) => ({ x, d: (x.districtId === h.districtId ? 0 : 0.5) + Math.abs(x.area - h.area) / h.area + Math.abs(key(x) - k) / k }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map(({ x }) => toCard(x))
}

export const homesIn = (districtId: number) => homes.filter((h) => h.districtId === districtId)
