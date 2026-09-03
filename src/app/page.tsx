'use client'

// Top-level SPA composition. Each section, dialog, and layout piece lives in
// its own module under src/components/. This file only wires them together.

import { AnimatePresence, motion } from 'framer-motion'
import { useNavigation } from '@/store/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PartnerLogos } from '@/components/layout/partner-logos'
import { HomeSection } from '@/components/sections/home-section'
import { DomainsSection } from '@/components/sections/domains-section'
import { AboutSection } from '@/components/sections/about-section'
import { ServicesSection } from '@/components/sections/services-section'
import { TransactionsSection } from '@/components/sections/transactions-section'
import { ContactSection } from '@/components/sections/contact-section'
import { DomainDetailModal } from '@/components/dialogs/domain-detail-modal'
import { OfferFormDialog } from '@/components/dialogs/offer-form-dialog'
import { PrivacyModal, TermsModal } from '@/components/dialogs/legal-modals'

const SECTION_LABELS: Record<string, string> = {
  home: 'Home section',
  domains: 'Domain catalog',
  about: 'About section',
  services: 'Services section',
  transactions: 'Transactions section',
  contact: 'Contact section',
}

export default function HomePage() {
  const nav = useNavigation()
  const ariaLabel = SECTION_LABELS[nav.section] ?? 'Section loaded'

  return (
    <div className="min-h-screen flex flex-col relative noise-overlay">
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="flex-1" role="main">
        <div aria-live="polite" className="sr-only">{ariaLabel} loaded</div>
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
      <PartnerLogos />
      <Footer />
      <DomainDetailModal />
      <OfferFormDialog />
      <PrivacyModal />
      <TermsModal />
    </div>
  )
}