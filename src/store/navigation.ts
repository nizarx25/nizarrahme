import { create } from 'zustand'

export type Section = 'home' | 'domains' | 'about' | 'services' | 'transactions' | 'contact'

interface NavigationState {
  section: Section
  setSection: (section: Section) => void
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
    set({ section, selectedDomain: null, showOfferForm: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
}))
