import type { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Admin Login — NIZAR RAHME',
  description: 'Sign in to the admin dashboard.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>
}) {
  // Resolve the searchParams promise on the server so we can pass plain,
  // serializable values down to the client component. (Passing a Promise
  // from a server component to a client component is not allowed — it
  // breaks RSC hydration and shows "This page couldn't load".)
  const sp = await searchParams
  return <LoginForm redirect={sp.redirect} errorParam={sp.error} />
}