'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useNavigation } from '@/store/navigation'
import type { PublicDomain } from '@/hooks/use-domain-data'

type Props = {
  domains: PublicDomain[]
}

export function FeaturedCarousel({ domains }: Props) {
  const [current, setCurrent] = useState(0)
  const nav = useNavigation()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % domains.length)
    }, 4000)
  }, [domains.length])

  useEffect(() => {
    startAutoplay()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [startAutoplay])

  if (domains.length === 0) return null
  const domain = domains[current]

  return (
    <div className="relative max-w-2xl mx-auto" role="region" aria-roledescription="carousel" aria-label="Featured domain carousel">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Showing domain {current + 1} of {domains.length}: {domain.name}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={domain.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="relative surface-border rounded-2xl bg-surface/80 backdrop-blur-sm p-8 sm:p-10 cursor-pointer group domain-card-hover overflow-hidden"
          onClick={() => nav.setSelectedDomain(domain.slug)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              nav.setSelectedDomain(domain.slug)
            }
          }}
          whileTap={{ scale: 0.98 }}
          aria-label={`View details for ${domain.name}`}
        >
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-teal/0 via-transparent to-coral/0 group-hover:from-teal/15 group-hover:via-transparent group-hover:to-coral/15 transition-all duration-500 -z-10 opacity-0 group-hover:opacity-100" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal/0 to-transparent group-hover:via-teal/40 transition-all duration-500" />

          <div className="absolute top-5 right-5 flex gap-2">
            <Badge className="bg-teal/10 text-teal border-teal/20 text-xs font-mono-accent rounded-full px-3">
              {domain.extension}
            </Badge>
            <Badge className="bg-coral/10 text-coral border-coral/20 text-xs font-mono-accent rounded-full px-3">
              {domain.category}
            </Badge>
          </div>

          <p className="text-xs font-mono-accent text-[#718581] uppercase tracking-[0.2em] mb-4">
            Featured Domain
          </p>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-teal via-teal-soft to-coral bg-clip-text text-transparent teal-text-glow hover:shadow-[0_0_30px_rgba(0,229,176,0.3)] transition-all duration-300 leading-tight">
            {domain.name}
          </h2>

          {domain.shortDescription && (
            <p className="mt-4 text-sm text-[#718581] max-w-md leading-relaxed">
              {domain.shortDescription}
            </p>
          )}

          <div className="mt-6 flex items-center gap-4">
            {domain.showPrice && domain.price && (
              <p className="font-display text-2xl font-bold text-teal">
                ${domain.price.toLocaleString()}
              </p>
            )}
            <Badge variant="outline" className="border-surface-border text-[#718581] text-xs font-mono-accent rounded-full">
              {domain.status}
            </Badge>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-[#718581] group-hover:text-teal transition-colors">
            <span className="font-medium">View details</span>
            <ArrowRight className="size-4" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-6">
        {domains.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation()
              setCurrent(i)
              startAutoplay()
            }}
            aria-label={`Go to domain ${i + 1}`}
            className={`transition-all rounded-full ${
              i === current
                ? 'w-6 h-2 bg-teal shadow-[0_0_8px_rgba(0,229,176,0.5)]'
                : 'w-2 h-2 bg-surface-border hover:bg-[#718581]'
            }`}
          />
        ))}
      </div>

      {/* Arrow buttons */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setCurrent((prev) => (prev - 1 + domains.length) % domains.length)
          startAutoplay()
        }}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-5 w-10 h-10 rounded-full bg-elevated border border-surface-border flex items-center justify-center text-[#718581] hover:text-teal hover:border-teal/30 transition-all opacity-0 sm:opacity-100 group-hover:opacity-100"
        aria-label="Previous domain"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setCurrent((prev) => (prev + 1) % domains.length)
          startAutoplay()
        }}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-5 w-10 h-10 rounded-full bg-elevated border border-surface-border flex items-center justify-center text-[#718581] hover:text-teal hover:border-teal/30 transition-all opacity-0 sm:opacity-100 group-hover:opacity-100"
        aria-label="Next domain"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  )
}