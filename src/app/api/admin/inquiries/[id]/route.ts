import { NextRequest, NextResponse } from 'next/server'
import { db, isDbAvailable } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { findInquiryById, updateInquiry } from '@/lib/inquiry-store'
import { isRedisAvailable } from '@/lib/redis'
import type { InquiryStatus } from '@/lib/inquiry-store'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth check
  const auth = await requireAuth(request)
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const data = body as Record<string, unknown>

    const status = data.status !== undefined ? (String(data.status) as InquiryStatus) : undefined
    const adminNotes = data.adminNotes !== undefined ? String(data.adminNotes) : undefined

    // Prefer Redis (works on Vercel), fall back to Prisma.
    if (isRedisAvailable()) {
      const existing = await findInquiryById(id)
      if (!existing) {
        return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
      }
      const updated = await updateInquiry(id, { status, adminNotes })
      return NextResponse.json({ inquiry: updated })
    }

    if (!isDbAvailable()) {
      return NextResponse.json({ error: 'Database not available in this environment' }, { status: 503 })
    }

    // Verify inquiry exists
    const existing = await db.inquiry.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    // Build update data with only allowed fields
    const updateData: Record<string, unknown> = {}

    if (status !== undefined) {
      updateData.status = status
    }
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes
    }

    const updatedInquiry = await db.inquiry.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ inquiry: updatedInquiry })
  } catch (error) {
    console.error('Error updating inquiry:', error)
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 })
  }
}
