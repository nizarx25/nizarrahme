'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Crown, Shield, Tag, TrendingUp, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useNavigation } from '@/store/navigation'
import { WHOLESALE_DOMAINS } from '@/lib/wholesale'

export function WholesaleSection() {
  const nav = useNavigation()

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#061312] via-[#0B211E] to-[#061312]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-coral/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-coral/10 border border-coral/20 text-xs font-mono-accent text-coral tracking-[0.2em] uppercase mb-6"
          >
            <Tag className="size-3" />
            Exclusive Deals
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold"
          >
            <span className="bg-gradient-to-r from-coral via-[#FF8C42] to-coral bg-clip-text text-transparent animate-gradient-text">
              Wholesale Prices
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-[#B8C8C4] max-w-2xl mx-auto leading-relaxed text-lg"
          >
            Premium domains at wholesale rates. First come, first served.
          </motion.p>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-8 sm:gap-16 mb-12"
        >
          {[
            { icon: Zap, label: 'Below Market', color: 'text-coral', glow: 'group-hover:shadow-[0_0_16px_rgba(255,77,46,0.2)]' },
            { icon: Crown, label: 'Premium Quality', color: 'text-teal', glow: 'group-hover:shadow-[0_0_16px_rgba(0,229,176,0.2)]' },
            { icon: Shield, label: 'Secure Transfer', color: 'text-[#B8C8C4]', glow: 'group-hover:shadow-[0_0_16px_rgba(184,200,196,0.15)]' },
            { icon: TrendingUp, label: 'High ROI', color: 'text-coral', glow: 'group-hover:shadow-[0_0_16px_rgba(255,77,46,0.2)]' },
          ].map((item) => (
            <motion.div
              key={item.label}
              whileHover={{ y: -3 }}
              className={`text-center group cursor-default transition-all duration-300 ${item.glow}`}
            >
              <item.icon className={`size-6 ${item.color} mx-auto mb-2 transition-all duration-300 group-hover:scale-110`} />
              <p className="text-sm font-mono-accent text-[#718581] group-hover:text-[#B8C8C4] transition-colors">
                {item.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Wholesale domain cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto"
        >
          {WHOLESALE_DOMAINS.map((domain) => (
            <motion.div
              key={domain.name}
              whileHover={{ y: -4 }}
              className="group surface-border rounded-2xl bg-surface/80 backdrop-blur-sm p-5 sm:p-6 cursor-pointer transition-all duration-300 hover:border-coral/30 hover:shadow-[0_0_30px_rgba(255,77,46,0.08)]"
              onClick={() => nav.setSelectedDomain(domain.slug)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  nav.setSelectedDomain(domain.slug)
                }
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <Badge className="bg-coral/10 text-coral border-coral/20 text-xs font-mono-accent rounded-full px-2.5 mb-2">
                    {domain.extension}
                  </Badge>
                  <h3 className="font-display text-lg font-bold text-white truncate group-hover:text-coral transition-colors">
                    {domain.name}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-[#718581] line-through">${domain.originalPrice.toLocaleString()}</p>
                  <p className="text-xl font-bold text-coral">${domain.wholesalePrice}</p>
                </div>
              </div>
              <p className="text-sm text-[#718581] leading-relaxed line-clamp-2">
                {domain.description}
              </p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-border">
                <span className="text-xs font-mono-accent text-teal">{domain.category}</span>
                <span className="text-xs text-[#718581] group-hover:text-coral transition-colors flex items-center gap-1">
                  Make Offer <ArrowRight className="size-3" />
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}