import { Suspense } from 'react'
import Link from 'next/link'
import { Globe2, Inbox, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { OverviewStats } from './overview-stats'

export const dynamic = 'force-dynamic'

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your domain portfolio and respond to inquiries.
        </p>
      </div>

      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewStats />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe2 className="h-4 w-4 text-primary" />
              Domains
            </CardTitle>
            <CardDescription>
              Edit pricing, descriptions, status, and featured flags.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/domains">
                Manage domains
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Inbox className="h-4 w-4 text-primary" />
              Inquiries
            </CardTitle>
            <CardDescription>
              Review and respond to customer inquiries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/inquiries">
                View inquiries
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border border-border/40 bg-card/30 p-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="text-foreground font-medium mb-1">Production tips</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Disable <code className="font-mono text-xs">ALLOW_ADMIN_BOOTSTRAP</code> after the first admin logs in.</li>
            <li>Keep Upstash Redis credentials in sync between local and Vercel environments.</li>
            <li>The <code className="font-mono text-xs">admin_session</code> cookie lasts 24 hours.</li>
          </ul>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" />
        All admin actions are rate-limited and logged server-side.
      </div>
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  )
}