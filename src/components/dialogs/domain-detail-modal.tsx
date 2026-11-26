'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, SendHorizontal } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigation } from '@/store/navigation'
import { useDomainDetail } from '@/hooks/use-domain-data'

function Typing() {
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl rounded-tl-sm bg-[#EFE8DA] px-4 py-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block size-1.5 rounded-full bg-[#45413A]"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

function Bubble({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      style={{ transformOrigin: 'left top' }}
      className="max-w-[88%] rounded-2xl rounded-tl-sm bg-[#EFE8DA] px-4 py-3 text-sm text-[#0B0B0A] shadow-sm"
    >
      {children}
    </motion.div>
  )
}

/**
 * Domain detail, styled as a chat panel: the facts arrive as messages and
 * the bottom bar opens the existing offer form.
 */
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

  const d = data?.domain
  const id = d?.id
  const [step, setStep] = useState(0)
  useEffect(() => {
    setStep(0)
    if (!id) return
    const t = [450, 1100, 1750, 2400].map((ms, i) => window.setTimeout(() => setStep(i + 1), ms))
    return () => t.forEach(window.clearTimeout)
  }, [id])

  const hasMore = !!d && (d.tags.length > 0 || d.useCases.length > 0 || !!d.publicNotes)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        showCloseButton
        className="ed-chat-in sm:max-w-md !gap-0 overflow-hidden border-surface-border bg-[#FFFDF8] !p-0 max-sm:!inset-x-0 max-sm:!bottom-0 max-sm:!top-auto max-sm:!max-w-none max-sm:!translate-x-0 max-sm:!translate-y-0 max-sm:rounded-b-none sm:!left-auto sm:!right-6 sm:!bottom-6 sm:!top-auto sm:!translate-x-0 sm:!translate-y-0 rounded-3xl shadow-[0_30px_80px_rgba(27,26,23,0.28)] [&>[data-slot=dialog-close]]:text-[#F6F1E8] [&>[data-slot=dialog-close]]:opacity-90"
      >
        {isLoading || !d ? (
          <div className="p-6 space-y-3">
            <DialogTitle className="sr-only">Loading domain</DialogTitle>
            <DialogDescription className="sr-only">Loading domain details</DialogDescription>
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 bg-[#1F4D3A] px-5 py-4 pr-12 text-[#F6F1E8]">
              <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#F6F1E8] font-display text-lg font-semibold text-[#1F4D3A]">
                {d.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <DialogTitle className="truncate font-display text-lg font-semibold !text-[#F6F1E8] leading-tight">
                  {d.name}
                </DialogTitle>
                <DialogDescription className="text-xs !text-[#cfe3d8]">
                  {d.saleType} &middot; {d.category}
                </DialogDescription>
              </div>
            </div>

            <div className="max-h-[56dvh] space-y-3 overflow-y-auto bg-[#F6F1E8] px-4 py-5">
              <Bubble>
                <span className="font-mono-accent text-xs">{d.extension}</span> &middot; {d.category}
                {d.featured && <span className="ml-2 rounded-full bg-[#1F4D3A] px-2 py-0.5 text-[10px] text-[#F6F1E8]">Featured</span>}
              </Bubble>

              {step < 1 ? (
                <Typing />
              ) : (
                <Bubble>
                  {d.showPrice && d.price ? (
                    <span className="font-display text-2xl font-semibold text-[#0E6B42]">${d.price.toLocaleString()}</span>
                  ) : (
                    <span className="font-semibold">Make an Offer</span>
                  )}
                  {d.showPrice && d.price && <span className="ml-2 text-xs text-[#45413A]">{d.saleType}</span>}
                </Bubble>
              )}

              {d.shortDescription &&
                (step < 2 ? step >= 1 && <Typing /> : <Bubble>{d.shortDescription}</Bubble>)}

              {hasMore &&
                (step < 3 ? (
                  step >= 2 && <Typing />
                ) : (
                  <Bubble>
                    {d.tags.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {d.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-[#FFFDF8] px-2 py-0.5 font-mono-accent text-[11px]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {d.useCases.length > 0 && (
                      <>
                        <p className="mb-1 text-xs font-semibold">Potential use cases</p>
                        <ul className="space-y-1">
                          {d.useCases.map((uc) => (
                            <li key={uc} className="flex items-start gap-2 text-[13px]">
                              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#0E6B42]" />
                              {uc}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {d.publicNotes && <p className="mt-2 text-[13px]">{d.publicNotes}</p>}
                  </Bubble>
                ))}

              {step >= 4 && data.relatedDomains.length > 0 && (
                <Bubble>
                  <p className="mb-2 text-xs font-semibold">Related domains</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.relatedDomains.map((rd) => (
                      <button
                        key={rd.id}
                        onClick={() => nav.setSelectedDomain(rd.slug)}
                        className="rounded-full border border-[#1F4D3A]/40 bg-[#FFFDF8] px-3 py-1 text-xs font-medium hover:bg-[#1F4D3A] hover:!text-[#F6F1E8]"
                      >
                        {rd.name}
                      </button>
                    ))}
                  </div>
                </Bubble>
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-surface-border bg-[#FFFDF8] p-3">
              <button
                type="button"
                onClick={handleOffer}
                className="flex-1 rounded-full border border-surface-border bg-[#F6F1E8] px-4 py-3 text-left text-sm text-[#45413A] transition-colors hover:border-[#0E6B42]"
              >
                Make an Offer
              </button>
              <button
                type="button"
                onClick={handleOffer}
                aria-label="Make an Offer"
                className="grid size-11 place-items-center rounded-full bg-[#1F4D3A] text-[#F6F1E8] transition-transform hover:scale-110 active:scale-95"
              >
                <SendHorizontal className="size-5" />
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
