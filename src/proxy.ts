/**
 * Edge proxy that guards /admin/* routes by checking for the session cookie.
 *
 * Next.js 16 deprecated `middleware` in favor of `proxy` — the file must
 * export a function named `proxy` (or as default) and the same `config`.
 *
 * The actual token verification happens server-side in the layout (via
 * /api/admin/me), but we can short-circuit obvious unauthenticated visits
 * here to avoid rendering a flash of the login UI.
 */
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_COOKIE = 'admin_session'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin/* — /admin-login must remain accessible.
  // Also exempt /admin/ping (diagnostic).
  const PUBLIC_ADMIN_PATHS = new Set(['/admin-login', '/admin/ping'])
  if (!pathname.startsWith('/admin') || PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  const hasSession = request.cookies.get(ADMIN_COOKIE)?.value

  if (!hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin-login'
    url.searchParams.set('redirect', pathname)
    url.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Legacy alias — some Next.js versions still scan for `middleware` exports
export const middleware = proxy

export const config = {
  matcher: ['/admin/:path*'],
}