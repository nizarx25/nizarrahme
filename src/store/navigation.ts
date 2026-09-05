import { create } from 'zustand'

export type Section =
  | 'home'
  | 'domains'
  | 'about'
  | 'services'
  | 'works'
  | 'transactions'
  | 'contact'

const STORAGE_KEY = 'nizarrahme:section'
const VALID_SECTIONS: readonly Section[] = [
  'home',
  'domains',
  'about',
  'services',
  'works',
  'transactions',
  'contact',
] as const

function readPersistedSection(): Section {
  if (typeof window === 'undefined') return 'home'
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (stored && (VALID_SECTIONS as readonly string[]).includes(stored)) {
      return stored as Section
    }
  } catch {
    // sessionStorage may be blocked (private mode, etc.) — fall through
  }
  return 'home'
}

function writePersistedSection(section: Section) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, section)
  } catch {
    // ignore — best-effort persistence
  }
}

interface NavigationState {
  section: Section
  setSection: (section: Section) => void
  /** Read the stored section from sessionStorage. Safe to call on the client. */
  hydrate: () => void
  selectedDomain: string | null
  setSelectedDomain: (slug: string | null) => void
  showOfferForm: boolean
  setShowOfferForm: (show: boolean) => void
  showPrivacy: boolean
  setShowPrivacy: (show: boolean) => void
  showTerms: boolean
  setShowTerms: (show: boolean) => void
  offerDomainName: string
  setOfferDomainName: (name: string) => void
}

export const useNavigation = create<NavigationState>((set, get) => {
  // Try to restore the section synchronously at module load on the client.
  // We guard for `typeof window` so SSR keeps the default of 'home'. This
  // means we never need a useEffect to hydrate, which avoids the
  // "Maximum update depth exceeded" error (#185) that can fire when a
  // set() inside an effect is observed by another subscriber that itself
  // schedules another set() during render.
  const initialSection: Section =
    typeof window !== 'undefined' ? readPersistedSection() : 'home'

  return {
    section: initialSection,
    setSection: (section) => {
      writePersistedSection(section)
      set({ section, selectedDomain: null, showOfferForm: false })
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    // No-op kept for backwards compatibility with existing call sites.
    hydrate: () => {
      const current = get().section
      const stored = readPersistedSection()
      if (stored !== current) set({ section: stored })
    },
    selectedDomain: null,
    setSelectedDomain: (slug) => set({ selectedDomain: slug }),
    showOfferForm: false,
    setShowOfferForm: (show) => set({ showOfferForm: show }),
    showPrivacy: false,
    setShowPrivacy: (show) => set({ showPrivacy: show }),
    showTerms: false,
    setShowTerms: (show) => set({ showTerms: show }),
    offerDomainName: '',
    setOfferDomainName: (name) => set({ offerDomainName: name }),
  }
})
