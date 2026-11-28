'use client'

// Top-level SPA composition. Each section, dialog, and layout piece lives in
// its own module under src/components/. This file only wires them together.

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useNavigation } from '@/store/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PartnerLogos } from '@/components/layout/partner-logos'
import { HomeSection } from '@/components/sections/home-section'
import { DomainsSection } from '@/components/sections/domains-section'
import { AboutSection } from '@/components/sections/about-section'
import { ServicesSection } from '@/components/sections/services-section'
import { WorksSection } from '@/components/sections/works-section'
import { TransactionsSection } from '@/components/sections/transactions-section'
import { ContactSection } from '@/components/sections/contact-section'
import { EffectsRoot } from '@/components/effects/effects-root'
import { DomainDetailModal } from '@/components/dialogs/domain-detail-modal'
import { OfferFormDialog } from '@/components/dialogs/offer-form-dialog'
import { PrivacyModal, TermsModal } from '@/components/dialogs/legal-modals'

const SECTION_LABELS: Record<string, string> = {
  home: 'Home section',
  domains: 'Domain catalog',
  about: 'About section',
  services: 'Services section',
  works: 'Works section',
  transactions: 'Transactions section',
  contact: 'Contact section',
}

type Box = { x: number; y: number; w: number; h: number; t: number }

function PageReveal({ boxRef, reduce, children }: { boxRef: { current: Box | null }; reduce: boolean | null; children: ReactNode }) {
  const el = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const node = el.current
    const b = boxRef.current
    if (!node || reduce || !b || Date.now() - b.t > 1500) return
    window.scrollTo(0, 0)
    const r = node.getBoundingClientRect()
    const vw = window.innerWidth
    const top = Math.max(0, b.y - r.top)
    const left = Math.max(0, b.x - r.left)
    const right = Math.max(0, r.right - (b.x + b.w))
    const bottom = Math.max(0, r.height - top - b.h)
    const from = `inset(${top}px ${right}px ${bottom}px ${left}px round 14px)`
    const anim = node.animate(
      [
        { clipPath: from, opacity: 0.2 },
        { clipPath: from, opacity: 1, offset: 0.08 },
        { clipPath: 'inset(0px 0px 0px 0px round 0px)', opacity: 1 },
      ],
      { duration: 900, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
    )
    const fr = document.createElement('div')
    fr.setAttribute('aria-hidden', 'true')
    fr.style.cssText = 'position:fixed;z-index:45;pointer-events:none;border:2px solid #ffd83a;background:rgba(255,216,58,0.10);box-sizing:border-box'
    document.body.appendChild(fr)
    const vh = window.innerHeight
    const fa = fr.animate(
      [
        { left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px', borderRadius: '14px', opacity: 1 },
        { left: '0px', top: '0px', width: vw + 'px', height: vh + 'px', borderRadius: '0px', opacity: 0.9, offset: 0.85 },
        { left: '0px', top: '0px', width: vw + 'px', height: vh + 'px', borderRadius: '0px', opacity: 0 },
      ],
      { duration: 900, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' },
    )
    fa.onfinish = () => fr.remove()
    return () => { anim.cancel(); fa.cancel(); fr.remove() }
  }, [boxRef, reduce])
  return <div ref={el}>{children}</div>
}

export default function HomePage() {
  const nav = useNavigation()
  const reduce = useReducedMotion()
  const boxRef = useRef<Box | null>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => {
      const t = (e.target as HTMLElement | null)?.closest?.('button,a')
      if (!t) return
      const r = t.getBoundingClientRect()
      boxRef.current = { x: r.left, y: r.top, w: r.width, h: r.height, t: Date.now() }
    }
    document.addEventListener('click', h, true)
    return () => document.removeEventListener('click', h, true)
  }, [])
  const ariaLabel = SECTION_LABELS[nav.section] ?? 'Section loaded'

  return (
    <div className="min-h-screen flex flex-col relative noise-overlay">
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <EffectsRoot />
      <Header />
      <main id="main-content" className="flex-1" role="main">
        <div aria-live="polite" className="sr-only">{ariaLabel} loaded</div>
        <div className="overflow-x-clip">
          <PageReveal key={nav.section} boxRef={boxRef} reduce={reduce}>
            {nav.section === 'home' && <HomeSection />}
            {nav.section === 'domains' && <DomainsSection />}
            {nav.section === 'about' && <AboutSection />}
            {nav.section === 'services' && <ServicesSection />}
            {nav.section === 'works' && <WorksSection />}
            {nav.section === 'transactions' && <TransactionsSection />}
            {nav.section === 'contact' && <ContactSection />}
          </PageReveal>
        </div>
      </main>
      <PartnerLogos />
      <Footer />
      <DomainDetailModal />
      <OfferFormDialog />
      <PrivacyModal />
      <TermsModal />
    </div>
  )
}