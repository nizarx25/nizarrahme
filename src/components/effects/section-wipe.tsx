'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigation } from '@/store/navigation'

/**
 * Green panel that sweeps up the screen whenever the user switches section.
 * The section swap itself happens while the panel covers the page.
 */
export function SectionWipe() {
  const section = useNavigation((s) => s.section)
  const first = useRef(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setTick((t) => t + 1)
  }, [section])

  if (tick === 0) return null
  return (
    <motion.div
      key={tick}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] bg-[#1F4D3A]"
      initial={{ y: '100%' }}
      animate={{ y: ['100%', '0%', '0%', '-100%'] }}
      transition={{ duration: 1, times: [0, 0.42, 0.58, 1], ease: [0.77, 0, 0.18, 1] }}
    />
  )
}
