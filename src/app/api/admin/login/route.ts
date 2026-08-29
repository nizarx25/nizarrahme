import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateAdmin, sanitizeString } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.issues },
        { status: 400 }
      )
    }

    const { email, password } = result.data
    const authResult = await authenticateAdmin(
      sanitizeString(email).toLowerCase(),
      sanitizeString(password)
    )

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    return NextResponse.json({ success: true, token: authResult.token })
  } catch (error) {
    console.error('Error during admin login:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
