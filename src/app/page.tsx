'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigation } from '@/store/navigation'
import { useToast } from '@/hooks/use-toast'
import { useState, useCallback, type FormEvent } from 'react'
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
  Hash,
  Handshake,
  FileText,
  BarChart3,
  Sparkles,
  Layers,
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
// DATA HOOKS
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
          className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
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
          className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
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
          className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
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
          className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Facebook"
        >
          <Facebook className="size-4" />
        </a>
      )}
      {!links.twitter && !links.linkedin && !links.instagram && !links.facebook && (
        <span className="text-xs text-muted-foreground">Social links coming soon</span>
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
    <div className="min-h-screen flex flex-col">
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
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm editorial-border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="Go to home"
          >
            <span className="font-display text-2xl gold-accent">NR</span>
            <span className="hidden sm:inline text-sm font-medium text-foreground tracking-wide">
              Nizar Rahme
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.section}
                onClick={() => handleNav(item.section)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  nav.section === item.section
                    ? 'text-foreground font-medium bg-secondary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
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
              className="hidden sm:inline-flex bg-navy text-white hover:bg-navy-deep"
            >
              Make an Offer
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="font-display text-xl">Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile navigation">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.section}
                      onClick={() => handleNav(item.section)}
                      className={`px-4 py-3 text-left rounded-md text-sm transition-colors ${
                        nav.section === item.section
                          ? 'bg-secondary font-medium text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                  <Separator className="my-4" />
                  <Button
                    onClick={() => handleNav('domains')}
                    className="bg-navy text-white hover:bg-navy-deep"
                  >
                    Make an Offer
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
// HOME SECTION
// ========================

function HomeSection() {
  const { data: featured } = useFeaturedDomains()
  const { data: stats } = useStats()
  const { data: transactions } = useTransactions()
  const nav = useNavigation()

  const heroDomain = featured?.[0] || null

  return (
    <div>
      {/* HERO */}
      <section className="navy-bg text-white py-16 sm:py-24 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.h1
                variants={fadeUp}
                className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight"
              >
                Brandable domains for the next digital business.
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-6 text-base sm:text-lg text-white/70 max-w-xl leading-relaxed"
              >
                I curate and invest in domain names for AI, SaaS, fintech, technology, and online
                businesses—with hands-on experience in websites, digital marketing, and AI-assisted
                workflows.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
                <Button
                  onClick={() => nav.setSection('domains')}
                  className="gold-bg text-navy hover:bg-gold-soft font-medium"
                >
                  Browse Domains
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  onClick={() => nav.setSection('domains')}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Make an Offer
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
            >
              {heroDomain ? (
                <div
                  className="relative p-8 sm:p-10 editorial-border border-white/20 bg-white/5 backdrop-blur-sm rounded-sm cursor-pointer group"
                  onClick={() => nav.setSelectedDomain(heroDomain.slug)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') nav.setSelectedDomain(heroDomain.slug)
                  }}
                  aria-label={`View details for ${heroDomain.name}`}
                >
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge className="bg-gold/20 text-gold-soft border-gold/30 text-xs">
                      {heroDomain.extension}
                    </Badge>
                    <Badge className="bg-white/10 text-white/80 border-white/20 text-xs">
                      {heroDomain.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-4">
                    Featured Domain
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white group-hover:text-gold-soft transition-colors">
                    {heroDomain.name}
                  </h2>
                  {heroDomain.shortDescription && (
                    <p className="mt-4 text-sm text-white/50 max-w-sm">
                      {heroDomain.shortDescription}
                    </p>
                  )}
                  {heroDomain.showPrice && heroDomain.price && (
                    <p className="mt-4 font-display text-2xl gold-accent">
                      ${heroDomain.price.toLocaleString()}
                    </p>
                  )}
                  <div className="mt-6 flex items-center gap-2 text-xs text-white/40 group-hover:text-white/60 transition-colors">
                    <span>View details</span>
                    <ArrowRight className="size-3" />
                  </div>
                </div>
              ) : (
                <div className="p-8 sm:p-10 editorial-border border-white/20 bg-white/5 backdrop-blur-sm rounded-sm">
                  <Skeleton className="h-12 w-64 bg-white/10" />
                  <Skeleton className="h-4 w-40 bg-white/10 mt-4" />
                  <Skeleton className="h-4 w-56 bg-white/10 mt-2" />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="py-6 editorial-border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {stats ? (
            <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
              <div className="text-center">
                <p className="font-display text-2xl sm:text-3xl text-foreground">
                  {stats.totalDomains}+
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Domains</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl sm:text-3xl text-foreground">
                  {stats.atomListed}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                  Listed on Atom
                </p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl sm:text-3xl text-foreground">2023</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                  Investing Since
                </p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl sm:text-3xl text-foreground">2</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                  Completed Sales
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-9 w-16 mx-auto" />
                  <Skeleton className="h-3 w-20 mt-2" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED DOMAINS */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl">Selected domains</h2>
              <p className="text-muted-foreground mt-2">
                A curated collection of brandable domain names.
              </p>
            </div>
            <Button
              variant="ghost"
              className="hidden sm:inline-flex text-muted-foreground"
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
            <p className="text-muted-foreground text-center py-12">
              No featured domains at this time.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button
              variant="outline"
              onClick={() => nav.setSection('domains')}
              className="w-full"
            >
              View All Domains <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 sm:py-20 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                num: '01',
                title: 'Find a name',
                desc: 'Browse the catalog and find a domain that fits your brand or project.',
                icon: Search,
              },
              {
                num: '02',
                title: 'Send an offer',
                desc: 'Use the inquiry form to submit your offer or start a conversation.',
                icon: Send,
              },
              {
                num: '03',
                title: 'Discuss the acquisition',
                desc: 'Review the offer together and complete the transfer through a secure marketplace.',
                icon: Handshake,
              },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-navy text-white mb-4">
                  <step.icon className="size-5" />
                </div>
                <p className="text-xs text-gold font-medium uppercase tracking-widest mb-2">
                  Step {step.num}
                </p>
                <h3 className="font-display text-xl mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SELECTED TRANSACTIONS */}
      {transactions && (
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl sm:text-4xl mb-10">Selected transactions</h2>
            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
              {transactions.transactions.map((tx) => (
                <div key={tx.domain} className="editorial-border p-6 flex flex-col justify-between">
                  <div>
                    <p className="font-display text-xl">{tx.domain}</p>
                    <p className="text-sm text-muted-foreground mt-1">{tx.status}</p>
                  </div>
                  <p className="font-display text-2xl gold-accent mt-4">
                    ${tx.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-6 max-w-2xl">
              These are selected completed transactions and do not represent a guarantee of future
              sale prices or outcomes.
            </p>
          </div>
        </section>
      )}

      {/* BEYOND THE NAME */}
      <section className="py-16 sm:py-20 navy-bg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl">Beyond the name</h2>
          <p className="mt-4 text-white/70 max-w-2xl mx-auto leading-relaxed">
            Alongside domain investing, I work on selected digital projects involving WordPress
            websites, content, social media, SEO, and AI-assisted workflows.
          </p>
          <Button
            onClick={() => nav.setSection('services')}
            variant="outline"
            className="mt-8 border-white/30 text-white hover:bg-white/10"
          >
            Explore Services <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl">
            Looking for the right name?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            If you are building an AI, SaaS, fintech, technology, or online business, send an offer
            for a domain or start a conversation about a potential partnership.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => nav.setSection('domains')}
              className="bg-navy text-white hover:bg-navy-deep"
            >
              Browse Domains <ArrowRight className="size-4" />
            </Button>
            <Button onClick={() => nav.setSection('contact')} variant="outline">
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
      <Card
        className="group cursor-pointer editorial-border hover:border-gold/50 transition-colors bg-card shadow-none"
        onClick={() => nav.setSelectedDomain(domain.slug)}
        role="article"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') nav.setSelectedDomain(domain.slug)
        }}
      >
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs font-normal">
                  {domain.extension}
                </Badge>
                {domain.featured && (
                  <Badge className="bg-gold/15 text-gold border-gold/25 text-xs">Featured</Badge>
                )}
              </div>
              <h3 className="font-display text-lg sm:text-xl leading-tight truncate group-hover:text-gold transition-colors">
                {domain.name}
              </h3>
            </div>
            {domain.showPrice && domain.price && (
              <p className="font-display text-lg gold-accent whitespace-nowrap">
                ${domain.price.toLocaleString()}
              </p>
            )}
          </div>
          <Badge variant="outline" className="mt-3 text-xs font-normal">
            {domain.category}
          </Badge>
          {domain.shortDescription && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {domain.shortDescription}
            </p>
          )}
          <div className="mt-4 pt-3 editorial-border-t flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{domain.saleType}</span>
            <span className="text-xs gold-accent font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Make an Offer <ArrowRight className="size-3" />
            </span>
          </div>
        </CardContent>
      </Card>
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
          <h1 className="font-display text-3xl sm:text-4xl">Domain Catalog</h1>
          <p className="text-muted-foreground mt-2">
            Browse available domain names. Click any domain to view details and make an offer.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search domains by name, category, or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-10 h-11"
            aria-label="Search domains"
          />
        </div>

        {/* Mobile filter toggle */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="size-4 mr-2" />
            Filters
          </Button>
          <div className="hidden lg:block text-sm text-muted-foreground">
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
              <SelectTrigger aria-label="Filter by category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Categories</SelectItem>
                {data?.categories?.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
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
              <SelectTrigger aria-label="Filter by extension">
                <SelectValue placeholder="Extension" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Extensions</SelectItem>
                {data?.extensions?.map((ext) => (
                  <SelectItem key={ext} value={ext}>
                    {ext}
                  </SelectItem>
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
              <SelectTrigger aria-label="Filter by status">
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
              <SelectTrigger aria-label="Sort by">
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
                />
                <Label htmlFor="featured-toggle" className="text-sm cursor-pointer">
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
                />
                <Label htmlFor="price-toggle" className="text-sm cursor-pointer">
                  Has Price
                </Label>
              </div>
            </div>
          </div>

          {(category || extension || status || featured || hasPrice) && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {category && (
                <Badge variant="secondary" className="text-xs">
                  {category}
                  <button
                    onClick={() => {
                      setCategory('')
                      setPage(1)
                    }}
                    className="ml-1 hover:text-foreground"
                    aria-label={`Remove ${category} filter`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {extension && (
                <Badge variant="secondary" className="text-xs">
                  {extension}
                  <button
                    onClick={() => {
                      setExtension('')
                      setPage(1)
                    }}
                    className="ml-1 hover:text-foreground"
                    aria-label={`Remove ${extension} filter`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {status && (
                <Badge variant="secondary" className="text-xs">
                  {status}
                  <button
                    onClick={() => {
                      setStatus('')
                      setPage(1)
                    }}
                    className="ml-1 hover:text-foreground"
                    aria-label={`Remove ${status} filter`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              <button onClick={resetFilters} className="text-xs text-gold hover:underline ml-2">
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="mb-4 text-sm text-muted-foreground lg:block hidden">
          {data && <span>{data.total} domain{data.total !== 1 ? 's' : ''} found</span>}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52" />
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
                        className="w-9"
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
                >
                  <ChevronRight className="size-4" />
                  <span className="sr-only">Next</span>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Globe className="size-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-display text-xl mb-2">No domains found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or filters.
            </p>
            <Button variant="outline" onClick={resetFilters}>
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="py-8 space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : data?.domain ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{data.domain.extension}</Badge>
                <Badge variant="outline">{data.domain.category}</Badge>
                {data.domain.featured && (
                  <Badge className="bg-gold/15 text-gold border-gold/25">Featured</Badge>
                )}
              </div>
              <DialogTitle className="font-display text-3xl sm:text-4xl">
                {data.domain.name}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Details for {data.domain.name}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                {data.domain.showPrice && data.domain.price && (
                  <p className="font-display text-3xl gold-accent">
                    ${data.domain.price.toLocaleString()}
                  </p>
                )}
                <Badge variant="outline" className="text-sm">
                  {data.domain.saleType}
                </Badge>
              </div>

              {data.domain.shortDescription && (
                <p className="text-muted-foreground leading-relaxed">
                  {data.domain.shortDescription}
                </p>
              )}

              {data.domain.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.domain.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {data.domain.useCases.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Potential use cases</h4>
                  <ul className="space-y-2">
                    {data.domain.useCases.map((uc) => (
                      <li
                        key={uc}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="size-4 text-gold mt-0.5 shrink-0" />
                        {uc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.domain.publicNotes && (
                <div className="p-4 bg-secondary/50 rounded-md">
                  <p className="text-sm text-muted-foreground">{data.domain.publicNotes}</p>
                </div>
              )}

              <Button
                onClick={handleOffer}
                className="w-full bg-navy text-white hover:bg-navy-deep h-11"
              >
                Make an Offer <ArrowRight className="size-4" />
              </Button>

              {data.relatedDomains.length > 0 && (
                <div>
                  <Separator className="mb-6" />
                  <h4 className="text-sm font-medium mb-4">Related domains</h4>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                    {data.relatedDomains.map((rd) => (
                      <button
                        key={rd.id}
                        onClick={() => nav.setSelectedDomain(rd.slug)}
                        className="shrink-0 editorial-border p-3 hover:border-gold/50 transition-colors text-left min-w-[180px]"
                      >
                        <p className="font-display text-sm truncate">{rd.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{rd.category}</p>
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
        <DialogContent className="max-w-lg">
          <div className="text-center py-8">
            <CheckCircle2 className="size-12 text-success mx-auto mb-4" />
            <h3 className="font-display text-2xl mb-2">Thank you.</h3>
            <p className="text-muted-foreground leading-relaxed">
              Your inquiry has been received. Nizar will review it and get back to you.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => handleClose(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={nav.showOfferForm} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Make an Offer</DialogTitle>
          <DialogDescription>
            {nav.offerDomainName
              ? `Submit your offer for ${nav.offerDomainName}`
              : 'Submit an inquiry about a domain'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {nav.offerDomainName && (
            <div className="p-3 bg-secondary rounded-md">
              <p className="text-xs text-muted-foreground">Domain</p>
              <p className="font-display text-lg">{nav.offerDomainName}</p>
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
              <Label htmlFor="offer-name">Name *</Label>
              <Input
                id="offer-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-xs text-error">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-email">Email *</Label>
              <Input
                id="offer-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-error">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offer-company">Company / Project</Label>
              <Input
                id="offer-company"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-amount">Offer Amount (USD)</Label>
              <Input
                id="offer-amount"
                type="number"
                min="1"
                value={form.offerAmount}
                onChange={(e) => setForm((f) => ({ ...f, offerAmount: e.target.value }))}
                placeholder="e.g. 500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="offer-use">Intended Use</Label>
            <Input
              id="offer-use"
              value={form.intendedUse}
              onChange={(e) => setForm((f) => ({ ...f, intendedUse: e.target.value }))}
              placeholder="e.g. AI startup, SaaS platform"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="offer-message">Message *</Label>
            <Textarea
              id="offer-message"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              rows={4}
              aria-invalid={!!errors.message}
            />
            {errors.message && <p className="text-xs text-error">{errors.message}</p>}
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="offer-consent"
              checked={form.consent}
              onCheckedChange={(v) => setForm((f) => ({ ...f, consent: v === true }))}
            />
            <Label htmlFor="offer-consent" className="text-sm text-muted-foreground leading-relaxed">
              I consent to having my information stored and used to respond to this inquiry. *
            </Label>
          </div>
          {errors.consent && <p className="text-xs text-error">{errors.consent}</p>}

          <Button
            type="submit"
            className="w-full bg-navy text-white hover:bg-navy-deep h-11"
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
        <h1 className="font-display text-3xl sm:text-4xl mb-8">About</h1>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
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

        <Separator className="my-12" />

        <h2 className="font-display text-2xl sm:text-3xl mb-6">How I evaluate a domain</h2>

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
              className="flex gap-4 py-4 editorial-border-b last:border-b-0"
            >
              <div className="shrink-0">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-gold">
                  {idx + 1}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-foreground text-sm">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-12" />

        <h2 className="font-display text-2xl sm:text-3xl mb-6">Supporting capabilities</h2>
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
              className="flex items-center gap-3 text-sm text-muted-foreground"
            >
              <CheckCircle2 className="size-4 text-gold shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <Separator className="my-12" />

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Connect:</span>
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
        <h1 className="font-display text-3xl sm:text-4xl mb-4">Selected digital services</h1>
        <p className="text-muted-foreground max-w-2xl mb-12 leading-relaxed">
          Alongside domain investing, I offer select digital services for businesses and projects
          that need a hands-on, thoughtful approach to their online presence.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card key={service.title} className="editorial-border shadow-none bg-card">
              <CardContent className="p-6">
                <service.icon className="size-6 text-gold mb-4" />
                <h3 className="font-display text-lg mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            onClick={() => nav.setSection('contact')}
            className="bg-navy text-white hover:bg-navy-deep"
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
        <h1 className="font-display text-3xl sm:text-4xl mb-4">Transactions</h1>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          A record of completed domain sales. These represent actual transactions, not appraisals
          or asking prices.
        </p>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            {data.transactions.map((tx) => (
              <div key={tx.domain} className="editorial-border p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl">{tx.domain}</h3>
                    <Badge variant="outline" className="mt-2">
                      {tx.status}
                    </Badge>
                  </div>
                  <p className="font-display text-3xl gold-accent">
                    ${tx.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-8 p-4 bg-secondary/50 rounded-md">
          <p className="text-xs text-muted-foreground leading-relaxed">
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
          <CheckCircle2 className="size-12 text-success mx-auto mb-4" />
          <h1 className="font-display text-3xl mb-4">Message sent</h1>
          <p className="text-muted-foreground leading-relaxed">
            Thank you for reaching out. Nizar will review your message and respond as soon as
            possible.
          </p>
          <Button
            variant="outline"
            className="mt-6"
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
            <h1 className="font-display text-3xl sm:text-4xl mb-4">Contact</h1>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Whether you&rsquo;re interested in acquiring a domain, discussing a partnership, or working
              together on a digital project, I&rsquo;d like to hear from you.
            </p>

            {settings && (
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-gold" />
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              </div>
            )}

            <div className="mb-8">
              <p className="text-sm font-medium mb-3">Follow</p>
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
                  <Label htmlFor="contact-name">Name *</Label>
                  <Input
                    id="contact-name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && <p className="text-xs text-error">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email *</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="text-xs text-error">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-category">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger id="contact-category" aria-invalid={!!errors.category}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-error">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message">Message *</Label>
                <Textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  rows={5}
                  aria-invalid={!!errors.message}
                />
                {errors.message && <p className="text-xs text-error">{errors.message}</p>}
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="contact-consent"
                  checked={form.consent}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, consent: v === true }))}
                />
                <Label
                  htmlFor="contact-consent"
                  className="text-sm text-muted-foreground leading-relaxed"
                >
                  I consent to having my information stored and used to respond to this inquiry. *
                </Label>
              </div>
              {errors.consent && <p className="text-xs text-error">{errors.consent}</p>}

              <Button
                type="submit"
                className="w-full sm:w-auto bg-navy text-white hover:bg-navy-deep h-11"
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
    <footer className="mt-auto editorial-border-t bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div>
            <p className="font-display text-xl">Nizar Rahme</p>
            <p className="text-sm text-muted-foreground mt-1">
              Domain Investor &amp; Digital Brand Builder
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-4">Navigation</p>
            <nav className="grid grid-cols-2 gap-x-8 gap-y-2" aria-label="Footer navigation">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.section}
                  onClick={() => nav.setSection(item.section)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => nav.setShowPrivacy(true)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                Privacy
              </button>
              <button
                onClick={() => nav.setShowTerms(true)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                Terms
              </button>
            </nav>
          </div>

          <div>
            <p className="text-sm font-medium mb-4">Connect</p>
            <SocialLinks />
            {settings && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-3"
              >
                <Mail className="size-4" />
                {settings.contactEmail}
              </a>
            )}
          </div>
        </div>

        <Separator className="my-8" />

        <p className="text-xs text-muted-foreground text-center">
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Privacy Policy</DialogTitle>
          <DialogDescription>Last updated: 2025</DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            This website is operated by Nizar Rahme. This privacy policy explains how personal
            information is collected, used, and protected when you use this website.
          </p>
          <h3 className="font-medium text-foreground">Information collected</h3>
          <p>
            When you submit an inquiry through the contact or offer forms, we collect your name,
            email address, and any additional information you choose to provide (company name, offer
            amount, message content). This information is stored solely for the purpose of responding
            to your inquiry.
          </p>
          <h3 className="font-medium text-foreground">How information is used</h3>
          <p>
            Your information is used only to respond to inquiries about domain acquisitions or
            services. It is not sold, shared with third parties for marketing purposes, or used for
            any purpose beyond what is necessary to address your inquiry.
          </p>
          <h3 className="font-medium text-foreground">Data retention</h3>
          <p>
            Inquiry data is retained for as long as necessary to address the inquiry and for a
            reasonable period afterward for record-keeping purposes. You may request deletion of
            your data at any time by contacting us.
          </p>
          <h3 className="font-medium text-foreground">Analytics</h3>
          <p>
            This website may use basic analytics to understand traffic patterns. No personally
            identifiable information is collected through analytics tools.
          </p>
          <h3 className="font-medium text-foreground">Contact</h3>
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Terms of Use</DialogTitle>
          <DialogDescription>Last updated: 2025</DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            By using this website, you agree to the following terms and conditions.
          </p>
          <h3 className="font-medium text-foreground">Website purpose</h3>
          <p>
            This website serves as a marketplace for domain names owned by Nizar Rahme. All domain
            listings, prices (where shown), and descriptions are subject to change without notice.
          </p>
          <h3 className="font-medium text-foreground">Inquiries and offers</h3>
          <p>
            Submitting an inquiry or offer through this website does not constitute a binding
            agreement. All transactions are subject to negotiation and mutual agreement. The
            display of a price does not guarantee availability at that price.
          </p>
          <h3 className="font-medium text-foreground">Domain availability</h3>
          <p>
            Domain availability is updated regularly but may not be real-time. A domain shown as
            available may have been sold or reserved. Nizar Rahme reserves the right to remove any
            listing at any time.
          </p>
          <h3 className="font-medium text-foreground">Intellectual property</h3>
          <p>
            All content on this website, including text, design, and branding, is the property of
            Nizar Rahme unless otherwise stated. Domain names listed are offered for sale—the
            content describing them is protected by copyright.
          </p>
          <h3 className="font-medium text-foreground">Limitation of liability</h3>
          <p>
            This website is provided &ldquo;as is&rdquo; without warranties of any kind. Nizar Rahme
            is not liable for any damages arising from the use of this website or from transactions
            initiated through it.
          </p>
          <h3 className="font-medium text-foreground">Contact</h3>
          <p>
            For questions about these terms, please use the contact form.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
