'use client'
import { useQuery } from '@tanstack/react-query'
import { GetHomeIndex } from '@/shared/lib/api'

export const useHomeIndex = () => useQuery({ queryKey: ['homes', 'index'], queryFn: GetHomeIndex })
