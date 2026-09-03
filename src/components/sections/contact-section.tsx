'use client'

import { useState, type FormEvent } from 'react'
import { z } from 'zod/v4'
import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useSettings, useSubmitInquiry } from '@/hooks/use-domain-data'
import { useToast } from '@/hooks/use-toast'
import { SocialLinks } from '@/components/layout/social-links'

const contactCategories = ['Acquire a Domain', 'Discuss a Partnership', 'Work With NIZAR RAHME', 'Other']

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Please enter a valid email address'),
  category: z.string().min(1, 'Please select a category'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  consent: z.literal(true, { message: 'You must consent to proceed' }),
})

type FormErrors = Record<string, string>

export function ContactSection() {
  const { data: settings } = useSettings()
  const { toast } = useToast()
  const submitInquiry = useSubmitInquiry()
  const [form, setForm] = useState({ name: '', email: '', category: '', message: '', consent: false, honeypot: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    const result = contactSchema.safeParse({
      name: form.name,
      email: form.email,
      category: form.category,
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
        ...result.data,
        honeypot: form.honeypot,
      },
      {
        onSuccess: () => {
          setSubmitted(true)
          toast({
            title: 'Message sent',
            description: 'Thank you. Your message has been received.',
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
      <section className="py-12 sm:py-20" aria-labelledby="contact-heading">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <CheckCircle2 className="size-8 sm:size-12 text-teal mx-auto mb-3 sm:mb-4" />
          <h1 id="contact-heading" className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
            Thank you.
          </h1>
          <p className="text-sm text-[#B8C8C4] leading-relaxed">
            Your message has been received. NIZAR RAHME will get back to you shortly.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-20" aria-labelledby="contact-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-3">Get in touch</p>
        <h1 id="contact-heading" className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">Contact</h1>
        <p className="text-[#718581] mb-8 leading-relaxed">
          Whether you have a question about a specific domain, want to discuss a partnership, or are interested in working together, send a message and I&apos;ll respond as soon as I can.
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4" noValidate aria-label="Contact form">
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="website-contact">Website</label>
              <input
                type="text"
                id="website-contact"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.honeypot}
                onChange={(e) => setForm((f) => ({ ...f, honeypot: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="contact-name" className="text-sm text-[#B8C8C4]">Name *</Label>
                <Input
                  id="contact-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  aria-invalid={!!errors.name}
                  className="bg-surface border-surface-border rounded-[10px] h-11 text-white text-sm focus:border-teal/40 focus:ring-teal/20"
                />
                {errors.name && (
                  <p role="alert" className="text-xs text-error mt-0.5">{errors.name}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="contact-email" className="text-sm text-[#B8C8C4]">Email *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  aria-invalid={!!errors.email}
                  className="bg-surface border-surface-border rounded-[10px] h-11 text-white text-sm focus:border-teal/40 focus:ring-teal/20"
                />
                {errors.email && (
                  <p role="alert" className="text-xs text-error mt-0.5">{errors.email}</p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact-category" className="text-sm text-[#B8C8C4]">Category *</Label>
              <select
                id="contact-category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                aria-invalid={!!errors.category}
                className="w-full h-11 px-3 bg-surface border border-surface-border rounded-[10px] text-white text-sm focus:border-teal/40 focus:ring-teal/20"
              >
                <option value="">Select a category</option>
                {contactCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p role="alert" className="text-xs text-error mt-0.5">{errors.category}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact-message" className="text-sm text-[#B8C8C4]">Message *</Label>
              <Textarea
                id="contact-message"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                rows={5}
                aria-invalid={!!errors.message}
                className="bg-surface border-surface-border rounded-[10px] text-white text-sm placeholder:text-[#718581] focus:border-teal/40 focus:ring-teal/20"
              />
              {errors.message && (
                <p role="alert" className="text-xs text-error mt-0.5">{errors.message}</p>
              )}
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="contact-consent"
                checked={form.consent}
                onCheckedChange={(v) => setForm((f) => ({ ...f, consent: v === true }))}
                className="data-[state=checked]:bg-teal data-[state=checked]:border-teal mt-0.5"
              />
              <Label htmlFor="contact-consent" className="text-xs text-[#718581] leading-relaxed">
                I consent to having my information stored and used to respond to this inquiry. *
              </Label>
            </div>
            {errors.consent && (
              <p role="alert" className="text-xs text-error">{errors.consent}</p>
            )}
            <Button
              type="submit"
              className="w-full sm:w-auto bg-coral hover:bg-coral-hover text-white h-11 px-6 rounded-[12px] font-medium transition-all hover:shadow-[0_0_20px_rgba(255,77,46,0.3)]"
              disabled={submitInquiry.isPending}
            >
              {submitInquiry.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  Send Message <Send className="size-4" />
                </>
              )}
            </Button>
          </form>

          <aside className="space-y-6">
            <div>
              <h3 className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-2">Email</h3>
              <a
                href={`mailto:${settings?.contactEmail ?? 'info@nizarrahme.com'}`}
                className="text-sm text-white hover:text-teal transition-colors break-all"
              >
                {settings?.contactEmail ?? 'info@nizarrahme.com'}
              </a>
            </div>
            <div>
              <h3 className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-2">WhatsApp</h3>
              <a
                href="https://wa.me/963932264918"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white hover:text-teal transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
            <div>
              <h3 className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-3">Social</h3>
              <SocialLinks />
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
