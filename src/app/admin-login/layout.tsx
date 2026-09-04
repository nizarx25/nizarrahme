/**
 * Dedicated layout for /admin/login.
 *
 * This file overrides the parent /admin/layout.tsx so the unauthenticated
 * login page does NOT try to read a session cookie (which would cause an
 * infinite redirect loop on the login route itself).
 */
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}