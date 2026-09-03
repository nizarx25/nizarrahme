import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

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

    // Verify domain exists
    const existing = await db.domain.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
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

    const allowedFields = [
      'name', 'normalizedName', 'slug', 'extension', 'category',
      'tags', 'shortDescription', 'useCases', 'status', 'featured',
      'price', 'showPrice', 'saleType', 'sourceMarketplace', 'sourceUrl',
      'registrar', 'domainScore', 'tldsTaken', 'tldsDeveloped',
      'expirationDate', 'legalReviewRequired', 'publicNotes', 'internalNotes',
    ]

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (field === 'tags' || field === 'useCases') {
          // Ensure these are stored as JSON strings
          updateData[field] = JSON.stringify(data[field])
        } else if (field === 'expirationDate') {
          if (data[field] === null || data[field] === '') {
            updateData[field] = null
          } else {
            updateData[field] = new Date(data[field] as string)
          }
        } else {
          updateData[field] = data[field]
        }
      }
    }

    const updatedDomain = await db.domain.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ domain: updatedDomain })
  } catch (error) {
    console.error('Error updating domain:', error)
    return NextResponse.json({ error: 'Failed to update domain' }, { status: 500 })
  }
}
