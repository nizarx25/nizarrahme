import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth check
  const auth = requireAuth(request)
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params

    // Verify inquiry exists
    const existing = await db.inquiry.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const data = body as Record<string, unknown>

    // Build update data with only allowed fields
    const updateData: Record<string, unknown> = {}

    if (data.status !== undefined) {
      updateData.status = String(data.status)
    }
    if (data.adminNotes !== undefined) {
      updateData.adminNotes = String(data.adminNotes)
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
