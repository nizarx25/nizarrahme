import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDb } from '@/lib/db'
import { inquiryRateLimiter, sanitizeString } from '@/lib/auth'
import nodemailer from 'nodemailer'

const inquirySchema = z.object({
  domainSlug: z.string().optional(),
  domainName: z.string().optional(),
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

async function sendEmailNotification(data: {
  name: string
  email: string
  company?: string
  offerAmount?: number
  intendedUse?: string
  message: string
  domainSlug?: string
  domainName?: string
}) {
  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const toEmail = process.env.CONTACT_EMAIL || 'info@nizarrahme.com'

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('[email] SMTP not configured, skipping email')
    return
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  })

  const domainInfo = data.domainName
    ? `Domain: ${data.domainName}${data.domainSlug ? ` (${data.domainSlug})` : ''}`
    : ''
  const offerInfo = data.offerAmount ? `Offer Amount: $${data.offerAmount}` : ''
  const companyInfo = data.company ? `Company: ${data.company}` : ''
  const useInfo = data.intendedUse ? `Intended Use: ${data.intendedUse}` : ''

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B211E; border: 1px solid #173A35; border-radius: 8px; overflow: hidden;">
      <div style="background: #0B211E; padding: 24px; border-bottom: 2px solid #FF4D2E;">
        <h1 style="color: #00E5B0; margin: 0; font-size: 20px;">New Domain Inquiry</h1>
      </div>
      <div style="padding: 24px; background: #061312;">
        ${domainInfo ? `<p style="color: #e0e0e0; margin: 8px 0;"><strong style="color: #00E5B0;">${domainInfo}</strong></p>` : ''}
        ${offerInfo ? `<p style="color: #e0e0e0; margin: 8px 0;"><strong style="color: #FF4D2E;">${offerInfo}</strong></p>` : ''}
        <p style="color: #e0e0e0; margin: 8px 0;"><strong style="color: #ccc;">Name:</strong> ${data.name}</p>
        <p style="color: #e0e0e0; margin: 8px 0;"><strong style="color: #ccc;">Email:</strong> ${data.email}</p>
        ${companyInfo ? `<p style="color: #e0e0e0; margin: 8px 0;"><strong style="color: #ccc;">${companyInfo}</strong></p>` : ''}
        ${useInfo ? `<p style="color: #e0e0e0; margin: 8px 0;"><strong style="color: #ccc;">${useInfo}</strong></p>` : ''}
        <div style="margin-top: 16px; padding: 16px; background: #102A26; border-radius: 6px; border-left: 3px solid #00E5B0;">
          <p style="color: #ccc; margin: 0; white-space: pre-wrap;">${data.message}</p>
        </div>
      </div>
      <div style="padding: 16px 24px; background: #0B211E; border-top: 1px solid #173A35;">
        <p style="color: #4C6259; margin: 0; font-size: 12px;">Sent from nizarrahme.com</p>
      </div>
    </div>
  `

  const textBody = `New Domain Inquiry
${domainInfo ? domainInfo + '\n' : ''}${offerInfo ? offerInfo + '\n' : ''}
Name: ${data.name}
Email: ${data.email}${companyInfo ? '\n' + companyInfo : ''}${useInfo ? '\n' + useInfo : ''}

Message:\n${data.message}`

  try {
    await transporter.sendMail({
      from: `"Nizar Rahme Domains" <${smtpUser}>`,
      to: toEmail,
      replyTo: data.email,
      subject: `New Domain Inquiry${data.domainName ? ': ' + data.domainName : ''} from ${data.name}`,
      text: textBody,
      html: htmlBody,
    })
    console.log('[email] Notification sent successfully')
  } catch (emailError) {
    console.error('[email] Failed to send notification:', emailError)
    // Don't throw - inquiry should still succeed even if email fails
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 submissions per IP per hour
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

    // Parse body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Honeypot check - silently reject bots
    const rawData = body as Record<string, unknown>
    if (rawData.honeypot && String(rawData.honeypot).trim().length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Thank you for your inquiry. We will get back to you soon.',
      })
    }

    // Validate with Zod
    const result = inquirySchema.safeParse(body)
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 })
    }

    const data = result.data

    // Save to database if available (local dev)
    const database = getDb()
    if (database) {
      try {
        let domainId: string | null = null
        if (data.domainSlug) {
          const domain = await database.domain.findUnique({
            where: { slug: sanitizeString(data.domainSlug) },
            select: { id: true },
          })
          domainId = domain?.id || null
        }

        await database.inquiry.create({
          data: {
            domainId,
            name: sanitizeString(data.name),
            email: sanitizeString(data.email).toLowerCase(),
            company: data.company ? sanitizeString(data.company) : null,
            offerAmount: data.offerAmount || null,
            intendedUse: data.intendedUse ? sanitizeString(data.intendedUse) : null,
            message: sanitizeString(data.message),
          },
        })
      } catch (dbError) {
        console.error('[inquiry] DB save failed (non-critical):', dbError)
      }
    }

    // Send email notification (works on Vercel without DB)
    await sendEmailNotification({
      name: data.name,
      email: data.email,
      company: data.company || undefined,
      offerAmount: data.offerAmount || undefined,
      intendedUse: data.intendedUse || undefined,
      message: data.message,
      domainSlug: data.domainSlug || undefined,
      domainName: data.domainName || undefined,
    })

    return NextResponse.json({
      success: true,
      message: 'Thank you for your inquiry. We will get back to you soon.',
    })
  } catch (error) {
    console.error('Error processing inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    )
  }
}
