'use client'

import { useNavigation } from '@/store/navigation'
import { SocialLinks } from './social-links'

export function Footer() {
  const nav = useNavigation()
  const year = new Date().getFullYear()

  return (
    <footer className="surface-border-t py-12 sm:py-16 bg-[#061312]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-lg font-bold text-white">NIZAR RAHME</h3>
            <p className="mt-2 text-sm text-[#718581] leading-relaxed">
              Curated, brandable domain names for AI, SaaS, fintech, and technology businesses.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-4">Browse</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => nav.setSection('home')} className="text-[#718581] hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => nav.setSection('domains')} className="text-[#718581] hover:text-white transition-colors">
                  Domains
                </button>
              </li>
              <li>
                <button onClick={() => nav.setSection('about')} className="text-[#718581] hover:text-white transition-colors">
                  About
                </button>
              </li>
              <li>
                <button onClick={() => nav.setSection('services')} className="text-[#718581] hover:text-white transition-colors">
                  Services
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-4">Hot Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => nav.setSection('transactions')} className="text-[#718581] hover:text-white transition-colors">
                  Transactions
                </button>
              </li>
              <li>
                <button onClick={() => nav.setSection('contact')} className="text-[#718581] hover:text-white transition-colors">
                  Contact
                </button>
              </li>
              <li>
                <button onClick={() => nav.setShowPrivacy(true)} className="text-[#718581] hover:text-white transition-colors">
                  Privacy
                </button>
              </li>
              <li>
                <button onClick={() => nav.setShowTerms(true)} className="text-[#718581] hover:text-white transition-colors">
                  Terms
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-4">Connect</h4>
            <SocialLinks />
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-surface-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#718581]">
          <p>© {year} NIZAR RAHME. All rights reserved.</p>
          <p className="font-mono-accent">Built by NIZAR RAHME</p>
        </div>
      </div>
    </footer>
  )
}