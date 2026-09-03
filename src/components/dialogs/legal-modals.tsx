'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useNavigation } from '@/store/navigation'

const PRIVACY_TEXT = `NIZAR RAHME respects your privacy. This page explains what information is collected when you use nizarrahme.com and how it is used.

Information collected:
- Information you submit through the contact or "Make an Offer" forms (name, email, optional company, optional offer amount, your message).
- Standard server logs (IP address, user agent, requested URL) used to operate and secure the site.

How the information is used:
- To respond to your inquiry.
- To operate, secure, and improve the site.
- We do not sell or rent your personal information to third parties.

Cookies:
- nizarrahme.com does not set advertising or tracking cookies.

Data retention:
- Form submissions are kept only as long as needed to respond and maintain a record of inquiries. You can request deletion at any time by contacting info@nizarrahme.com.

Your rights:
- You can request access, correction, or deletion of the personal data we hold about you.

Contact:
- info@nizarrahme.com`

const TERMS_TEXT = `By accessing nizarrahme.com you agree to the following terms.

Content:
- The site displays a curated portfolio of domain names offered for sale. All listings, descriptions, and pricing are subject to change without notice.

No offer or contract:
- Nothing on this site constitutes a binding offer to sell. A binding agreement is formed only after explicit written agreement between the parties and successful transfer of the domain.

Intellectual property:
- All content, design, and code on this site is © NIZAR RAHME unless otherwise noted. Domain names displayed are offered for sale; they are not granted for use until transfer is complete.

Third-party links:
- The site may link to third-party marketplaces and services. NIZAR RAHME is not responsible for the content or practices of those services.

Limitation of liability:
- nizarrahme.com is provided "as is" without warranties of any kind. NIZAR RAHME is not liable for any indirect or consequential damages arising from the use of this site.

Governing law:
- These terms are governed by the applicable laws of the owner's jurisdiction.`

export function PrivacyModal() {
  const nav = useNavigation()
  return (
    <Dialog open={nav.showPrivacy} onOpenChange={(v) => nav.setShowPrivacy(v)}>
      <DialogContent className="bg-[#0B211E] border-surface-border rounded-2xl max-h-[90dvh] overflow-y-auto p-4 sm:p-6 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-white">Privacy</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-[#718581]">
            How NIZAR RAHME handles your data.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 text-sm text-[#B8C8C4] leading-relaxed whitespace-pre-line">{PRIVACY_TEXT}</div>
        <div className="mt-6 flex justify-end">
          <Button variant="outline" className="border-surface-border text-[#B8C8C4] hover:bg-elevated rounded-[12px]" onClick={() => nav.setShowPrivacy(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function TermsModal() {
  const nav = useNavigation()
  return (
    <Dialog open={nav.showTerms} onOpenChange={(v) => nav.setShowTerms(v)}>
      <DialogContent className="bg-[#0B211E] border-surface-border rounded-2xl max-h-[90dvh] overflow-y-auto p-4 sm:p-6 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-white">Terms</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-[#718581]">
            Terms of use for nizarrahme.com.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 text-sm text-[#B8C8C4] leading-relaxed whitespace-pre-line">{TERMS_TEXT}</div>
        <div className="mt-6 flex justify-end">
          <Button variant="outline" className="border-surface-border text-[#B8C8C4] hover:bg-elevated rounded-[12px]" onClick={() => nav.setShowTerms(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}