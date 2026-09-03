'use client'

import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  ArrowRight,
  Crosshair,
  Send,
  Rocket,
  ShoppingCart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useNavigation } from '@/store/navigation'
import { useFeaturedDomains, useStats, useTransactions } from '@/hooks/use-domain-data'
import { FeaturedCarousel } from '@/components/home/featured-carousel'
import { ClaimedTicker } from '@/components/home/claimed-ticker'
import { DomainCard } from '@/components/domain/domain-card'
import { WholesaleSection } from './wholesale-section'

import type { Variants } from 'framer-motion'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.08 } },
}

export function HomeSection() {
  const { data: featured } = useFeaturedDomains()
  const { data: stats } = useStats()
  const { data: transactions } = useTransactions()
  const nav = useNavigation()
  const [heroSearch, setHeroSearch] = useState('')

  const handleHeroSearch = (e: FormEvent) => {
    e.preventDefault()
    if (heroSearch.trim()) {
      nav.setSection('domains')
      setTimeout(() => {
        const searchInput = document.querySelector<HTMLInputElement>('input[aria-label="Search domains"]')
        if (searchInput) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
          nativeInputValueSetter?.call(searchInput, heroSearch)
          searchInput.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }, 100)
    }
  }

  const carouselDomains = featured?.slice(0, 6) || []

  return (
    <div>
      {/* HERO */}
      <section className="relative py-20 sm:py-28 lg:py-36 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal/5 rounded-full blur-[120px] animate-pulse-glow pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-coral/3 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center max-w-4xl mx-auto">
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-muted border border-teal/10 text-xs font-mono-accent text-teal tracking-[0.2em] uppercase">
                <Crosshair className="size-3" />
                Premium Digital Real Estate
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.08] tracking-tight text-white"
            >
              Own the Name Behind{' '}
              <span className="bg-gradient-to-r from-teal via-teal-soft via-coral/80 to-teal bg-clip-text text-transparent teal-text-glow animate-gradient-text">
                What&rsquo;s Next.
              </span>
            </motion.h1>
            <p className="sr-only">
              NIZAR RAHME&rsquo;s curated marketplace of premium brandable domain names for AI, SaaS, fintech, and technology businesses.
            </p>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-base sm:text-lg text-[#B8C8C4] max-w-2xl mx-auto leading-relaxed"
            >
              Curated, brandable domain names for AI, SaaS, fintech, and technology businesses.
              Each name selected for real-world impact.
            </motion.p>

            <motion.form variants={fadeUp} onSubmit={handleHeroSearch} className="mt-10 max-w-xl mx-auto">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[#718581] group-focus-within:text-teal transition-colors" />
                <Input
                  placeholder="Search premium domains..."
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="w-full h-14 pl-12 pr-28 bg-surface border-surface-border rounded-[14px] text-white placeholder:text-[#718581] text-base focus:border-teal/40 focus:ring-teal/20 transition-all"
                  aria-label="Search domains from hero"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 bg-coral hover:bg-coral-hover text-white rounded-[10px] font-medium transition-all hover:shadow-[0_0_20px_rgba(255,77,46,0.3)]"
                >
                  Search
                </Button>
              </div>
            </motion.form>

            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap justify-center gap-2">
              {['AI', 'SaaS', 'Fintech', 'Tech', 'Brandable'].map((cat) => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => nav.setSection('domains')}
                  className="px-3 py-1.5 text-xs font-mono-accent text-[#718581] hover:text-teal border border-surface-border hover:border-teal/30 rounded-full transition-all hover:shadow-[0_0_10px_rgba(0,229,176,0.1)]"
                >
                  {cat}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>

          {/* Featured Domain Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 sm:mt-20"
          >
            {featured && featured.length > 0 ? (
              <FeaturedCarousel domains={carouselDomains} />
            ) : (
              <div className="max-w-2xl mx-auto p-8 sm:p-10 surface-border rounded-2xl bg-surface/80">
                <Skeleton className="h-12 w-64 bg-surface-border/50" />
                <Skeleton className="h-4 w-40 bg-surface-border/30 mt-4" />
                <Skeleton className="h-4 w-56 bg-surface-border/30 mt-2" />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* CLAIMED DOMAINS TICKER */}
      <ClaimedTicker />

      {/* TRUST STRIP */}
      <section className="py-8 surface-border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {stats ? (
            <div className="flex flex-wrap justify-center gap-10 sm:gap-16">
              <motion.div className="text-center cursor-default" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                <p className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-br from-teal to-teal-soft bg-clip-text text-transparent transition-all duration-300">
                  {stats.totalDomains}+
                </p>
                <p className="text-xs font-mono-accent text-teal/70 uppercase tracking-[0.15em] mt-2 transition-colors">Domains</p>
              </motion.div>
              <motion.div className="text-center cursor-default" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                <p className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-br from-coral to-coral-hover bg-clip-text text-transparent transition-all duration-300">
                  {stats.atomListed}
                </p>
                <p className="text-xs font-mono-accent text-coral/60 uppercase tracking-[0.15em] mt-2 transition-colors">
                  Listed on Atom
                </p>
              </motion.div>
              <motion.div className="text-center cursor-default" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                <p className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-br from-teal-soft to-teal bg-clip-text text-transparent transition-all duration-300">2023</p>
                <p className="text-xs font-mono-accent text-teal-soft/60 uppercase tracking-[0.15em] mt-2 transition-colors">
                  Investing Since
                </p>
              </motion.div>
              <motion.div className="text-center group cursor-default" whileHover={{ y: -2 }}>
                <p className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-r from-teal to-teal-soft bg-clip-text text-transparent">2</p>
                <p className="text-xs font-mono-accent text-[#718581] uppercase tracking-[0.15em] mt-2">
                  Completed Sales
                </p>
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-10 sm:gap-16">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-10 w-16 mx-auto bg-surface-border/50" />
                  <Skeleton className="h-3 w-20 mt-3 mx-auto bg-surface-border/30" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED DOMAINS - PREMIUM */}
      <section className="py-16 sm:py-24 relative">
        <div className="absolute inset-0 grid-pattern-subtle pointer-events-none opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-3">
                Curated Selection
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">
                <span className="bg-gradient-to-r from-teal via-teal-soft to-coral bg-clip-text text-transparent animate-gradient-text">
                  Premium Domains
                </span>
              </h2>
              <p className="text-[#718581] mt-3 max-w-md">
                Hand-picked brandable domain names for the next generation of digital businesses.
              </p>
            </div>
            <Button
              variant="ghost"
              className="hidden sm:inline-flex text-[#718581] hover:text-teal hover:bg-teal-muted rounded-[10px]"
              onClick={() => nav.setSection('domains')}
            >
              View all <ArrowRight className="size-4" />
            </Button>
          </div>

          {featured && featured.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              {featured.map((domain) => (
                <DomainCard key={domain.id} domain={domain} />
              ))}
            </motion.div>
          ) : featured ? (
            <p className="text-[#718581] text-center py-16 font-mono-accent">
              No featured domains at this time.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-56 bg-surface rounded-[16px]" />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button
              variant="outline"
              onClick={() => nav.setSection('domains')}
              className="w-full border-surface-border text-[#B8C8C4] hover:bg-elevated hover:text-white rounded-[12px]"
            >
              View All Domains <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* WHOLESALE PRICES SECTION */}
      <WholesaleSection />

      {/* HOW IT WORKS */}
      <section className="py-16 sm:py-24 bg-surface/50 relative">
        <div className="absolute inset-0 grid-pattern pointer-events-none opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-3">
              Simple Process
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-0 max-w-4xl mx-auto relative">
            <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-teal/30 via-teal/10 to-teal/30" />

            {[
              { num: '01', title: 'Discover', desc: 'Find the domain that fits your vision. Browse by category, extension, or keyword.', icon: Search, gradient: 'from-teal/20 to-teal/5' },
              { num: '02', title: 'Claim', desc: 'Secure your preferred digital identity. Submit an offer or start a conversation.', icon: Send, gradient: 'from-coral/20 to-coral/5' },
              { num: '03', title: 'Launch', desc: 'Build the brand around your new domain. Complete the transfer and go live.', icon: Rocket, gradient: 'from-teal-soft/20 to-teal/5' },
            ].map((step) => (
              <motion.div
                key={step.num}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.97 }}
                className="relative text-center px-6 py-4 group"
              >
                <motion.div
                  whileHover={{ scale: 1.12, rotate: 5 }}
                  whileTap={{ scale: 1.05 }}
                  className="relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-elevated border border-teal/30 shadow-[0_0_16px_rgba(0,229,176,0.1)] text-teal mb-6 transition-all duration-300"
                >
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.gradient} opacity-100 transition-opacity duration-300`} />
                  <step.icon className="size-6 relative z-10" />
                </motion.div>
                <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-2 transition-colors">
                  Step {step.num}
                </p>
                <h3 className="font-display text-xl font-bold mb-3 bg-gradient-to-r from-teal to-teal-soft bg-clip-text text-transparent transition-all duration-300">{step.title}</h3>
                <p className="text-sm text-[#B8C8C4] leading-relaxed max-w-xs mx-auto transition-colors">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SELECTED TRANSACTIONS */}
      {transactions && transactions.transactions.length > 0 && (
        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-3">
              Track Record
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-12">Selected Transactions</h2>
            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
              {transactions.transactions.map((tx) => (
                <motion.div
                  key={tx.domain}
                  whileHover={{ y: -2 }}
                  className="surface-border rounded-[16px] bg-surface p-6 flex flex-col justify-between domain-card-hover"
                >
                  <div>
                    <p className="font-display text-xl font-bold text-white">{tx.domain}</p>
                    <Badge className="mt-2 bg-teal-muted text-teal border-teal/20 text-xs font-mono-accent rounded-full">
                      {tx.status}
                    </Badge>
                  </div>
                  <p className="font-display text-3xl font-bold text-teal mt-4">
                    ${tx.amount.toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-[#718581] mt-6 max-w-2xl font-mono-accent">
              These are selected completed transactions and do not represent a guarantee of future
              sale prices or outcomes.
            </p>
          </div>
        </section>
      )}

      {/* BEYOND THE NAME */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-surface/80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-3">
            Additional Services
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">Beyond the Name</h2>
          <p className="mt-4 text-[#B8C8C4] max-w-2xl mx-auto leading-relaxed">
            Alongside domain investing, I work on selected digital projects involving WordPress
            websites, content, social media, SEO, and AI-assisted workflows.
          </p>
          <Button
            onClick={() => nav.setSection('services')}
            variant="outline"
            className="mt-8 border-surface-border text-[#B8C8C4] hover:bg-elevated hover:text-white hover:border-teal/20 rounded-[12px] transition-all"
          >
            Explore Services <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-coral/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold">
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">Your next brand deserves the right domain.</span>
          </h2>
          <p className="mt-4 text-[#B8C8C4] max-w-2xl mx-auto leading-relaxed">
            If you are building an AI, SaaS, fintech, technology, or online business, browse the
            catalog or start a conversation.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => nav.setSection('domains')}
                className="bg-gradient-to-r from-coral to-coral-hover text-white rounded-[12px] h-12 px-8 font-medium transition-all hover:shadow-[0_0_36px_rgba(255,77,46,0.4)] hover:brightness-110"
              >
                <ShoppingCart className="size-4 mr-2" />
                Explore Premium Domains <ArrowRight className="size-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => nav.setSection('contact')}
                variant="outline"
                className="border-surface-border text-[#B8C8C4] hover:bg-elevated hover:text-white hover:border-teal/20 hover:shadow-[0_0_16px_rgba(0,229,176,0.08)] rounded-[12px] h-12 px-8 transition-all"
              >
                Contact NIZAR RAHME
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}