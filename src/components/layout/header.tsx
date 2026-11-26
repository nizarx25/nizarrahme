'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useNavigation } from '@/store/navigation'
import { NAV_ITEMS } from './navigation'

export function Header() {
  const nav = useNavigation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNav = (section: typeof nav.section) => {
    nav.setSection(section)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md surface-border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 group"
            aria-label="Go to home"
          >
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex size-8 items-center justify-center rounded-[4px] bg-teal text-[var(--ed-onacc)] font-display text-sm font-bold tracking-tight"
            >
              NR
            </motion.span>
            <span className="hidden sm:inline font-display text-lg text-white tracking-tight">
              NIZAR RAHME
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation" role="navigation">
            {NAV_ITEMS.map((item) => (
              <motion.button
                key={item.section}
                onClick={() => handleNav(item.section)}
                className={`relative px-3 py-2 text-[13px] uppercase tracking-[0.14em] transition-colors duration-200 ${
                  nav.section === item.section
                    ? 'text-white'
                    : 'text-[var(--ed-mute)] hover:text-white'
                }`}
              >
                {item.label}
                {nav.section === item.section && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute bottom-0 left-3 right-3 h-px bg-teal"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => handleNav('domains')}
                size="sm"
                className="hidden sm:inline-flex bg-coral hover:bg-coral-hover text-white rounded-full px-5 font-medium transition-colors gap-2"
              >
                <ShoppingCart className="size-4" />
                Buy a Domain
              </Button>
            </motion.div>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-[var(--ed-soft)] hover:bg-elevated" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-background border-surface-border">
                <SheetHeader>
                  <SheetTitle className="font-display text-xl text-white">Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile navigation" role="navigation">
                  {NAV_ITEMS.map((item) => (
                    <motion.button
                      key={item.section}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNav(item.section)}
                      className={`px-4 py-3 text-left rounded-[10px] text-sm transition-colors ${
                        nav.section === item.section
                          ? 'bg-elevated font-medium text-white'
                          : 'text-[var(--ed-mute)] hover:text-white hover:bg-elevated/50'
                      }`}
                    >
                      {item.label}
                    </motion.button>
                  ))}
                  <Separator className="my-4 bg-surface-border" />
                  <Button
                    onClick={() => handleNav('domains')}
                    className="bg-coral text-white hover:bg-coral-hover rounded-[10px] gap-2"
                  >
                    <ShoppingCart className="size-4" />
                    Buy a Domain
                  </Button>
                  <Separator className="my-4 bg-surface-border" />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}