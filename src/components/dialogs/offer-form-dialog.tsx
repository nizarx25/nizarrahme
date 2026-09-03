'use client'

import { useState, type FormEvent } from 'react'
import { z } from 'zod/v4'
import { CheckCircle2, Loader2, Send } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useNavigation } from '@/store/navigation'
import { useSubmitInquiry } from '@/hooks/use-domain-data'

const offerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Please enter a valid email address'),
  company: z.string().optional(),
  offerAmount: z.number().positive().optional(),
  intendedUse: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  consent: z.literal(true, { message: 'You must consent to proceed' }),
})

type FormErrors = Record<string, string>

export function OfferFormDialog() {
  const nav = useNavigation()
  const { toast } = useToast()
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
    setForm({
      name: '',
      email: '',
      company: '',
      offerAmount: '',
      intendedUse: '',
      message: '',
      consent: false,
      honeypot: '',
    })
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
        onSuccess: () => {
          setSubmitted(true)
          toast({
            title: 'Inquiry sent',
            description: 'Thank you. Your inquiry has been received.',
          })
        },
        onError: (err) => {
          toast({
            title: 'Submission failed',
            description: err.message,
            variant: 'destructive',
          })
        },
      },
    )
  }

  if (submitted) {
    return (
      <Dialog open={nav.showOfferForm} onOpenChange={handleClose}>
        <DialogContent className="bg-[#0B211E] border-surface-border rounded-2xl p-4 sm:p-6">
          <DialogHeader className="sr-only">
            <DialogTitle>Offer Submitted</DialogTitle>
            <DialogDescription>Your domain offer has been submitted successfully.</DialogDescription>
          </DialogHeader>
          <div className="text-center py-4 sm:py-8">
            <CheckCircle2 className="size-8 sm:size-12 text-teal mx-auto mb-3 sm:mb-4" />
            <h3 className="font-display text-lg sm:text-2xl font-bold text-white mb-2">Thank you.</h3>
            <p className="text-xs sm:text-sm text-[#B8C8C4] leading-relaxed px-2">
              Your inquiry has been received. NIZAR RAHME will review it and get back to you.
            </p>
            <Button
              variant="outline"
              className="mt-4 sm:mt-6 border-surface-border text-[#B8C8C4] hover:bg-elevated rounded-[12px]"
              onClick={() => handleClose(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={nav.showOfferForm} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0B211E] border-surface-border rounded-2xl max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-1 sm:pb-2">
          <DialogTitle className="font-display text-lg sm:text-2xl font-bold text-white pr-8">
            Make an Offer
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-[#718581]">
            {nav.offerDomainName
              ? `Submit your offer for ${nav.offerDomainName}`
              : 'Submit an inquiry about a domain'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-3 sm:mt-6 space-y-3 sm:space-y-5" noValidate aria-label="Domain offer form">
          {nav.offerDomainName && (
            <div className="p-2.5 sm:p-4 bg-elevated rounded-xl border border-surface-border">
              <p className="text-[10px] sm:text-xs font-mono-accent text-[#718581]">Domain</p>
              <p className="font-display text-sm sm:text-lg font-bold bg-gradient-to-r from-teal to-teal-soft bg-clip-text text-transparent mt-0.5 sm:mt-1">
                {nav.offerDomainName}
              </p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
            <div className="space-y-1">
              <Label htmlFor="offer-name" className="text-xs sm:text-sm text-[#B8C8C4]">Name *</Label>
              <Input
                id="offer-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                aria-invalid={!!errors.name}
                aria-errormessage="offer-name-error"
                className="bg-surface border-surface-border rounded-[10px] h-10 sm:h-11 text-white text-sm focus:border-teal/40 focus:ring-teal/20"
              />
              {errors.name && (
                <p id="offer-name-error" role="alert" className="text-[10px] sm:text-xs text-error mt-0.5">
                  {errors.name}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="offer-email" className="text-xs sm:text-sm text-[#B8C8C4]">Email *</Label>
              <Input
                id="offer-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                aria-invalid={!!errors.email}
                aria-errormessage="offer-email-error"
                className="bg-surface border-surface-border rounded-[10px] h-10 sm:h-11 text-white text-sm focus:border-teal/40 focus:ring-teal/20"
              />
              {errors.email && (
                <p id="offer-email-error" role="alert" className="text-[10px] sm:text-xs text-error mt-0.5">
                  {errors.email}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
            <div className="space-y-1">
              <Label htmlFor="offer-company" className="text-xs sm:text-sm text-[#B8C8C4]">Company / Project</Label>
              <Input
                id="offer-company"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                className="bg-surface border-surface-border rounded-[10px] h-10 sm:h-11 text-white text-sm focus:border-teal/40 focus:ring-teal/20"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="offer-amount" className="text-xs sm:text-sm text-[#B8C8C4]">Offer Amount (USD)</Label>
              <Input
                id="offer-amount"
                type="number"
                min="1"
                inputMode="numeric"
                value={form.offerAmount}
                onChange={(e) => setForm((f) => ({ ...f, offerAmount: e.target.value }))}
                placeholder="e.g. 500"
                className="bg-surface border-surface-border rounded-[10px] h-10 sm:h-11 text-white text-sm placeholder:text-[#718581] focus:border-teal/40 focus:ring-teal/20"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="offer-use" className="text-xs sm:text-sm text-[#B8C8C4]">Intended Use</Label>
            <Input
              id="offer-use"
              value={form.intendedUse}
              onChange={(e) => setForm((f) => ({ ...f, intendedUse: e.target.value }))}
              placeholder="e.g. AI startup, SaaS platform"
              className="bg-surface border-surface-border rounded-[10px] h-10 sm:h-11 text-white text-sm placeholder:text-[#718581] focus:border-teal/40 focus:ring-teal/20"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="offer-message" className="text-xs sm:text-sm text-[#B8C8C4]">Message *</Label>
            <Textarea
              id="offer-message"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              rows={3}
              aria-invalid={!!errors.message}
              aria-errormessage="offer-message-error"
              className="bg-surface border-surface-border rounded-[10px] text-white text-sm placeholder:text-[#718581] focus:border-teal/40 focus:ring-teal/20"
            />
            {errors.message && (
              <p id="offer-message-error" role="alert" className="text-[10px] sm:text-xs text-error mt-0.5">
                {errors.message}
              </p>
            )}
          </div>
          <div className="flex items-start gap-2 pt-0.5">
            <Checkbox
              id="offer-consent"
              checked={form.consent}
              onCheckedChange={(v) => setForm((f) => ({ ...f, consent: v === true }))}
              aria-errormessage="offer-consent-error"
              className="data-[state=checked]:bg-teal data-[state=checked]:border-teal mt-0.5"
            />
            <Label htmlFor="offer-consent" className="text-[10px] sm:text-xs text-[#718581] leading-relaxed">
              I consent to having my information stored and used to respond to this inquiry. *
            </Label>
          </div>
          {errors.consent && (
            <p id="offer-consent-error" role="alert" className="text-[10px] sm:text-xs text-error">
              {errors.consent}
            </p>
          )}
          <Button
            type="submit"
            className="w-full bg-coral hover:bg-coral-hover text-white h-11 sm:h-12 rounded-[12px] font-medium transition-all hover:shadow-[0_0_20px_rgba(255,77,46,0.3)] text-sm"
            disabled={submitInquiry.isPending}
          >
            {submitInquiry.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Submitting...
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
