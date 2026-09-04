import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { AdminShell } from './admin-shell'

export const metadata: Metadata = {
  title: 'Admin Dashboard — NIZAR RAHME',
  robots: { index: false, follow: false },
}

/**
 * Layout for /admin/* — but NOT for /admin/login (it has its own root
 * layout at ./login/layout.tsx) or /admin/ping (diagnostic).
 *
 * The middleware/proxy already redirects unauthenticated visitors to
 * /admin/login. The check here is defense-in-depth: if a request reaches
 * this layout without a session, we treat it as a soft redirect rather
 * than throwing an internal error.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value

  if (!token) {
    // Use Next's redirect() which throws an internal signal caught by
    // the framework — never a "page couldn't load" error.
    redirect('/admin/login?error=unauthorized')
  }

  return <AdminShell>{children}</AdminShell>
}