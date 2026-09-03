'use client'

import { useCallback } from 'react'
import { ArrowRight, CheckCircle2, ShoppingCart } from 'lucide-react'
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
      <DialogContent className="sm:max-w-2xl max-h-[90dvh] overflow-y-auto bg-[#0B211E] border-surface-border rounded-2xl p-4 sm:p-6">
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
            <div className="mt-3 sm:mt-6 space-y-3 sm:space-y-5">
              <div className="flex items-center gap-3 sm:gap-4">
                {data.domain.showPrice && data.domain.price && (
                  <p className="font-display text-2xl sm:text-3xl font-bold text-teal">
                    ${data.domain.price.toLocaleString()}
                  </p>
                )}
                <Badge variant="outline" className="border-surface-border text-[#718581] text-xs sm:text-sm font-mono-accent rounded-full">
                  {data.domain.saleType}
                </Badge>
              </div>
              {data.domain.shortDescription && (
                <p className="text-sm text-[#B8C8C4] leading-relaxed">
                  {data.domain.shortDescription}
                </p>
              )}
              {data.domain.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {data.domain.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[10px] sm:text-xs font-mono-accent bg-elevated text-[#B8C8C4] rounded-full px-2 sm:px-3 py-0"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              {data.domain.useCases.length > 0 && (
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-white mb-2 sm:mb-3">
                    Potential use cases
                  </h4>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {data.domain.useCases.map((uc) => (
                      <li
                        key={uc}
                        className="flex items-start gap-2 text-xs sm:text-sm text-[#B8C8C4]"
                      >
                        <CheckCircle2 className="size-3.5 sm:size-4 text-teal mt-0.5 shrink-0" />
                        {uc}
                      </li>
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
              <Button
                onClick={handleOffer}
                className="w-full bg-coral hover:bg-coral-hover text-white h-11 sm:h-12 rounded-[12px] font-medium transition-all hover:shadow-[0_0_20px_rgba(255,77,46,0.3)] text-sm sm:text-base"
              >
                <ShoppingCart className="size-4 mr-2" /> Make an Offer <ArrowRight className="size-4" />
              </Button>
              {data.relatedDomains.length > 0 && (
                <div>
                  <Separator className="bg-surface-border mb-3 sm:mb-6" />
                  <h4 className="text-xs sm:text-sm font-medium text-white mb-3">Related domains</h4>
                  <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                    {data.relatedDomains.map((rd) => (
                      <button
                        key={rd.id}
                        onClick={() => nav.setSelectedDomain(rd.slug)}
                        className="shrink-0 surface-border rounded-xl p-3 sm:p-4 hover:border-teal/30 transition-colors text-left min-w-[140px] sm:min-w-[180px] bg-surface"
                      >
                        <p className="font-display text-xs sm:text-sm font-bold text-white truncate">
                          {rd.name}
                        </p>
                        <p className="text-[10px] sm:text-xs font-mono-accent text-[#718581] mt-1">
                          {rd.category}
                        </p>
                      </button>
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