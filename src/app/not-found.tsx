import Link from 'next/link'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#061312]">
      <div className="text-center max-w-md">
        <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-3">404</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">Domain not found</h1>
        <p className="text-sm text-[#718581] mb-8 leading-relaxed">
          The page or domain you&apos;re looking for has either been sold, removed, or never existed.
        </p>
        <Link href="/">
          <Button className="bg-gradient-to-r from-coral to-coral-hover text-white rounded-[12px] h-11 px-6">
            <Globe className="size-4 mr-2" /> Back to marketplace
          </Button>
        </Link>
      </div>
    </div>
  )
}