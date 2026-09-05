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

export const useNavigation = create<NavigationState>((set) => ({
  section: 'home',
  setSection: (section) => {
    writePersistedSection(section)
    set({ section, selectedDomain: null, showOfferForm: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  },
  hydrate: () => set({ section: readPersistedSection() }),
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
}))
