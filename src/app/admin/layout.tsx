import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { AdminShell } from './admin-shell'

export const metadata: Metadata = {
  title: 'Admin Dashboard — NIZAR RAHME',
  robots: { index: false, follow: false },
}

/**
 * Layout for /admin/* — but NOT for /admin/login. The login page has its
 * own root layout (./login/layout.tsx) so this component never runs for
 * it. We keep the cookie check here as a defense-in-depth guard for any
 * future sub-routes.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value

  if (!token) {
    redirect('/admin/login?error=unauthorized')
  }

  return <AdminShell>{children}</AdminShell>
}