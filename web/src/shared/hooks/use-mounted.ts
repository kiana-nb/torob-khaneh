'use client'
import { useEffect, useState } from 'react'

/** true after hydration — guards localStorage-backed state from SSR/CSR mismatches. */
export function useMounted() {
  const [m, setM] = useState(false)
  useEffect(() => setM(true), [])
  return m
}
