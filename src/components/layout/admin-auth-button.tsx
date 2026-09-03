'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, LayoutDashboard, LogOut, Loader2, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type Variant = 'header' | 'mobile'

/**
 * Admin auth control for the public header.
 *
 * - Unauthenticated → "Sign in" link to /admin/login (subtle, outlined).
 * - Authenticated   → Avatar-style dropdown with "Dashboard" and "Sign out".
 *
 * The auth state is probed via /api/admin/me. The endpoint is public but
 * returns 401 when no session exists, so the component renders the "Sign in"
 * fallback by default — no flash of admin UI for anonymous visitors.
 */
export function AdminAuthButton({ variant = 'header' }: { variant?: Variant }) {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/me', { cache: 'no-store' })
      .then(async (res) => {
        if (cancelled) return
        if (res.ok) {
          const data = await res.json().catch(() => ({}))
          if (data?.email) setEmail(data.email)
        }
      })
      .catch(() => {
        // Network errors → keep unauthenticated UI
      })
      .finally(() => {
        if (!cancelled) setChecked(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      setEmail(null)
      startTransition(() => {
        router.refresh()
      })
    } finally {
      setSigningOut(false)
    }
  }

  // Avoid SSR/CSR hydration mismatch by waiting for the probe.
  if (!checked) {
    return variant === 'header' ? (
      <div
        className="hidden md:inline-flex h-8 w-24 rounded-[10px] border border-surface-border bg-elevated/30"
        aria-hidden
      />
    ) : null
  }

  // Not signed in → "Sign in" link
  if (!email) {
    if (variant === 'header') {
      return (
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="hidden md:inline-flex"
        >
          <Button
            asChild
            size="sm"
            variant="outline"
            className={cn(
              'h-8 rounded-[10px] gap-2 border-surface-border bg-elevated/40',
              'text-[#B8C8C4] hover:text-white hover:bg-elevated hover:border-teal/30',
              'transition-colors',
            )}
            aria-label="Admin sign in"
          >
            <Link href="/admin/login">
              <LogIn className="size-3.5" />
              <span>Sign in</span>
            </Link>
          </Button>
        </motion.div>
      )
    }

    // Mobile (Sheet) variant
    return (
      <Button
        asChild
        variant="outline"
        className="border-surface-border bg-elevated/40 text-[#B8C8C4] hover:text-white hover:bg-elevated rounded-[10px] gap-2"
      >
        <Link href="/admin/login">
          <LogIn className="size-4" />
          Admin Sign in
        </Link>
      </Button>
    )
  }

  // Signed in → avatar-style dropdown
  if (variant === 'header') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'hidden md:inline-flex h-8 items-center gap-2 rounded-[10px] px-2.5',
              'border border-teal/30 bg-teal/10 text-teal',
              'hover:bg-teal/15 transition-colors',
            )}
            aria-label="Open admin menu"
          >
            <ShieldCheck className="size-3.5" />
            <span className="text-xs font-medium max-w-[120px] truncate">
              {email}
            </span>
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-[#0B211E] border-surface-border">
          <DropdownMenuLabel className="text-[#718581] text-xs font-normal">
            Signed in as
            <div className="text-white text-sm font-medium truncate mt-0.5">
              {email}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-surface-border" />
          <DropdownMenuItem
            asChild
            className="text-[#B8C8C4] focus:text-white focus:bg-elevated cursor-pointer"
          >
            <Link href="/admin" className="flex items-center gap-2">
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="text-[#B8C8C4] focus:text-white focus:bg-elevated cursor-pointer"
          >
            <Link href="/admin/inquiries" className="flex items-center gap-2">
              Inquiries
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="text-[#B8C8C4] focus:text-white focus:bg-elevated cursor-pointer"
          >
            <Link href="/admin/domains" className="flex items-center gap-2">
              Domains
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-surface-border" />
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-coral focus:text-white focus:bg-coral/20 cursor-pointer"
          >
            {signingOut ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            <span>{signingOut ? 'Signing out…' : 'Sign out'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Mobile signed-in view
  return (
    <div className="flex flex-col gap-2">
      <div className="px-1 py-2 text-xs text-[#718581]">
        Signed in as
        <div className="text-sm font-medium text-white truncate">{email}</div>
      </div>
      <Button
        asChild
        className="bg-teal/15 border border-teal/30 text-teal hover:bg-teal/25 rounded-[10px] gap-2"
      >
        <Link href="/admin">
          <LayoutDashboard className="size-4" />
          Open dashboard
        </Link>
      </Button>
      <Button
        onClick={handleSignOut}
        disabled={signingOut}
        variant="outline"
        className="border-coral/30 bg-coral/10 text-coral hover:bg-coral/20 rounded-[10px] gap-2"
      >
        {signingOut ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogOut className="size-4" />
        )}
        {signingOut ? 'Signing out…' : 'Sign out'}
      </Button>
    </div>
  )
}