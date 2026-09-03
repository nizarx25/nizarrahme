'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Globe, ShoppingCart, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigation } from '@/store/navigation'
import type { PublicDomain } from '@/hooks/use-domain-data'

type Props = {
  domain: PublicDomain
  siteUrl: string
}

export function DomainPermalinkView({ domain, siteUrl }: Props) {
  const nav = useNavigation()
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    nav.setSection('home')
  }, [nav])

  const shareUrl = `${siteUrl}/d/${domain.slug}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#061312]">
      <header className="sticky top-0 z-50 bg-[#061312]/80 backdrop-blur-md surface-border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
              aria-label="Back to NIZAR RAHME home"
            >
              <span className="font-display text-xl font-bold tracking-tight text-teal">NR</span>
              <span className="hidden sm:inline text-sm font-medium text-[#B8C8C4] tracking-wide group-hover:text-white transition-colors">
                NIZAR RAHME
              </span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="border-surface-border text-[#B8C8C4] hover:bg-elevated rounded-[10px]"
              onClick={() => router.push('/')}
            >
              <Globe className="size-4 mr-2" /> Browse all domains
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className="bg-elevated text-[#718581] border-surface-border text-xs font-mono-accent rounded-full px-3 py-1">
              {domain.extension}
            </Badge>
            <Badge className="bg-coral/10 text-coral border-coral/20 text-xs font-mono-accent rounded-full px-3 py-1">
              {domain.category}
            </Badge>
            {domain.featured && (
              <Badge className="bg-teal/10 text-teal border-teal/20 text-xs font-mono-accent rounded-full px-3 py-1">
                Featured
              </Badge>
            )}
            <Badge variant="outline" className="border-surface-border text-[#718581] text-xs font-mono-accent rounded-full px-3 py-1">
              {domain.status}
            </Badge>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight">
            {domain.name}
          </h1>

          {domain.showPrice && domain.price && (
            <p className="mt-6 font-display text-3xl sm:text-4xl font-bold text-teal">
              ${domain.price.toLocaleString()}
            </p>
          )}

          {domain.shortDescription && (
            <p className="mt-6 text-base sm:text-lg text-[#B8C8C4] leading-relaxed max-w-2xl">
              {domain.shortDescription}
            </p>
          )}

          {domain.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {domain.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs font-mono-accent bg-elevated text-[#B8C8C4] rounded-full px-3 py-1"
                >
                  <Tag className="size-3 mr-1" /> {tag}
                </Badge>
              ))}
            </div>
          )}

          {domain.useCases.length > 0 && (
            <div className="mt-10 p-6 surface-border rounded-2xl bg-surface/50">
              <h2 className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-4">
                Potential Use Cases
              </h2>
              <ul className="space-y-2">
                {domain.useCases.map((uc) => (
                  <li key={uc} className="flex items-start gap-2 text-sm text-[#B8C8C4]">
                    <CheckCircle2 className="size-4 text-teal mt-0.5 shrink-0" />
                    {uc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-4">
            <Button
              onClick={() => {
                nav.setOfferDomainName(domain.name)
                nav.setShowOfferForm(true)
              }}
              className="bg-gradient-to-r from-coral to-coral-hover text-white rounded-[12px] h-12 px-8 font-medium transition-all hover:shadow-[0_0_24px_rgba(255,77,46,0.4)] hover:brightness-110"
            >
              <ShoppingCart className="size-4 mr-2" /> Make an Offer <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="border-surface-border text-[#B8C8C4] hover:bg-elevated hover:text-white rounded-[12px] h-12 px-6 transition-all"
            >
              {copied ? 'Copied!' : 'Copy share link'}
            </Button>
          </div>

          <div className="mt-8 p-4 bg-elevated/40 surface-border rounded-xl">
            <p className="text-xs font-mono-accent text-[#718581]">
              Permalink: <span className="text-[#B8C8C4]">{shareUrl}</span>
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-surface-border">
            <Link
              href="/"
              className="text-sm text-teal hover:underline font-mono-accent"
            >
              ← Browse all available domains
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="surface-border-t py-8 bg-[#061312]/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-[#718581] font-mono-accent">
            © {new Date().getFullYear()} NIZAR RAHME · All rights reserved
          </p>
        </div>
      </footer>
    </div>
  )
}