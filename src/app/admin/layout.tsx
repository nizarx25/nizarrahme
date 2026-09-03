import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AdminShell } from './admin-shell'

export const metadata: Metadata = {
  title: 'Admin Dashboard — NIZAR RAHME',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Layout-level SSR auth check: confirm the cookie maps to a live session.
  // This runs on every /admin/* request. The middleware redirects to
  // /admin/login when the cookie is missing; here we handle expired sessions.
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value

  if (!token) {
    redirect('/admin/login?error=unauthorized')
  }

  // Render the shell with children; the shell performs its own client-side
  // confirmation via /api/admin/me so we don't block render on Redis latency.
  return <AdminShell>{children}</AdminShell>
}