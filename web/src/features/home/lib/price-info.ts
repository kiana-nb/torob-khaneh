import type { Home } from '@/shared/types/home'

/** Only what the price panel needs — keeps the serialized props of each statically generated page small. */
export type PriceInfo = Pick<Home, 'id' | 'deal' | 'deposit' | 'rent' | 'equivRent' | 'price' | 'pricePerM2' | 'negotiable' | 'vsAreaMedian' | 'convertible'> & {
  summary: string
  bestUrl: string
  listingCount: number
}

export const toPriceInfo = (h: Home): PriceInfo => ({
  id: h.id,
  deal: h.deal,
  deposit: h.deposit,
  rent: h.rent,
  equivRent: h.equivRent,
  price: h.price,
  pricePerM2: h.pricePerM2,
  negotiable: h.negotiable,
  vsAreaMedian: h.vsAreaMedian,
  convertible: h.convertible,
  summary: h.ai.summary,
  bestUrl: h.listings[0].url,
  listingCount: h.listings.length,
})
