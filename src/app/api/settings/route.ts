import { NextResponse } from 'next/server'
import { isDbAvailable, db } from '@/lib/db'
import { safeJsonParse } from '@/lib/auth'

export async function GET() {
  try {
    if (!isDbAvailable()) {
      return NextResponse.json({
        contactEmail: 'info@nizarrahme.com',
        socialLinks: {},
      })
    }

    let settings = await db.siteSettings.findFirst()

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
    return NextResponse.json({
      contactEmail: 'info@nizarrahme.com',
      socialLinks: {},
    })
  }
}