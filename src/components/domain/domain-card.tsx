'use client'

import { motion, type Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useNavigation } from '@/store/navigation'
import type { PublicDomain } from '@/hooks/use-domain-data'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

type Props = {
  domain: PublicDomain
}

export function DomainCard({ domain }: Props) {
  const nav = useNavigation()

  return (
    <motion.div variants={fadeUp} whileTap={{ scale: 0.98 }}>
      <div
        className="group cursor-pointer surface-border rounded-[16px] bg-surface p-5 sm:p-6 domain-card-hover relative overflow-hidden"
        onClick={() => nav.setSelectedDomain(domain.slug)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            nav.setSelectedDomain(domain.slug)
          }
        }}
        aria-label={`View ${domain.name} | ${domain.extension} | ${domain.category}${domain.showPrice && domain.price ? ` | $${domain.price.toLocaleString()}` : ''}`}
      >
        <div className="absolute -inset-[1px] rounded-[16px] bg-gradient-to-br from-teal/0 via-transparent to-coral/0 group-hover:from-teal/20 group-hover:via-transparent group-hover:to-coral/20 transition-all duration-500 -z-10 opacity-0 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal/8 via-transparent to-coral/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal/0 to-transparent group-hover:via-teal/60 transition-all duration-700" />

        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-elevated text-[#718581] border-surface-border text-xs font-mono-accent rounded-full px-2.5">
                  {domain.extension}
                </Badge>
                {domain.featured && (
                  <Badge className="bg-teal/10 text-teal border-teal/20 text-xs font-mono-accent rounded-full px-2.5">
                    Featured
                  </Badge>
                )}
                <Badge variant="outline" className="border-surface-border text-[#718581] text-xs font-mono-accent rounded-full px-2.5">
                  {domain.category}
                </Badge>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold leading-tight bg-gradient-to-r from-teal via-teal-soft to-coral bg-clip-text text-transparent transition-all duration-300">
                {domain.name}
              </h3>
            </div>
            {domain.showPrice && domain.price && (
              <p className="font-display text-lg font-bold text-teal whitespace-nowrap">
                ${domain.price.toLocaleString()}
              </p>
            )}
          </div>

          {domain.shortDescription && (
            <p className="mt-3 text-sm text-[#718581] line-clamp-2 leading-relaxed group-hover:text-[#B8C8C4] transition-colors">
              {domain.shortDescription}
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-surface-border/50 flex items-center justify-between">
            <span className="text-xs font-mono-accent text-[#718581]">{domain.saleType}</span>
            <motion.span
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs text-coral font-medium flex items-center gap-1 transition-opacity"
            >
              Make an Offer <ArrowRight className="size-3" />
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}