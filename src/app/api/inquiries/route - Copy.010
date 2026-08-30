import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { inquiryRateLimiter, sanitizeString } from '@/lib/auth'

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
    // Rate limiting: 5 submissions per IP per hour
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const rateCheck = inquiryRateLimiter.check(ip)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Too many submissions. Please try again later.',
          resetIn: rateCheck.resetIn,
        },
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
      // Silently accept to not tip off bots
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

    // Find domain by slug if provided
    let domainId: string | null = null
    if (data.domainSlug) {
      const domain = await db.domain.findUnique({
        where: { slug: sanitizeString(data.domainSlug) },
        select: { id: true },
      })
      domainId = domain?.id || null
    }

    // Create inquiry
    await db.inquiry.create({
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
