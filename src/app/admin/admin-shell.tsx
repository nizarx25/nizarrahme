'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Globe2,
  Inbox,
  LogOut,
  ShieldCheck,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/toaster'

type NavItem = { href: string; label: string; icon: React.ElementType }

const NAV: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/domains', label: 'Domains', icon: Globe2 },
  { href: '/admin/inquiries', label: 'Inquiries', icon: Inbox },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(true)

  // Verify the session is still valid server-side on mount.
  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/me')
      .then(async (res) => {
        if (cancelled) return
        if (res.status === 401) {
          router.replace('/admin/login?error=session_expired')
          return
        }
        const data = await res.json().catch(() => ({}))
        if (data?.email) setEmail(data.email)
      })
      .catch(() => {
        // Network error — stay optimistic, fail open
      })
      .finally(() => {
        if (!cancelled) setVerifying(false)
      })
    return () => {
      cancelled = true
    }
  }, [router])

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } finally {
      router.replace('/admin/login')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border/40 bg-card/30">
          <div className="flex flex-col flex-1 overflow-y-auto">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-border/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-sm font-semibold">Admin</span>
                <span className="text-xs text-muted-foreground">nizarrahme.com</span>
              </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV.map((item) => {
                const Icon = item.icon
                const active =
                  pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      active
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <Separator />

            <div className="p-4 space-y-3">
              <div className="text-xs text-muted-foreground">
                Signed in as
                <div className="text-sm font-medium text-foreground truncate mt-1">
                  {verifying ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      verifying…
                    </span>
                  ) : (
                    email ?? '—'
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 md:pl-64">
          <div className="border-b border-border/40 bg-card/30 px-4 py-3 md:hidden">
            <div className="flex items-center justify-between gap-4">
              <span className="font-display text-sm font-semibold">Admin</span>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
            <nav className="mt-3 flex gap-2 overflow-x-auto">
              {NAV.map((item) => {
                const Icon = item.icon
                const active =
                  pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs whitespace-nowrap',
                      active
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}