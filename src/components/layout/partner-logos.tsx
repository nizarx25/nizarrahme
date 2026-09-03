'use client'

import { motion } from 'framer-motion'

const PARTNERS = [
  { name: 'Atom', slug: 'atom' },
  { name: 'Afternic', slug: 'afternic' },
  { name: 'Sedo', slug: 'sedo' },
  { name: 'Unstoppable Domains', slug: 'unstoppabledomains' },
  { name: 'NameMaxi', slug: 'namemaxi' },
  { name: 'Brandpa', slug: 'brandpa' },
  { name: 'Saw', slug: 'saw' },
  { name: 'Namebio', slug: 'namebio' },
  { name: 'DotDB', slug: 'dotdb' },
]

export function PartnerLogos() {
  return (
    <section className="py-12 surface-border-t relative">
      <div className="absolute inset-0 bg-gradient-to-b from-surface/30 to-background/50" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-mono-accent text-[#718581] uppercase tracking-[0.2em] mb-8">
          Listed On Trusted Marketplaces
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
          {PARTNERS.map((partner) => (
            <motion.div
              key={partner.slug}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="opacity-70 hover:opacity-100 transition-all duration-300 cursor-default"
            >
              <span className="font-display text-sm sm:text-base font-bold bg-gradient-to-r from-teal to-teal-soft bg-clip-text text-transparent tracking-wide whitespace-nowrap">
                {partner.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}