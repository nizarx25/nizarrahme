'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigation } from '@/store/navigation'
import { useToast } from '@/hooks/use-toast'
import { useState, useCallback, useEffect, useRef, type FormEvent } from 'react'
import { z } from 'zod/v4'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'

// Lucide icons
import {
  Search,
  Globe,
  Mail,
  ArrowRight,
  Menu,
  X,
  CheckCircle2,
  Send,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Handshake,
  FileText,
  BarChart3,
  Sparkles,
  Layers,
  Crosshair,
  CircleDot,
  Rocket,
} from 'lucide-react'

// ========================
// TYPES
// ========================

type PublicDomain = {
  id: string
  name: string
  slug: string
  extension: string
  category: string
  tags: string[]
  shortDescription: string
  useCases: string[]
  status: string
  featured: boolean
  price: number | null
  showPrice: boolean
  saleType: string
  publicNotes: string
  createdAt: string
  updatedAt: string
}

type Stats = {
  totalDomains: number
  featuredCount: number
  atomListed: number
  categories: string[]
  extensions: string[]
}

type SiteSettings = {
  contactEmail: string
  socialLinks: Record<string, string>
}

type Transaction = {
  domain: string
  status: string
  amount: number
}

// ========================
// DATA HOOKS (PRESERVED)
// ========================

function useFeaturedDomains() {
  return useQuery<PublicDomain[]>({
    queryKey: ['featured'],
    queryFn: async () => {
      const res = await fetch('/api/domains/featured')
      if (!res.ok) throw new Error('Failed to fetch featured domains')
      const data = await res.json()
      return data.domains as PublicDomain[]
    },
  })
}

function useDomains(
  search: string,
  category: string,
  extension: string,
  status: string,
  featured: boolean,
  hasPrice: boolean,
  sort: string,
  page: number
) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (category) params.set('category', category)
  if (extension) params.set('extension', extension)
  if (status) params.set('status', status)
  if (featured) params.set('featured', 'true')
  if (hasPrice) params.set('hasPrice', 'true')
  if (sort) params.set('sort', sort)
  params.set('page', String(page))
  params.set('limit', '12')

  return useQuery<{
    domains: PublicDomain[]
    total: number
    page: number
    limit: number
    categories: string[]
    extensions: string[]
  }>({
    queryKey: ['domains', search, category, extension, status, featured, hasPrice, sort, page],
    queryFn: async () => {
      const res = await fetch(`/api/domains?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch domains')
      return res.json()
    },
  })
}

function useDomainDetail(slug: string | null) {
  return useQuery<{ domain: PublicDomain; relatedDomains: PublicDomain[] } | null>({
    queryKey: ['domain', slug],
    queryFn: async () => {
      if (!slug) return null
      const res = await fetch(`/api/domains/${slug}`)
      if (!res.ok) throw new Error('Failed to fetch domain')
      return res.json()
    },
    enabled: !!slug,
  })
}

function useStats() {
  return useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch('/api/domains/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
  })
}

function useTransactions() {
  return useQuery<{ transactions: Transaction[] }>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await fetch('/api/transactions')
      if (!res.ok) throw new Error('Failed to fetch transactions')
      return res.json()
    },
  })
}

function useSettings() {
  return useQuery<SiteSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings')
      if (!res.ok) throw new Error('Failed to fetch settings')
      return res.json()
    },
  })
}

function useSubmitInquiry() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json.details) throw new Error(JSON.stringify(json.details))
        throw new Error(json.error || 'Submission failed')
      }
      return json
    },
    onSuccess: () => {
      toast({ title: 'Inquiry sent', description: 'Thank you. Your inquiry has been received.' })
      queryClient.invalidateQueries({ queryKey: ['domains'] })
    },
    onError: (err) => {
      toast({ title: 'Submission failed', description: err.message, variant: 'destructive' })
    },
  })
}

// ========================
// ANIMATION VARIANTS
// ========================

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
}

// ========================
// SECTION LABELS
// ========================

const NAV_ITEMS: {
  label: string
  section: 'home' | 'domains' | 'about' | 'services' | 'transactions' | 'contact'
}[] = [
  { label: 'Home', section: 'home' },
  { label: 'Domains', section: 'domains' },
  { label: 'About', section: 'about' },
  { label: 'Services', section: 'services' },
  { label: 'Transactions', section: 'transactions' },
  { label: 'Contact', section: 'contact' },
]

// ========================
// SOCIAL LINKS COMPONENT
// ========================

function SocialLinks() {
  const { data: settings } = useSettings()
  const links = settings?.socialLinks || {}

  return (
    <div className="flex items-center gap-2">
      {links.twitter && (
        <a
          href={links.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-[10px] hover:bg-elevated transition-colors text-muted-foreground hover:text-teal"
          aria-label="X (Twitter)"
        >
          <Twitter className="size-4" />
        </a>
      )}
      {links.linkedin && (
        <a
          href={links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-[10px] hover:bg-elevated transition-colors text-muted-foreground hover:text-teal"
          aria-label="LinkedIn"
        >
          <Linkedin className="size-4" />
        </a>
      )}
      {links.instagram && (
        <a
          href={links.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-[10px] hover:bg-elevated transition-colors text-muted-foreground hover:text-teal"
          aria-label="Instagram"
        >
          <Instagram className="size-4" />
        </a>
      )}
      {links.facebook && (
        <a
          href={links.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-[10px] hover:bg-elevated transition-colors text-muted-foreground hover:text-teal"
          aria-label="Facebook"
        >
          <Facebook className="size-4" />
        </a>
      )}
      {!links.twitter && !links.linkedin && !links.instagram && !links.facebook && (
        <span className="text-xs text-muted-foreground font-mono-accent">connect coming soon</span>
      )}
    </div>
  )
}

// ========================
// MAIN PAGE COMPONENT
// ========================

export default function HomePage() {
  const nav = useNavigation()

  return (
    <div className="min-h-screen flex flex-col relative noise-overlay">
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={nav.section}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {nav.section === 'home' && <HomeSection />}
            {nav.section === 'domains' && <DomainsSection />}
            {nav.section === 'about' && <AboutSection />}
            {nav.section === 'services' && <ServicesSection />}
            {nav.section === 'transactions' && <TransactionsSection />}
            {nav.section === 'contact' && <ContactSection />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <DomainDetailModal />
      <OfferFormDialog />
      <PrivacyModal />
      <TermsModal />
    </div>
  )
}

// ========================
// HEADER
// ========================

function Header() {
  const nav = useNavigation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNav = (section: typeof nav.section) => {
    nav.setSection(section)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-[#061312]/80 backdrop-blur-md surface-border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            aria-label="Go to home"
          >
            <span className="font-display text-xl font-bold tracking-tight text-teal">NR</span>
            <span className="hidden sm:inline text-sm font-medium text-[#B8C8C4] tracking-wide">
              Nizar Rahme
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.section}
                onClick={() => handleNav(item.section)}
                className={`px-3 py-2 text-sm rounded-[10px] transition-colors font-medium ${
                  nav.section === item.section
                    ? 'text-white bg-elevated'
                    : 'text-[#718581] hover:text-[#B8C8C4] hover:bg-elevated/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleNav('domains')}
              size="sm"
              className="hidden sm:inline-flex bg-coral text-white hover:bg-coral-hover rounded-[10px] font-medium transition-colors"
            >
              Sell a Domain
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-[#B8C8C4] hover:bg-elevated" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-[#061312] border-surface-border">
                <SheetHeader>
                  <SheetTitle className="font-display text-xl text-white">Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile navigation">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.section}
                      onClick={() => handleNav(item.section)}
                      className={`px-4 py-3 text-left rounded-[10px] text-sm transition-colors ${
                        nav.section === item.section
                          ? 'bg-elevated font-medium text-white'
                          : 'text-[#718581] hover:text-[#B8C8C4] hover:bg-elevated/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                  <Separator className="my-4 bg-surface-border" />
                  <Button
                    onClick={() => handleNav('domains')}
                    className="bg-coral text-white hover:bg-coral-hover rounded-[10px]"
                  >
                    Sell a Domain
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

// ========================
// CLAIMED DOMAINS TICKER
// ========================

function ClaimedTicker() {
  const { data: transactions } = useTransactions()
  const tickerRef = useRef<HTMLDivElement>(null)

  if (!transactions || transactions.transactions.length === 0) return null

  const items = transactions.transactions.map((tx) => ({
    domain: tx.domain,
    label: tx.status === 'Sold' ? 'SOLD' : 'CLAIMED',
  }))

  // Double for seamless loop
  const doubled = [...items, ...items]

  return (
    <div className="relative overflow-hidden py-4 bg-[#0B211E]/50 surface-border-y" aria-label="Recent domain activity">
      <div ref={tickerRef} className="animate-ticker flex gap-8 whitespace-nowrap w-max">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0">
            <CircleDot className="size-3 text-teal" />
            <span className="font-display text-sm font-bold text-[#B8C8C4]">{item.domain}</span>
            <span className="text-xs font-mono-accent text-teal tracking-wider">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ========================
// HOME SECTION
// ========================

function HomeSection() {
  const { data: featured } = useFeaturedDomains()
  const { data: stats } = useStats()
  const { data: transactions } = useTransactions()
  const nav = useNavigation()
  const [heroSearch, setHeroSearch] = useState('')

  const heroDomain = featured?.[0] || null

  const handleHeroSearch = (e: FormEvent) => {
    e.preventDefault()
    if (heroSearch.trim()) {
      nav.setSection('domains')
      // Store search to pass to domains section via a ref approach
      setTimeout(() => {
        const searchInput = document.querySelector<HTMLInputElement>('input[aria-label="Search domains"]')
        if (searchInput) {
          // Use native input setter to trigger React's onChange
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
          nativeInputValueSetter?.call(searchInput, heroSearch)
          searchInput.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }, 100)
    }
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative py-20 sm:py-28 lg:py-36 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal/5 rounded-full blur-[120px] animate-pulse-glow pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-coral/3 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center max-w-4xl mx-auto">
            {/* Eyebrow */}
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-muted border border-teal/10 text-xs font-mono-accent text-teal tracking-[0.2em] uppercase">
                <Crosshair className="size-3" />
                Premium Digital Real Estate
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.08] tracking-tight text-white"
            >
              Own the Name Behind{' '}
              <span className="text-teal teal-text-glow">What&rsquo;s Next.</span>
            </motion.h1>

            {/* Supporting copy */}
            <motion.p
              variants={fadeUp}
              className="mt-6 text-base sm:text-lg text-[#B8C8C4] max-w-2xl mx-auto leading-relaxed"
            >
              Curated, brandable domain names for AI, SaaS, fintech, and technology businesses.
              Each name selected for real-world impact.
            </motion.p>

            {/* Search bar */}
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 bg-coral hover:bg-coral-hover text-white rounded-[10px] font-medium transition-colors"
                >
                  Search
                </Button>
              </div>
            </motion.form>

            {/* Quick category pills */}
            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap justify-center gap-2">
              {['AI', 'SaaS', 'Fintech', 'Tech', 'Brandable'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    nav.setSection('domains')
                  }}
                  className="px-3 py-1.5 text-xs font-mono-accent text-[#718581] hover:text-teal border border-surface-border hover:border-teal/20 rounded-full transition-colors"
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          </motion.div>

          {/* Featured Domain Card */}
          {heroDomain && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 sm:mt-20 max-w-2xl mx-auto"
            >
              <div
                className="relative surface-border rounded-[18px] bg-surface/80 backdrop-blur-sm p-8 sm:p-10 cursor-pointer group domain-card-hover"
                onClick={() => nav.setSelectedDomain(heroDomain.slug)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') nav.setSelectedDomain(heroDomain.slug)
                }}
                aria-label={`View details for ${heroDomain.name}`}
              >
                <div className="absolute top-5 right-5 flex gap-2">
                  <Badge className="bg-teal/10 text-teal border-teal/20 text-xs font-mono-accent rounded-full px-3">
                    {heroDomain.extension}
                  </Badge>
                  <Badge className="bg-coral/10 text-coral border-coral/20 text-xs font-mono-accent rounded-full px-3">
                    {heroDomain.category}
                  </Badge>
                </div>

                <p className="text-xs font-mono-accent text-[#718581] uppercase tracking-[0.2em] mb-4">
                  Featured Domain
                </p>

                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white group-hover:text-teal transition-colors leading-tight">
                  {heroDomain.name}
                </h2>

                {heroDomain.shortDescription && (
                  <p className="mt-4 text-sm text-[#718581] max-w-md leading-relaxed">
                    {heroDomain.shortDescription}
                  </p>
                )}

                <div className="mt-6 flex items-center gap-4">
                  {heroDomain.showPrice && heroDomain.price && (
                    <p className="font-display text-2xl font-bold text-teal">
                      ${heroDomain.price.toLocaleString()}
                    </p>
                  )}
                  <Badge variant="outline" className="border-surface-border text-[#718581] text-xs font-mono-accent rounded-full">
                    {heroDomain.status}
                  </Badge>
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm text-[#718581] group-hover:text-teal transition-colors">
                  <span className="font-medium">View details</span>
                  <ArrowRight className="size-4" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* CLAIMED DOMAINS TICKER */}
      <ClaimedTicker />

      {/* TRUST STRIP */}
      <section className="py-8 surface-border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {stats ? (
            <div className="flex flex-wrap justify-center gap-10 sm:gap-16">
              <div className="text-center">
                <p className="font-display text-3xl sm:text-4xl font-bold text-white">
                  {stats.totalDomains}+
                </p>
                <p className="text-xs font-mono-accent text-[#718581] uppercase tracking-[0.15em] mt-2">Domains</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl sm:text-4xl font-bold text-white">
                  {stats.atomListed}
                </p>
                <p className="text-xs font-mono-accent text-[#718581] uppercase tracking-[0.15em] mt-2">
                  Listed on Atom
                </p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl sm:text-4xl font-bold text-white">2023</p>
                <p className="text-xs font-mono-accent text-[#718581] uppercase tracking-[0.15em] mt-2">
                  Investing Since
                </p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl sm:text-4xl font-bold text-teal">2</p>
                <p className="text-xs font-mono-accent text-[#718581] uppercase tracking-[0.15em] mt-2">
                  Completed Sales
                </p>
              </div>
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

      {/* FEATURED DOMAINS */}
      <section className="py-16 sm:py-24 relative">
        <div className="absolute inset-0 grid-pattern-subtle pointer-events-none opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-3">
                Curated Selection
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                Premium Domains
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
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-teal/30 via-teal/10 to-teal/30" />

            {[
              {
                num: '01',
                title: 'Discover',
                desc: 'Find the domain that fits your vision. Browse by category, extension, or keyword.',
                icon: Search,
              },
              {
                num: '02',
                title: 'Claim',
                desc: 'Secure your preferred digital identity. Submit an offer or start a conversation.',
                icon: Send,
              },
              {
                num: '03',
                title: 'Launch',
                desc: 'Build the brand around your new domain. Complete the transfer and go live.',
                icon: Rocket,
              },
            ].map((step) => (
              <div key={step.num} className="relative text-center px-6 py-4">
                <div className="relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-elevated border border-surface-border text-teal mb-6">
                  <step.icon className="size-6" />
                </div>
                <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-2">
                  Step {step.num}
                </p>
                <h3 className="font-display text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-[#718581] leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
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
                <div key={tx.domain} className="surface-border rounded-[16px] bg-surface p-6 flex flex-col justify-between domain-card-hover">
                  <div>
                    <p className="font-display text-xl font-bold text-white">{tx.domain}</p>
                    <Badge className="mt-2 bg-teal-muted text-teal border-teal/20 text-xs font-mono-accent rounded-full">
                      {tx.status}
                    </Badge>
                  </div>
                  <p className="font-display text-3xl font-bold text-teal mt-4">
                    ${tx.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#718581] mt-6 max-w-2xl font-mono-accent">
              These are selected completed transactions and do not represent a guarantee of future
              sale prices or outcomes.
            </p>
          </div>
        </section>
      )}

      {/* BEYOND THE NAME / SERVICES TEASER */}
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
            className="mt-8 border-surface-border text-[#B8C8C4] hover:bg-elevated hover:text-white hover:border-teal/20 rounded-[12px] transition-colors"
          >
            Explore Services <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-coral/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Your next brand deserves the right domain.
          </h2>
          <p className="mt-4 text-[#B8C8C4] max-w-2xl mx-auto leading-relaxed">
            If you are building an AI, SaaS, fintech, technology, or online business, browse the
            catalog or start a conversation.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => nav.setSection('domains')}
              className="bg-coral hover:bg-coral-hover text-white rounded-[12px] h-12 px-8 font-medium transition-colors"
            >
              Explore Premium Domains <ArrowRight className="size-4" />
            </Button>
            <Button onClick={() => nav.setSection('contact')} variant="outline" className="border-surface-border text-[#B8C8C4] hover:bg-elevated hover:text-white rounded-[12px] h-12 px-8 transition-colors">
              Contact Nizar
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

// ========================
// DOMAIN CARD
// ========================

function DomainCard({ domain }: { domain: PublicDomain }) {
  const nav = useNavigation()

  return (
    <motion.div variants={fadeUp}>
      <div
        className="group cursor-pointer surface-border rounded-[16px] bg-surface p-5 sm:p-6 domain-card-hover"
        onClick={() => nav.setSelectedDomain(domain.slug)}
        role="article"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') nav.setSelectedDomain(domain.slug)
        }}
      >
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
            <h3 className="font-display text-lg sm:text-xl font-bold leading-tight text-white group-hover:text-teal transition-colors">
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
          <p className="mt-3 text-sm text-[#718581] line-clamp-2 leading-relaxed">
            {domain.shortDescription}
          </p>
        )}

        <div className="mt-4 pt-3 border-t border-surface-border/50 flex items-center justify-between">
          <span className="text-xs font-mono-accent text-[#718581]">{domain.saleType}</span>
          <span className="text-xs text-coral font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Make an Offer <ArrowRight className="size-3" />
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ========================
// DOMAINS SECTION (CATALOG)
// ========================

function DomainsSection() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [extension, setExtension] = useState('')
  const [status, setStatus] = useState('')
  const [featured, setFeatured] = useState(false)
  const [hasPrice, setHasPrice] = useState(false)
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useDomains(
    search, category, extension, status, featured, hasPrice, sort, page
  )

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1

  const resetFilters = () => {
    setSearch('')
    setCategory('')
    setExtension('')
    setStatus('')
    setFeatured(false)
    setHasPrice(false)
    setSort('newest')
    setPage(1)
  }

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-3">
            Browse Catalog
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">Domain Catalog</h1>
          <p className="text-[#718581] mt-2">
            Browse available domain names. Click any domain to view details and make an offer.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[#718581]" />
          <Input
            placeholder="Search domains by name, category, or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-12 h-12 bg-surface border-surface-border rounded-[12px] text-white placeholder:text-[#718581] focus:border-teal/40 focus:ring-teal/20 transition-all"
            aria-label="Search domains"
          />
        </div>

        {/* Mobile filter toggle */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden border-surface-border text-[#B8C8C4] hover:bg-elevated rounded-[10px]"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="size-4 mr-2" />
            Filters
          </Button>
          <div className="hidden lg:block text-sm font-mono-accent text-[#718581]">
            {data && <span>{data.total} domain{data.total !== 1 ? 's' : ''} found</span>}
          </div>
        </div>

        {/* Filters */}
        <div className={`mb-6 ${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Select
              value={category || '_all'}
              onValueChange={(v) => {
                setCategory(v === '_all' ? '' : v)
                setPage(1)
              }}
            >
              <SelectTrigger aria-label="Filter by category" className="bg-surface border-surface-border rounded-[12px] text-[#B8C8C4]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Categories</SelectItem>
                {data?.categories?.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={extension || '_all'}
              onValueChange={(v) => {
                setExtension(v === '_all' ? '' : v)
                setPage(1)
              }}
            >
              <SelectTrigger aria-label="Filter by extension" className="bg-surface border-surface-border rounded-[12px] text-[#B8C8C4]">
                <SelectValue placeholder="Extension" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Extensions</SelectItem>
                {data?.extensions?.map((ext) => (
                  <SelectItem key={ext} value={ext}>{ext}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={status || '_all'}
              onValueChange={(v) => {
                setStatus(v === '_all' ? '' : v)
                setPage(1)
              }}
            >
              <SelectTrigger aria-label="Filter by status" className="bg-surface border-surface-border rounded-[12px] text-[#B8C8C4]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Statuses</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Negotiating">Negotiating</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v)
                setPage(1)
              }}
            >
              <SelectTrigger aria-label="Sort by" className="bg-surface border-surface-border rounded-[12px] text-[#B8C8C4]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name_asc">A → Z</SelectItem>
                <SelectItem value="name_desc">Z → A</SelectItem>
                <SelectItem value="featured">Featured First</SelectItem>
                <SelectItem value="price_asc">Price: Low → High</SelectItem>
                <SelectItem value="price_desc">Price: High → Low</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="featured-toggle"
                  checked={featured}
                  onCheckedChange={(v) => {
                    setFeatured(v)
                    setPage(1)
                  }}
                  className="data-[state=checked]:bg-teal"
                />
                <Label htmlFor="featured-toggle" className="text-sm text-[#B8C8C4] cursor-pointer">
                  Featured
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="price-toggle"
                  checked={hasPrice}
                  onCheckedChange={(v) => {
                    setHasPrice(v)
                    setPage(1)
                  }}
                  className="data-[state=checked]:bg-teal"
                />
                <Label htmlFor="price-toggle" className="text-sm text-[#B8C8C4] cursor-pointer">
                  Has Price
                </Label>
              </div>
            </div>
          </div>

          {(category || extension || status || featured || hasPrice) && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono-accent text-[#718581]">Active filters:</span>
              {category && (
                <Badge variant="secondary" className="text-xs bg-elevated text-[#B8C8C4] rounded-full">
                  {category}
                  <button
                    onClick={() => { setCategory(''); setPage(1) }}
                    className="ml-1 hover:text-white"
                    aria-label={`Remove ${category} filter`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {extension && (
                <Badge variant="secondary" className="text-xs bg-elevated text-[#B8C8C4] rounded-full">
                  {extension}
                  <button
                    onClick={() => { setExtension(''); setPage(1) }}
                    className="ml-1 hover:text-white"
                    aria-label={`Remove ${extension} filter`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {status && (
                <Badge variant="secondary" className="text-xs bg-elevated text-[#B8C8C4] rounded-full">
                  {status}
                  <button
                    onClick={() => { setStatus(''); setPage(1) }}
                    className="ml-1 hover:text-white"
                    aria-label={`Remove ${status} filter`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              <button onClick={resetFilters} className="text-xs text-teal hover:underline ml-2 font-mono-accent">
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="mb-4 text-sm font-mono-accent text-[#718581] lg:block hidden">
          {data && <span>{data.total} domain{data.total !== 1 ? 's' : ''} found</span>}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 bg-surface rounded-[16px]" />
            ))}
          </div>
        ) : data && data.domains.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.domains.map((domain) => (
                <DomainCard key={domain.id} domain={domain} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="border-surface-border text-[#B8C8C4] hover:bg-elevated rounded-[10px]"
                >
                  <ChevronLeft className="size-4" />
                  <span className="sr-only">Previous</span>
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 7) {
                      pageNum = i + 1
                    } else if (page <= 4) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i
                    } else {
                      pageNum = page - 3 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'default' : 'outline'}
                        size="sm"
                        className={`w-9 rounded-[10px] ${pageNum === page ? 'bg-teal text-[#061312] hover:bg-teal/90 border-0' : 'border-surface-border text-[#B8C8C4] hover:bg-elevated'}`}
                        onClick={() => setPage(pageNum)}
                        aria-label={`Page ${pageNum}`}
                        aria-current={pageNum === page ? 'page' : undefined}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                  className="border-surface-border text-[#B8C8C4] hover:bg-elevated rounded-[10px]"
                >
                  <ChevronRight className="size-4" />
                  <span className="sr-only">Next</span>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Globe className="size-12 text-surface-border mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-white mb-2">No domains found</h3>
            <p className="text-sm text-[#718581] mb-6">
              Try adjusting your search or filters.
            </p>
            <Button variant="outline" onClick={resetFilters} className="border-surface-border text-[#B8C8C4] hover:bg-elevated rounded-[12px]">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ========================
// DOMAIN DETAIL MODAL
// ========================

function DomainDetailModal() {
  const nav = useNavigation()
  const { data, isLoading } = useDomainDetail(nav.selectedDomain)
  const open = !!nav.selectedDomain

  const handleClose = useCallback(() => {
    nav.setSelectedDomain(null)
  }, [nav])

  const handleOffer = () => {
    if (data?.domain) {
      nav.setOfferDomainName(data.domain.name)
      nav.setSelectedDomain(null)
      nav.setShowOfferForm(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0B211E] border-surface-border rounded-2xl">
        {isLoading ? (
          <div className="py-8 space-y-4">
            <Skeleton className="h-10 w-64 bg-surface-border/50" />
            <Skeleton className="h-4 w-40 bg-surface-border/30" />
            <Skeleton className="h-20 w-full bg-surface-border/30" />
            <Skeleton className="h-32 w-full bg-surface-border/30" />
          </div>
        ) : data?.domain ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-elevated text-[#718581] border-surface-border text-xs font-mono-accent rounded-full px-3">{data.domain.extension}</Badge>
                <Badge className="bg-coral/10 text-coral border-coral/20 text-xs font-mono-accent rounded-full px-3">{data.domain.category}</Badge>
                {data.domain.featured && (
                  <Badge className="bg-teal/10 text-teal border-teal/20 text-xs font-mono-accent rounded-full px-3">Featured</Badge>
                )}
              </div>
              <DialogTitle className="font-display text-3xl sm:text-4xl font-bold text-white">
                {data.domain.name}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Details for {data.domain.name}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                {data.domain.showPrice && data.domain.price && (
                  <p className="font-display text-3xl font-bold text-teal">
                    ${data.domain.price.toLocaleString()}
                  </p>
                )}
                <Badge variant="outline" className="border-surface-border text-[#718581] text-sm font-mono-accent rounded-full">
                  {data.domain.saleType}
                </Badge>
              </div>

              {data.domain.shortDescription && (
                <p className="text-[#B8C8C4] leading-relaxed">
                  {data.domain.shortDescription}
                </p>
              )}

              {data.domain.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.domain.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs font-mono-accent bg-elevated text-[#B8C8C4] rounded-full px-3">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {data.domain.useCases.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Potential use cases</h4>
                  <ul className="space-y-2">
                    {data.domain.useCases.map((uc) => (
                      <li
                        key={uc}
                        className="flex items-start gap-2 text-sm text-[#B8C8C4]"
                      >
                        <CheckCircle2 className="size-4 text-teal mt-0.5 shrink-0" />
                        {uc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.domain.publicNotes && (
                <div className="p-4 bg-elevated rounded-xl border border-surface-border">
                  <p className="text-sm text-[#B8C8C4]">{data.domain.publicNotes}</p>
                </div>
              )}

              <Button
                onClick={handleOffer}
                className="w-full bg-coral hover:bg-coral-hover text-white h-12 rounded-[12px] font-medium transition-colors"
              >
                Make an Offer <ArrowRight className="size-4" />
              </Button>

              {data.relatedDomains.length > 0 && (
                <div>
                  <Separator className="bg-surface-border mb-6" />
                  <h4 className="text-sm font-medium text-white mb-4">Related domains</h4>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                    {data.relatedDomains.map((rd) => (
                      <button
                        key={rd.id}
                        onClick={() => nav.setSelectedDomain(rd.slug)}
                        className="shrink-0 surface-border rounded-xl p-4 hover:border-teal/30 transition-colors text-left min-w-[180px] bg-surface"
                      >
                        <p className="font-display text-sm font-bold text-white truncate">{rd.name}</p>
                        <p className="text-xs font-mono-accent text-[#718581] mt-1">{rd.category}</p>
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

// ========================
// OFFER FORM DIALOG
// ========================

const offerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Please enter a valid email address'),
  company: z.string().optional(),
  offerAmount: z.number().positive().optional(),
  intendedUse: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must consent to proceed' }),
  }),
})

type FormErrors = Record<string, string>

function OfferFormDialog() {
  const nav = useNavigation()
  const submitInquiry = useSubmitInquiry()
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    offerAmount: '',
    intendedUse: '',
    message: '',
    consent: false,
    honeypot: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const resetForm = () => {
    setForm({ name: '', email: '', company: '', offerAmount: '', intendedUse: '', message: '', consent: false, honeypot: '' })
    setErrors({})
    setSubmitted(false)
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      nav.setShowOfferForm(false)
      resetForm()
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = offerSchema.safeParse({
      name: form.name,
      email: form.email,
      company: form.company || undefined,
      offerAmount: form.offerAmount ? Number(form.offerAmount) : undefined,
      intendedUse: form.intendedUse || undefined,
      message: form.message,
      consent: form.consent,
    })

    if (!result.success) {
      const fieldErrors: FormErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (field) fieldErrors[String(field)] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    submitInquiry.mutate(
      {
        domainSlug: nav.offerDomainName
          ? nav.offerDomainName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
          : undefined,
        ...result.data,
        honeypot: form.honeypot,
      },
      {
        onSuccess: () => setSubmitted(true),
      }
    )
  }

  if (submitted) {
    return (
      <Dialog open={nav.showOfferForm} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg bg-[#0B211E] border-surface-border rounded-2xl">
          <div className="text-center py-8">
            <CheckCircle2 className="size-12 text-teal mx-auto mb-4" />
            <h3 className="font-display text-2xl font-bold text-white mb-2">Thank you.</h3>
            <p className="text-[#B8C8C4] leading-relaxed">
              Your inquiry has been received. Nizar will review it and get back to you.
            </p>
            <Button variant="outline" className="mt-6 border-surface-border text-[#B8C8C4] hover:bg-elevated rounded-[12px]" onClick={() => handleClose(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={nav.showOfferForm} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#0B211E] border-surface-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-white">Make an Offer</DialogTitle>
          <DialogDescription className="text-[#718581]">
            {nav.offerDomainName
              ? `Submit your offer for ${nav.offerDomainName}`
              : 'Submit an inquiry about a domain'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {nav.offerDomainName && (
            <div className="p-4 bg-elevated rounded-xl border border-surface-border">
              <p className="text-xs font-mono-accent text-[#718581]">Domain</p>
              <p className="font-display text-lg font-bold text-white mt-1">{nav.offerDomainName}</p>
            </div>
          )}

          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.honeypot}
              onChange={(e) => setForm((f) => ({ ...f, honeypot: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offer-name" className="text-[#B8C8C4]">Name *</Label>
              <Input
                id="offer-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                aria-invalid={!!errors.name}
                className="bg-surface border-surface-border rounded-[12px] text-white focus:border-teal/40 focus:ring-teal/20"
              />
              {errors.name && <p className="text-xs text-error">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-email" className="text-[#B8C8C4]">Email *</Label>
              <Input
                id="offer-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                aria-invalid={!!errors.email}
                className="bg-surface border-surface-border rounded-[12px] text-white focus:border-teal/40 focus:ring-teal/20"
              />
              {errors.email && <p className="text-xs text-error">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offer-company" className="text-[#B8C8C4]">Company / Project</Label>
              <Input
                id="offer-company"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                className="bg-surface border-surface-border rounded-[12px] text-white focus:border-teal/40 focus:ring-teal/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-amount" className="text-[#B8C8C4]">Offer Amount (USD)</Label>
              <Input
                id="offer-amount"
                type="number"
                min="1"
                value={form.offerAmount}
                onChange={(e) => setForm((f) => ({ ...f, offerAmount: e.target.value }))}
                placeholder="e.g. 500"
                className="bg-surface border-surface-border rounded-[12px] text-white placeholder:text-[#718581] focus:border-teal/40 focus:ring-teal/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="offer-use" className="text-[#B8C8C4]">Intended Use</Label>
            <Input
              id="offer-use"
              value={form.intendedUse}
              onChange={(e) => setForm((f) => ({ ...f, intendedUse: e.target.value }))}
              placeholder="e.g. AI startup, SaaS platform"
              className="bg-surface border-surface-border rounded-[12px] text-white placeholder:text-[#718581] focus:border-teal/40 focus:ring-teal/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="offer-message" className="text-[#B8C8C4]">Message *</Label>
            <Textarea
              id="offer-message"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              rows={4}
              aria-invalid={!!errors.message}
              className="bg-surface border-surface-border rounded-[12px] text-white placeholder:text-[#718581] focus:border-teal/40 focus:ring-teal/20"
            />
            {errors.message && <p className="text-xs text-error">{errors.message}</p>}
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="offer-consent"
              checked={form.consent}
              onCheckedChange={(v) => setForm((f) => ({ ...f, consent: v === true }))}
              className="data-[state=checked]:bg-teal data-[state=checked]:border-teal"
            />
            <Label htmlFor="offer-consent" className="text-sm text-[#718581] leading-relaxed">
              I consent to having my information stored and used to respond to this inquiry. *
            </Label>
          </div>
          {errors.consent && <p className="text-xs text-error">{errors.consent}</p>}

          <Button
            type="submit"
            className="w-full bg-coral hover:bg-coral-hover text-white h-12 rounded-[12px] font-medium transition-colors"
            disabled={submitInquiry.isPending}
          >
            {submitInquiry.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Send Inquiry <Send className="size-4" />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ========================
// ABOUT SECTION
// ========================

function AboutSection() {
  return (
    <div className="py-12 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-3">
          About
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-8">About</h1>

        <div className="space-y-6 text-[#B8C8C4] leading-relaxed">
          <p>
            I&rsquo;m Nizar Rahme. I invest in and curate domain names for businesses operating in AI,
            SaaS, fintech, technology, and the broader digital economy.
          </p>
          <p>
            My approach to domain investing is straightforward: I look for names that are short,
            memorable, and genuinely brandable—names that could serve as the foundation for a real
            business. I don&rsquo;t register names at scale or flip domains for quick returns. Each
            name in the catalog has been selected with specific industries and use cases in mind.
          </p>
          <p>
            Beyond domain investing, I have hands-on experience building WordPress websites,
            creating digital content, and working with AI-assisted workflows. This practical
            background informs how I evaluate names—I think about how a domain will work in
            context, not just how it sounds.
          </p>
        </div>

        <Separator className="my-12 bg-surface-border" />

        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-6">How I evaluate a domain</h2>

        <div className="space-y-0">
          {[
            { title: 'Brandability', desc: 'Does the name sound like a real company, not a keyword string?' },
            { title: 'Length', desc: 'Shorter is generally better. I prefer names under 12 characters when possible.' },
            { title: 'Memorability', desc: 'Can someone recall the name after hearing it once?' },
            { title: 'Pronounceability', desc: 'Can it be said out loud without confusion?' },
            { title: 'Industry fit', desc: 'Does it align with a growing sector like AI, SaaS, fintech, or digital services?' },
            { title: 'Extension quality', desc: '.com is preferred. Other extensions are selected only when the name is strong.' },
            { title: 'Search and confusion risk', desc: 'Does it avoid trademark conflicts and confusion with existing brands?' },
            { title: 'Practical value', desc: 'Would a real business benefit from owning this name?' },
          ].map((item, idx) => (
            <div
              key={item.title}
              className="flex gap-4 py-4 surface-border-b last:border-b-0"
            >
              <div className="shrink-0">
                <div className="w-8 h-8 rounded-full bg-elevated border border-surface-border flex items-center justify-center text-xs font-mono-accent text-teal">
                  {idx + 1}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-white text-sm">{item.title}</h3>
                <p className="text-sm text-[#718581] mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-12 bg-surface-border" />

        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-6">Supporting capabilities</h2>
        <ul className="space-y-3">
          {[
            'WordPress website design and development',
            'Content creation and copywriting',
            'Social media strategy and management',
            'SEO foundations and technical optimization',
            'AI-assisted workflows and automation',
          ].map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 text-sm text-[#B8C8C4]"
            >
              <CheckCircle2 className="size-4 text-teal shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <Separator className="my-12 bg-surface-border" />

        <div className="flex items-center gap-4">
          <span className="text-sm text-[#718581] font-mono-accent">Connect:</span>
          <SocialLinks />
        </div>
      </div>
    </div>
  )
}

// ========================
// SERVICES SECTION
// ========================

function ServicesSection() {
  const nav = useNavigation()

  const services = [
    {
      icon: Globe,
      title: 'WordPress Websites',
      desc: 'Custom WordPress website design and development, from business sites to content platforms. Focused on clean design, fast performance, and ease of management.',
    },
    {
      icon: FileText,
      title: 'Digital Content',
      desc: 'Writing, editing, and content strategy for websites, blogs, and marketing materials. Content that communicates clearly and serves a purpose.',
    },
    {
      icon: BarChart3,
      title: 'SEO Foundations',
      desc: 'Technical SEO setup, keyword research, on-page optimization, and site structure to help websites become findable in search results.',
    },
    {
      icon: Sparkles,
      title: 'AI-Assisted Workflows',
      desc: 'Building and implementing AI-assisted processes for content generation, data analysis, and operational efficiency using modern tools.',
    },
    {
      icon: Layers,
      title: 'Digital Brand Foundations',
      desc: 'Naming, domain selection, visual identity basics, and online presence setup for new businesses and projects.',
    },
  ]

  return (
    <div className="py-12 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-3">
          What I Offer
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">Selected Digital Services</h1>
        <p className="text-[#718581] max-w-2xl mb-12 leading-relaxed">
          Alongside domain investing, I offer select digital services for businesses and projects
          that need a hands-on, thoughtful approach to their online presence.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.title} className="surface-border rounded-[16px] bg-surface p-6 domain-card-hover">
              <service.icon className="size-6 text-teal mb-4" />
              <h3 className="font-display text-lg font-bold text-white mb-2">{service.title}</h3>
              <p className="text-sm text-[#718581] leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            onClick={() => nav.setSection('contact')}
            className="bg-coral hover:bg-coral-hover text-white rounded-[12px] h-12 px-8 font-medium transition-colors"
          >
            Discuss a Project <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ========================
// TRANSACTIONS SECTION
// ========================

function TransactionsSection() {
  const { data, isLoading } = useTransactions()

  return (
    <div className="py-12 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-3">
          Track Record
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">Transactions</h1>
        <p className="text-[#718581] mb-10 leading-relaxed">
          A record of completed domain sales. These represent actual transactions, not appraisals
          or asking prices.
        </p>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 bg-surface rounded-[16px]" />
            <Skeleton className="h-32 bg-surface rounded-[16px]" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            {data.transactions.map((tx) => (
              <div key={tx.domain} className="surface-border rounded-[16px] bg-surface p-6 sm:p-8 domain-card-hover">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white">{tx.domain}</h3>
                    <Badge className="mt-2 bg-teal-muted text-teal border-teal/20 text-xs font-mono-accent rounded-full">
                      {tx.status}
                    </Badge>
                  </div>
                  <p className="font-display text-3xl font-bold text-teal">
                    ${tx.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-8 p-4 bg-elevated rounded-xl border border-surface-border">
          <p className="text-xs font-mono-accent text-[#718581] leading-relaxed">
            These are selected completed transactions and do not represent a guarantee of future
            sale prices or outcomes. Domain values depend on many factors including market demand,
            buyer need, and negotiation.
          </p>
        </div>
      </div>
    </div>
  )
}

// ========================
// CONTACT SECTION
// ========================

const contactCategories = [
  'Acquire a Domain',
  'Discuss a Partnership',
  'Work With Nizar',
  'Other',
]

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Please enter a valid email address'),
  category: z.string().min(1, 'Please select a category'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must consent to proceed' }),
  }),
})

function ContactSection() {
  const { data: settings } = useSettings()
  const submitInquiry = useSubmitInquiry()
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: '',
    message: '',
    consent: false,
    honeypot: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = contactSchema.safeParse({
      name: form.name,
      email: form.email,
      category: form.category,
      message: form.message,
      consent: form.consent,
    })

    if (!result.success) {
      const fieldErrors: FormErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (field) fieldErrors[String(field)] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    submitInquiry.mutate(
      {
        ...result.data,
        honeypot: form.honeypot,
        inquiryType: 'contact',
      },
      {
        onSuccess: () => setSubmitted(true),
      }
    )
  }

  if (submitted) {
    return (
      <div className="py-12 sm:py-20">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <CheckCircle2 className="size-12 text-teal mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-white mb-4">Message sent</h1>
          <p className="text-[#B8C8C4] leading-relaxed">
            Thank you for reaching out. Nizar will review your message and respond as soon as
            possible.
          </p>
          <Button
            variant="outline"
            className="mt-6 border-surface-border text-[#B8C8C4] hover:bg-elevated rounded-[12px]"
            onClick={() => {
              setSubmitted(false)
              setForm({ name: '', email: '', category: '', message: '', consent: false, honeypot: '' })
            }}
          >
            Send another message
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          <div className="lg:col-span-2">
            <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-3">
              Get in Touch
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">Contact</h1>
            <p className="text-[#B8C8C4] leading-relaxed mb-8">
              Whether you&rsquo;re interested in acquiring a domain, discussing a partnership, or working
              together on a digital project, I&rsquo;d like to hear from you.
            </p>

            {settings && (
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-teal" />
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="text-sm text-[#B8C8C4] hover:text-teal transition-colors"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              </div>
            )}

            <div className="mb-8">
              <p className="text-sm font-medium text-white mb-3">Follow</p>
              <SocialLinks />
            </div>
          </div>

          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <input
                  type="text"
                  id="contact-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.honeypot}
                  onChange={(e) => setForm((f) => ({ ...f, honeypot: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="text-[#B8C8C4]">Name *</Label>
                  <Input
                    id="contact-name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    aria-invalid={!!errors.name}
                    className="bg-surface border-surface-border rounded-[12px] text-white focus:border-teal/40 focus:ring-teal/20"
                  />
                  {errors.name && <p className="text-xs text-error">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-[#B8C8C4]">Email *</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    aria-invalid={!!errors.email}
                    className="bg-surface border-surface-border rounded-[12px] text-white focus:border-teal/40 focus:ring-teal/20"
                  />
                  {errors.email && <p className="text-xs text-error">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-category" className="text-[#B8C8C4]">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger id="contact-category" aria-invalid={!!errors.category} className="bg-surface border-surface-border rounded-[12px] text-[#B8C8C4]">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-error">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message" className="text-[#B8C8C4]">Message *</Label>
                <Textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  rows={5}
                  aria-invalid={!!errors.message}
                  className="bg-surface border-surface-border rounded-[12px] text-white focus:border-teal/40 focus:ring-teal/20"
                />
                {errors.message && <p className="text-xs text-error">{errors.message}</p>}
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="contact-consent"
                  checked={form.consent}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, consent: v === true }))}
                  className="data-[state=checked]:bg-teal data-[state=checked]:border-teal"
                />
                <Label
                  htmlFor="contact-consent"
                  className="text-sm text-[#718581] leading-relaxed"
                >
                  I consent to having my information stored and used to respond to this inquiry. *
                </Label>
              </div>
              {errors.consent && <p className="text-xs text-error">{errors.consent}</p>}

              <Button
                type="submit"
                className="w-full sm:w-auto bg-coral hover:bg-coral-hover text-white h-12 px-8 rounded-[12px] font-medium transition-colors"
                disabled={submitInquiry.isPending}
              >
                {submitInquiry.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <Send className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

// ========================
// FOOTER
// ========================

function Footer() {
  const nav = useNavigation()
  const { data: settings } = useSettings()

  return (
    <footer className="mt-auto surface-border-t bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div>
            <p className="font-display text-xl font-bold text-white">Nizar Rahme</p>
            <p className="text-sm text-[#718581] mt-1 font-mono-accent">
              Domain Investor &amp; Digital Brand Builder
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-white mb-4">Navigation</p>
            <nav className="grid grid-cols-2 gap-x-8 gap-y-2" aria-label="Footer navigation">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.section}
                  onClick={() => nav.setSection(item.section)}
                  className="text-sm text-[#718581] hover:text-teal transition-colors text-left"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => nav.setShowPrivacy(true)}
                className="text-sm text-[#718581] hover:text-teal transition-colors text-left"
              >
                Privacy
              </button>
              <button
                onClick={() => nav.setShowTerms(true)}
                className="text-sm text-[#718581] hover:text-teal transition-colors text-left"
              >
                Terms
              </button>
            </nav>
          </div>

          <div>
            <p className="text-sm font-medium text-white mb-4">Connect</p>
            <SocialLinks />
            {settings && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="inline-flex items-center gap-2 text-sm text-[#718581] hover:text-teal transition-colors mt-3"
              >
                <Mail className="size-4" />
                {settings.contactEmail}
              </a>
            )}
          </div>
        </div>

        <Separator className="my-8 bg-surface-border" />

        <p className="text-xs text-[#718581] text-center font-mono-accent">
          &copy; 2025 Nizar Rahme. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

// ========================
// PRIVACY MODAL
// ========================

function PrivacyModal() {
  const nav = useNavigation()

  return (
    <Dialog open={nav.showPrivacy} onOpenChange={(v) => nav.setShowPrivacy(v)}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#0B211E] border-surface-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-white">Privacy Policy</DialogTitle>
          <DialogDescription className="text-[#718581]">Last updated: 2025</DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-4 text-sm text-[#B8C8C4] leading-relaxed">
          <p>
            This website is operated by Nizar Rahme. This privacy policy explains how personal
            information is collected, used, and protected when you use this website.
          </p>
          <h3 className="font-medium text-white">Information collected</h3>
          <p>
            When you submit an inquiry through the contact or offer forms, we collect your name,
            email address, and any additional information you choose to provide (company name, offer
            amount, message content). This information is stored solely for the purpose of responding
            to your inquiry.
          </p>
          <h3 className="font-medium text-white">How information is used</h3>
          <p>
            Your information is used only to respond to inquiries about domain acquisitions or
            services. It is not sold, shared with third parties for marketing purposes, or used for
            any purpose beyond what is necessary to address your inquiry.
          </p>
          <h3 className="font-medium text-white">Data retention</h3>
          <p>
            Inquiry data is retained for as long as necessary to address the inquiry and for a
            reasonable period afterward for record-keeping purposes. You may request deletion of
            your data at any time by contacting us.
          </p>
          <h3 className="font-medium text-white">Analytics</h3>
          <p>
            This website may use basic analytics to understand traffic patterns. No personally
            identifiable information is collected through analytics tools.
          </p>
          <h3 className="font-medium text-white">Contact</h3>
          <p>
            For any questions about this privacy policy or to request data deletion, please use the
            contact form on this website.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ========================
// TERMS MODAL
// ========================

function TermsModal() {
  const nav = useNavigation()

  return (
    <Dialog open={nav.showTerms} onOpenChange={(v) => nav.setShowTerms(v)}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#0B211E] border-surface-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-white">Terms of Use</DialogTitle>
          <DialogDescription className="text-[#718581]">Last updated: 2025</DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-4 text-sm text-[#B8C8C4] leading-relaxed">
          <p>
            By using this website, you agree to the following terms and conditions.
          </p>
          <h3 className="font-medium text-white">Website purpose</h3>
          <p>
            This website serves as a marketplace for domain names owned by Nizar Rahme. All domain
            listings, prices (where shown), and descriptions are subject to change without notice.
          </p>
          <h3 className="font-medium text-white">Inquiries and offers</h3>
          <p>
            Submitting an inquiry or offer through this website does not constitute a binding
            agreement. All transactions are subject to negotiation and mutual agreement. The
            display of a price does not guarantee availability at that price.
          </p>
          <h3 className="font-medium text-white">Domain availability</h3>
          <p>
            Domain availability is updated regularly but may not be real-time. A domain shown as
            available may have been sold or reserved. Nizar Rahme reserves the right to remove any
            listing at any time.
          </p>
          <h3 className="font-medium text-white">Intellectual property</h3>
          <p>
            All content on this website, including text, design, and branding, is the property of
            Nizar Rahme unless otherwise stated. Domain names listed are offered for sale—the
            content describing them is protected by copyright.
          </p>
          <h3 className="font-medium text-white">Limitation of liability</h3>
          <p>
            This website is provided &ldquo;as is&rdquo; without warranties of any kind. Nizar Rahme
            is not liable for any damages arising from the use of this website or from transactions
            initiated through it.
          </p>
          <h3 className="font-medium text-white">Contact</h3>
          <p>
            For questions about these terms, please use the contact form.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
