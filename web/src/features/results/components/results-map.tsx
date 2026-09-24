'use client'
import L from 'leaflet'
import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import type { HomeCard } from '@/shared/types/home'
import { TILE_ATTRIBUTION, TILE_URL } from '@/shared/lib/map'
import { useUi } from '@/shared/lib/stores'
import { faNum, roomsLabel, tomanShort } from '@/shared/lib/format'

const TEHRAN: [number, number] = [35.72, 51.39]

function FitBounds({ homes }: { homes: HomeCard[] }) {
  const map = useMap()
  const key = homes.map((h) => h.id).join(',')
  useEffect(() => {
    const pts = homes.filter((h) => h.geo).map((h) => [h.geo!.lat, h.geo!.lng] as [number, number])
    if (!pts.length) return
    const fit = () => map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 15, animate: false })
    fit()
    // if the map was hidden when results arrived, fit again once it gets a real size
    const el = map.getContainer()
    if (el.clientWidth === 0) {
      const ro = new ResizeObserver(() => { if (el.clientWidth > 0) { map.invalidateSize(); fit(); ro.disconnect() } })
      ro.observe(el)
      return () => ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map])
  return null
}

/** Leaflet measures its container once; re-measure whenever it changes size (e.g. list ⇄ map toggle on mobile). */
function InvalidateOnResize() {
  const map = useMap()
  useEffect(() => {
    const el = map.getContainer()
    const ro = new ResizeObserver(() => map.invalidateSize({ animate: false }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [map])
  return null
}

function pinIcon(h: HomeCard, active: boolean) {
  const label = h.deal === 'buy' ? tomanShort(h.price) : tomanShort(h.equivRent)
  const deal = h.vsAreaMedian !== undefined && h.vsAreaMedian <= -0.07
  return L.divIcon({ className: '', html: `<span class="price-pin${deal ? ' is-deal' : ''}${active ? ' is-active' : ''}">${label}</span>`, iconSize: [0, 0] })
}

export default function ResultsMap({ homes, className }: { homes: HomeCard[]; className?: string }) {
  const hoveredId = useUi((s) => s.hoveredId)
  const setHovered = useUi((s) => s.setHovered)
  const withGeo = useMemo(() => homes.filter((h) => h.geo).slice(0, 400), [homes])

  return (
    <MapContainer center={TEHRAN} zoom={11} className={className} scrollWheelZoom zoomControl={false} attributionControl>
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <InvalidateOnResize />
      <FitBounds homes={withGeo} />
      {withGeo.map((h) => (
        <Marker
          key={h.id}
          position={[h.geo!.lat, h.geo!.lng]}
          icon={pinIcon(h, hoveredId === h.id)}
          zIndexOffset={hoveredId === h.id ? 1000 : 0}
          eventHandlers={{ mouseover: () => setHovered(h.id), mouseout: () => setHovered(null) }}
        >
          <Popup closeButton={false} className="home-popup">
            <Link href={`/home/${h.id}/`} className="block w-[210px] text-right" dir="rtl">
              {h.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={h.cover} alt="" referrerPolicy="no-referrer" className="mb-2 aspect-[16/10] w-full rounded-lg object-cover" />
              ) : null}
              <span className="block text-[13px] font-bold text-zinc-900">{h.deal === 'buy' ? tomanShort(h.price) : `معادل ${tomanShort(h.equivRent)} در ماه`}</span>
              <span className="block text-[12px] text-zinc-500">
                {roomsLabel(h.rooms)} · {faNum(h.area)} متر · {h.neighborhood}
              </span>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
