'use client'

import { ArrowUpRight } from 'lucide-react'
import { useNavigation } from '@/store/navigation'
import type { PublicDomain } from '@/hooks/use-domain-data'

type Props = {
  domain: PublicDomain
  index: number
}

/**
 * One line of the editorial domain index. Hovering floods the row with
 * green from the bottom and slides the name across.
 */
export function DomainIndexRow({ domain, index }: Props) {
  const nav = useNavigation()
  const price =
    domain.showPrice && domain.price ? `$${domain.price.toLocaleString()}` : 'Make an Offer'

  return (
    <button
      type="button"
      onClick={() => nav.setSelectedDomain(domain.slug)}
      aria-label={`View ${domain.name} | ${domain.extension} | ${domain.category} | ${price}`}
      className="group relative grid w-full grid-cols-[auto_1fr_auto] sm:grid-cols-[56px_1fr_140px_150px] items-center gap-4 sm:gap-6 overflow-hidden border-t border-surface-border px-1 py-5 sm:py-7 text-left last:border-b"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-0 translate-y-full bg-teal transition-transform duration-500 ease-[cubic-bezier(.77,0,.18,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0"
      />
      <span className="relative text-xs tracking-[0.1em] text-[var(--ed-mute)] transition-colors duration-300 group-hover:text-[#cfe3d8]">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="relative min-w-0 break-words font-display text-xl sm:text-4xl lg:text-5xl leading-tight text-white transition-all duration-500 group-hover:translate-x-3 group-hover:!text-[#F6F1E8]">
        {domain.name}
      </span>
      <span className="relative hidden sm:block text-xs uppercase tracking-[0.18em] text-[var(--ed-mute)] transition-colors duration-300 group-hover:text-[#cfe3d8]">
        {domain.category}
      </span>
      <span className="relative flex items-center justify-end gap-2 text-base sm:text-lg text-white transition-colors duration-300 group-hover:!text-[#F6F1E8]">
        {price}
        <ArrowUpRight className="size-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
      </span>
    </button>
  )
}
