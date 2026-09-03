'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useTransactions } from '@/hooks/use-domain-data'

export function TransactionsSection() {
  const { data, isLoading } = useTransactions()
  return (
    <section className="py-12 sm:py-20" aria-labelledby="transactions-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-3">Track Record</p>
        <h1 id="transactions-heading" className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">Transactions</h1>
        <p className="text-[#718581] mb-10 leading-relaxed">
          A record of completed domain sales. These represent actual transactions, not appraisals or asking prices.
        </p>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 bg-surface rounded-[16px]" />
            <Skeleton className="h-32 bg-surface rounded-[16px]" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            {data.transactions.map((tx) => (
              <motion.div
                key={tx.domain}
                whileHover={{ y: -2 }}
                className="surface-border rounded-[16px] bg-surface p-6 sm:p-8 domain-card-hover"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white">{tx.domain}</h3>
                    <Badge className="mt-2 bg-teal-muted text-teal border-teal/20 text-xs font-mono-accent rounded-full">
                      {tx.status}
                    </Badge>
                  </div>
                  <p className="font-display text-3xl font-bold text-teal">${tx.amount.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}
        <div className="mt-8 p-4 bg-elevated rounded-xl border border-surface-border">
          <p className="text-xs font-mono-accent text-[#718581] leading-relaxed">
            These are selected completed transactions and do not represent a guarantee of future sale prices or outcomes. Domain values depend on many factors including market demand, buyer need, and negotiation.
          </p>
        </div>
      </div>
    </section>
  )
}