import { Globe2, Star, Tag, Inbox } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { inquiryStats } from '@/lib/inquiry-store'

type DomainCounts = {
  total: number
  featured: number
  wholesale: number
}

async function loadDomainCounts(): Promise<DomainCounts> {
  try {
    const [total, featured, wholesale] = await Promise.all([
      db.domain.count(),
      db.domain.count({ where: { featured: true } }),
      db.domain.count({ where: { price: 99 } }),
    ])
    return { total, featured, wholesale }
  } catch {
    // DB unavailable — return zeros (Vercel: stats come from JSON fallback)
    return { total: 0, featured: 0, wholesale: 0 }
  }
}

export async function OverviewStats() {
  const [counts, inquiries] = await Promise.all([loadDomainCounts(), inquiryStats()])

  const items = [
    {
      label: 'Total domains',
      value: counts.total,
      icon: Globe2,
    },
    {
      label: 'Featured',
      value: counts.featured,
      icon: Star,
    },
    {
      label: 'Wholesale ($99 BIN)',
      value: counts.wholesale,
      icon: Tag,
    },
    {
      label: 'New inquiries',
      value: inquiries.newCount,
      icon: Inbox,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{item.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}