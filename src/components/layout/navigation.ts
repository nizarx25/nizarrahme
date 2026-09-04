// Centralized section navigation. The Section type is shared with the Zustand
// store in src/store/navigation.ts.

import type { Section } from '@/store/navigation'

export type NavItem = {
  label: string
  section: Section
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', section: 'home' },
  { label: 'Domains', section: 'domains' },
  { label: 'About', section: 'about' },
  { label: 'Services', section: 'services' },
  { label: 'Works', section: 'works' },
  { label: 'Transactions', section: 'transactions' },
  { label: 'Contact', section: 'contact' },
] as const