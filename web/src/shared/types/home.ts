export type Deal = 'rent' | 'buy'
export type TrustFlag = 'negotiable' | 'stockPhotos' | 'noPhotos' | 'tooGood'

export interface Geo {
  lat: number
  lng: number
  approx: boolean
}

export interface Features {
  elevator?: boolean
  parking?: boolean
  storage?: boolean
  balcony?: boolean
  renovated?: boolean
}

export interface NearestMetro {
  station: string
  lines: number[]
  meters: number
}

/** A single source listing (one ad) that belongs to a home. */
export interface Listing {
  id: string
  url: string
  source: 'divar'
  title: string
  deposit?: number
  rent?: number
  equivRent?: number
  price?: number
  negotiable: boolean
  postedAt: string
  isAgency: boolean
  bumped: boolean
  stockPhotos: boolean
  thumb?: string
}

/** Fields shared by the search index and the full home record. */
export interface HomeBase {
  id: string
  deal: Deal
  districtId: number
  neighborhood: string
  region: string
  title: string
  area: number
  rooms: number
  yearBuilt?: number
  age?: number
  floor?: number
  totalFloors?: number
  features: Features
  geo?: Geo
  deposit?: number
  rent?: number
  convertible?: boolean
  equivRent?: number
  equivRentPerM2?: number
  price?: number
  pricePerM2?: number
  negotiable: boolean
  postedAt: string
  nearestMetro?: NearestMetro
  areaMedianPerM2?: number
  vsAreaMedian?: number
}

/** Lightweight record used by search, cards, map and compare (public/data/homes-index.json). */
export interface HomeCard extends HomeBase {
  cover?: string
  thumbs: string[]
  imageCount: number
  sources: number
  flags: TrustFlag[]
  pros: string[]
  owner: boolean
}

/** Full record used by the statically generated home page (src/data/homes.json). */
export interface Home extends HomeBase {
  description: string
  images: string[]
  thumbs: string[]
  direction?: string
  listings: Listing[]
  trust: { hasPhotos: boolean; stockPhotos: boolean; negotiable: boolean; anyAgency: boolean; owner: boolean; flags: TrustFlag[] }
  ai: { summary: string; pros: string[]; cons: string[] }
}

export interface Neighborhood {
  id: number
  slug: string
  name: string
  region: string
  center: { lat: number; lng: number }
  rentCount: number
  buyCount: number
  medianEquivRent?: number
  medianEquivRentPerM2?: number
  medianPricePerM2?: number
  medianArea: number
  coverImage?: string
  coverHomeId?: string
}

export interface MetroStation {
  name: string
  nameEn?: string
  lat: number
  lng: number
  lines: number[]
}

export interface DataReport {
  crawledAt: string
  rawListings: number
  parsed: number
  skipped: Record<string, number>
  negotiable: number
  stockPhotos: number
  noPhotos: number
  bumped: number
  agency: number
  homes: number
  rentHomes: number
  buyHomes: number
  mergedHomes: number
  mergedListings: number
  duplicateShare: number
  neighborhoods: number
  metroStations: number
  rahnRate: number
}
