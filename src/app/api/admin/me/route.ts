import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

/**
 * Lightweight endpoint the admin layout polls once on mount to confirm
 * the session cookie is still valid server-side.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.authenticated) {
    return NextResponse.json({ authenticated: false, error: auth.error }, { status: 401 })
  }
  return NextResponse.json({ authenticated: true, email: auth.email })
}