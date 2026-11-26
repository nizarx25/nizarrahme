'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRight } from 'lucide-react'
import { useNavigation } from '@/store/navigation'
import type { PublicDomain } from '@/hooks/use-domain-data'

type Props = {
  domain: PublicDomain
  index: number
}

/**
 * One line of the editorial domain index. Hovering draws a green line under
 * the row, slides the name across and shows a small card that follows the
 * cursor.
 */
export function DomainIndexRow({ domain, index }: Props) {
  const nav = useNavigation()
  const price =
    domain.showPrice && domain.price ? `$${domain.price.toLocaleString()}` : 'Make an Offer'
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null)
  const raf = useRef(0)

  return (
    <button
      type="button"
      onClick={() => nav.setSelectedDomain(domain.slug)}
      onPointerMove={(e) => {
        if (e.pointerType === 'touch') return
        const x = e.clientX
        const y = e.clientY
        cancelAnimationFrame(raf.current)
        raf.current = requestAnimationFrame(() => setTip({ x, y }))
      }}
      onPointerLeave={() => {
        cancelAnimationFrame(raf.current)
        setTip(null)
      }}
      aria-label={`View ${domain.name} | ${domain.extension} | ${domain.category} | ${price}`}
      className="group relative grid w-full grid-cols-[auto_1fr_auto] sm:grid-cols-[56px_1fr_140px_150px] items-center gap-4 sm:gap-6 border-t border-surface-border px-1 py-5 sm:py-7 text-left last:border-b"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-px left-0 h-[2px] w-full origin-left scale-x-0 bg-[#0E6B42] transition-transform duration-700 ease-[cubic-bezier(.77,0,.18,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
      <span className="relative text-xs tracking-[0.1em] text-[var(--ed-mute)] transition-colors duration-300 group-hover:text-[#0E6B42]">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="relative min-w-0 break-words font-display text-xl sm:text-4xl lg:text-5xl leading-tight text-white transition-all duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:translate-x-4 group-hover:!text-[#0E6B42]">
        {domain.name}
      </span>
      <span className="relative hidden sm:block text-xs uppercase tracking-[0.18em] text-[var(--ed-mute)] transition-colors duration-300 group-hover:text-[#0B0B0A]">
        {domain.category}
      </span>
      <span className="relative flex items-center justify-end gap-2 text-base sm:text-lg text-white">
        {price}
        <ArrowUpRight className="size-4 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-[#0E6B42]" />
      </span>
      {tip &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            aria-hidden="true"
            className="pointer-events-none fixed z-[80] w-56 rounded-2xl border border-[#0E6B42] bg-[#FFFDF8] p-4 shadow-[0_18px_40px_rgba(27,26,23,0.18)]"
            style={{ left: tip.x + 24, top: tip.y + 20, animation: 'edChatIn .25s ease-out both' }}
          >
            <p className="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-[#45413A]">
              {domain.extension} &middot; {domain.category}
            </p>
            <p className="mt-1 font-display text-xl font-semibold text-[#0B0B0A] break-words">
              {domain.name}
            </p>
            <p className="mt-2 text-sm font-semibold text-[#0E6B42]">{price}</p>
          </div>,
          document.body,
        )}
    </button>
  )
}
