'use client'

import { useRef, useState, type PointerEvent } from 'react'
import { motion } from 'framer-motion'
import { heroDelay } from './intro-curtain'

type Props = {
  /** Domain names revealed inside the lens. */
  names: string[]
}

const EASE = [0.77, 0, 0.18, 1] as const

/**
 * The hero headline. Lines rise out of masks on load. On pointer devices a
 * green lens follows the cursor and reveals the real domain names beneath
 * the headline.
 */
export function HeroLens({ names }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
  }

  const lines = [
    <>Own the Name Behind</>,
    <>
      <em className="italic">What&rsquo;s Next.</em>
    </>,
  ]
  const shown = names.slice(0, 2)

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => setPos(null)}
      className="relative"
    >
      <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.02] tracking-tight text-white">
        {lines.map((l, i) => (
          <span key={i} className="block overflow-hidden pb-[0.1em]">
            <motion.span
              className="block"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: heroDelay() + i * 0.12, ease: EASE }}
            >
              {l}
            </motion.span>
          </span>
        ))}
      </h1>

      {shown.length > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden md:flex flex-col justify-center bg-[#1F4D3A] text-[#F6F1E8] font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.02] tracking-tight"
          style={{
            clipPath: pos
              ? `circle(130px at ${pos.x}px ${pos.y}px)`
              : 'circle(0px at 50% 50%)',
            transition: 'clip-path 0.28s ease-out',
          }}
        >
          {shown.map((n) => (
            <span key={n} className="block pb-[0.1em]">
              {n}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
