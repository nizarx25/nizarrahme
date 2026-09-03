'use client'

import { CircleDot } from 'lucide-react'
import { useTransactions } from '@/hooks/use-domain-data'

export function ClaimedTicker() {
  const { data: transactions } = useTransactions()

  if (!transactions || transactions.transactions.length === 0) return null

  const items = transactions.transactions.map((tx) => ({
    domain: tx.domain,
    label: tx.status === 'Sold' ? 'SOLD' : 'CLAIMED',
  }))

  const doubled = [...items, ...items]

  return (
    <div className="relative overflow-hidden py-4 bg-[#0B211E]/50 surface-border-y" aria-label="Recent domain activity" role="marquee" aria-roledescription="scrolling ticker">
      <div className="animate-ticker flex gap-8 whitespace-nowrap w-max" aria-hidden="true">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0">
            <CircleDot className="size-3 text-teal" />
            <span className="font-display text-sm font-bold text-[#B8C8C4]">{item.domain}</span>
            <span className="text-xs font-mono-accent text-coral tracking-wider">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}