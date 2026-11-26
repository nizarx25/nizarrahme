'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigation } from '@/store/navigation'
import { useDomainDetail } from '@/hooks/use-domain-data'

const ARABIC = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/
const spring = { type: 'spring', stiffness: 260, damping: 20 } as const

/** Types the text out; Arabic fades in word by word so letters stay joined. */
function TypeText({ text, className }: { text: string; className?: string }) {
  const arabic = ARABIC.test(text)
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setN(Infinity)
      return
    }
    const units = arabic ? text.split(/(\s+)/) : Array.from(text)
    let i = 0
    const t = window.setTimeout(function tick() {
      i++
      setN(i)
      if (i < units.length) window.setTimeout(tick, arabic ? 90 : 28)
    }, 650)
    return () => window.clearTimeout(t)
  }, [text, arabic])
  if (arabic) {
    const parts = text.split(/(\s+)/)
    return (
      <p className={className}>
        {parts.map((w, i) => (
          <span key={i} className="transition-opacity duration-500" style={{ opacity: i < n ? 1 : 0 }}>
            {w}
          </span>
        ))}
      </p>
    )
  }
  const chars = Array.from(text)
  const shown = chars.slice(0, n).join('')
  return (
    <p className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={n < chars.length ? 'ed-caret' : ''}>
        {shown}
      </span>
    </p>
  )
}

export function DomainDetailModal() {
  const nav = useNavigation()
  const { data, isLoading } = useDomainDetail(nav.selectedDomain)
  const open = !!nav.selectedDomain
  const handleClose = useCallback(() => nav.setSelectedDomain(null), [nav])
  const handleOffer = () => {
    if (data?.domain) {
      nav.setOfferDomainName(data.domain.name)
      nav.setSelectedDomain(null)
      nav.setShowOfferForm(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="ed-box grid-cols-[minmax(0,1fr)] overflow-x-hidden sm:max-w-2xl max-h-[90dvh] overflow-y-auto bg-[#0B211E] border-surface-border rounded-2xl p-4 sm:p-6">
        {isLoading ? (
          <div className="py-4 sm:py-8 space-y-3 sm:space-y-4">
            <Skeleton className="h-8 w-48 bg-surface-border/50" />
            <Skeleton className="h-3 w-32 bg-surface-border/30" />
            <Skeleton className="h-16 w-full bg-surface-border/30" />
            <Skeleton className="h-24 w-full bg-surface-border/30" />
          </div>
        ) : data?.domain ? (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <Badge className="bg-elevated text-[#718581] border-surface-border text-[10px] sm:text-xs font-mono-accent rounded-full px-2 sm:px-3 py-0">
                  {data.domain.extension}
                </Badge>
                <Badge className="bg-coral/10 text-coral border-coral/20 text-[10px] sm:text-xs font-mono-accent rounded-full px-2 sm:px-3 py-0">
                  {data.domain.category}
                </Badge>
                {data.domain.featured && (
                  <Badge className="bg-teal/10 text-teal border-teal/20 text-[10px] sm:text-xs font-mono-accent rounded-full px-2 sm:px-3 py-0">
                    Featured
                  </Badge>
                )}
              </div>
              <DialogTitle className="font-display text-xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight pr-8">
                {data.domain.name}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Details for {data.domain.name}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-3 sm:mt-6 min-w-0 space-y-3 sm:space-y-5">
              <div className="flex items-center gap-3 sm:gap-4">
                {data.domain.showPrice && data.domain.price && (
                  <p className="font-display text-2xl sm:text-3xl font-bold text-teal">
                    ${data.domain.price.toLocaleString()}
                  </p>
                )}
                <Badge variant="outline" className="border-coral/40 text-xs sm:text-sm font-mono-accent rounded-full">
                  <span className="ed-offer-label font-semibold">{data.domain.saleType}</span>
                </Badge>
              </div>
              {data.domain.shortDescription && (
                <TypeText
                  text={data.domain.shortDescription}
                  className="text-sm text-[#B8C8C4] leading-relaxed"
                />
              )}
              {data.domain.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {data.domain.tags.map((tag, i) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ ...spring, delay: 0.9 + i * 0.09 }}
                      whileHover={{ y: -2, scale: 1.06 }}
                    >
                      <Badge
                        variant="secondary"
                        className="text-[10px] sm:text-xs font-mono-accent bg-elevated text-[#B8C8C4] rounded-full px-2 sm:px-3 py-0"
                      >
                        {tag}
                      </Badge>
                    </motion.span>
                  ))}
                </div>
              )}
              {data.domain.useCases.length > 0 && (
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-white mb-2 sm:mb-3">
                    Potential use cases
                  </h4>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {data.domain.useCases.map((uc, i) => (
                      <motion.li
                        key={uc}
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...spring, delay: 1.2 + i * 0.1 }}
                        className="flex items-start gap-2 text-xs sm:text-sm text-[#B8C8C4]"
                      >
                        <motion.span
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ ...spring, delay: 1.35 + i * 0.1 }}
                          className="mt-0.5 shrink-0"
                        >
                          <CheckCircle2 className="size-3.5 sm:size-4 text-teal" />
                        </motion.span>
                        {uc}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
              {data.domain.publicNotes && (
                <div className="p-3 sm:p-4 bg-elevated rounded-xl border border-surface-border">
                  <p className="text-xs sm:text-sm text-[#B8C8C4]">
                    {data.domain.publicNotes}
                  </p>
                </div>
              )}
              <div className="flex justify-end">
                <motion.button
                  type="button"
                  onClick={handleOffer}
                  aria-label="Make an Offer"
                  title="Make an Offer"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...spring, delay: 1.4 }}
                  whileHover={{ scale: 1.12, rotate: -6 }}
                  whileTap={{ scale: 0.92 }}
                  className="ed-offer-btn grid size-14 place-items-center rounded-full bg-coral text-white hover:bg-coral-hover"
                >
                  <ArrowRight className="size-6" />
                </motion.button>
              </div>
              {data.relatedDomains.length > 0 && (
                <div>
                  <Separator className="bg-surface-border mb-3 sm:mb-6" />
                  <h4 className="text-xs sm:text-sm font-medium text-white mb-3">Related domains</h4>
                  <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                    {data.relatedDomains.map((rd, i) => (
                      <motion.button
                        key={rd.id}
                        onClick={() => nav.setSelectedDomain(rd.slug)}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...spring, delay: 1.5 + i * 0.1 }}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        className="shrink-0 surface-border rounded-xl p-3 sm:p-4 hover:border-teal/50 hover:shadow-[0_8px_24px_rgba(0,229,176,0.12)] transition-colors text-left min-w-[140px] sm:min-w-[180px] bg-surface"
                      >
                        <p className="font-display text-xs sm:text-sm font-bold text-white truncate">
                          {rd.name}
                        </p>
                        <p className="text-[10px] sm:text-xs font-mono-accent text-[#718581] mt-1">
                          {rd.category}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}