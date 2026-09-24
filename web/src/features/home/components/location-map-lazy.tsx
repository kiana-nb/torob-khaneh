'use client'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/shared/components/ui/skeleton'

export const LocationMapLazy = dynamic(() => import('./location-map'), { ssr: false, loading: () => <Skeleton className="h-full w-full rounded-none" /> })
