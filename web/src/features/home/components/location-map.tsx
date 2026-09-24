'use client'
import L from 'leaflet'
import { useMemo } from 'react'
import { MapContainer, Marker, TileLayer, Polyline } from 'react-leaflet'
import type { MetroStation } from '@/shared/types/home'
import { TILE_ATTRIBUTION, TILE_URL } from '@/shared/lib/map'

const homeIcon = L.divIcon({ className: '', html: '<span class="price-pin is-active">این خانه</span>', iconSize: [0, 0] })

export default function LocationMap({ lat, lng, station }: { lat: number; lng: number; station?: MetroStation }) {
  const pts: [number, number][] = station ? [[lat, lng], [station.lat, station.lng]] : [[lat, lng]]
  const metroIcon = useMemo(() => (station ? L.divIcon({ className: '', html: `<span class="price-pin">مترو ${station.name}</span>`, iconSize: [0, 0] }) : null), [station])
  return (
    <MapContainer bounds={L.latLngBounds(pts).pad(0.5)} className="h-full w-full" scrollWheelZoom={false} zoomControl={false} maxZoom={16}>
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <Marker position={[lat, lng]} icon={homeIcon} />
      {station && metroIcon ? (
        <>
          <Marker position={[station.lat, station.lng]} icon={metroIcon} />
          <Polyline positions={pts} pathOptions={{ color: '#e11d48', weight: 2, dashArray: '5 6' }} />
        </>
      ) : null}
    </MapContainer>
  )
}
