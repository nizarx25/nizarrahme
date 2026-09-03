/**
 * Middleware that guards /admin/* routes by checking for the session cookie.
 *
 * The actual token verification happens server-side in the layout (via
 * /api/admin/me), but we can short-circuit obvious unauthenticated visits
 * here to avoid rendering a flash of the login UI.
 */
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_COOKIE = 'admin_session'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin/* — /admin/login must remain accessible
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next()
  }

  const hasSession = request.cookies.get(ADMIN_COOKIE)?.value

  if (!hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('redirect', pathname)
    url.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}