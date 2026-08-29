import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { safeJsonParse } from '@/lib/auth'

export async function GET() {
  try {
    let settings = await db.siteSettings.findFirst()

    // Create default settings if none exist
    if (!settings) {
      settings = await db.siteSettings.create({
        data: {
          contactEmail: 'info@nizarrahme.com',
          socialLinks: '{}',
          featuredDomainIds: '[]',
        },
      })
    }

    return NextResponse.json({
      contactEmail: settings.contactEmail,
      socialLinks: safeJsonParse<Record<string, string>>(settings.socialLinks, {}),
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}
