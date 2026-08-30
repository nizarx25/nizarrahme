import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { inquiryRateLimiter, sanitizeString } from '@/lib/auth'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.spaceship.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
})

const inquirySchema = z.object({
  domainSlug: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  offerAmount: z.number().positive().optional(),
  intendedUse: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must consent to proceed' }),
  }),
  honeypot: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const rateCheck = inquiryRateLimiter.check(ip)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.', resetIn: rateCheck.resetIn },
        { status: 429 }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const rawData = body as Record<string, unknown>
    if (rawData.honeypot && String(rawData.honeypot).trim().length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Thank you for your inquiry. We will get back to you soon.',
      })
    }

    const result = inquirySchema.safeParse(body)
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 })
    }

    const data = result.data

    // Find domain name by slug
    let domainName: string | null = null
    if (data.domainSlug) {
      try {
        const domain = await db.domain.findUnique({
          where: { slug: sanitizeString(data.domainSlug) },
          select: { id: true, name: true },
        })
        if (domain) {
          domainName = domain.name
          await db.inquiry.create({
            data: {
              domainId: domain.id,
              name: sanitizeString(data.name),
              email: sanitizeString(data.email).toLowerCase(),
              company: data.company ? sanitizeString(data.company) : null,
              offerAmount: data.offerAmount || null,
              intendedUse: data.intendedUse ? sanitizeString(data.intendedUse) : null,
              message: sanitizeString(data.message),
            },
          })
        }
      } catch {
        // DB not available on Vercel — continue without saving
      }
    }

    // Send email notification via SpaceMail SMTP
    const toEmail = process.env.SMTP_USER || 'info@nizarrahme.com'

    try {
      await transporter.sendMail({
        from: `"NIZAR RAHME" <${toEmail}>`,
        to: toEmail,
        subject: data.domainSlug
          ? `New Offer: $${data.offerAmount || 'N/A'} for ${domainName || data.domainSlug}`
          : 'New Contact Inquiry from nizarrahme.com',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #0B211E; border-radius: 12px; padding: 32px; color: #B8C8C4;">
              <h1 style="color: #00E5B0; margin: 0 0 24px 0; font-size: 20px;">
                ${data.domainSlug ? '&#x1F52E; New Domain Offer' : '&#x1F4E8; New Contact Inquiry'}
              </h1>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #173A35; color: #718581; width: 140px;">Name</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #173A35; color: #fff; font-weight: 600;">${sanitizeString(data.name)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #173A35; color: #718581;">Email</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #173A35; color: #fff;"><a href="mailto:${sanitizeString(data.email)}" style="color: #00E5B0;">${sanitizeString(data.email)}</a></td>
                </tr>
                ${data.company ? `<tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #173A35; color: #718581;">Company</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #173A35; color: #fff;">${sanitizeString(data.company)}</td>
                </tr>` : ''}
                ${data.domainSlug ? `<tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #173A35; color: #718581;">Domain</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #173A35; color: #fff; font-weight: 600;">${domainName || data.domainSlug}</td>
                </tr>` : ''}
                ${data.offerAmount ? `<tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #173A35; color: #718581;">Offer Amount</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #173A35; color: #FF4D2E; font-weight: 700; font-size: 18px;">$${data.offerAmount.toLocaleString()}</td>
                </tr>` : ''}
                ${data.intendedUse ? `<tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #173A35; color: #718581;">Intended Use</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #173A35; color: #fff;">${sanitizeString(data.intendedUse)}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 12px 0; color: #718581; vertical-align: top;">Message</td>
                  <td style="padding: 12px 0; color: #fff;">${sanitizeString(data.message)}</td>
                </tr>
              </table>
              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #173A35; color: #718581; font-size: 12px;">
                Sent from nizarrahme.com
              </div>
            </div>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your inquiry. We will get back to you soon.',
    })
  } catch (error) {
    console.error('Error creating inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    )
  }
}