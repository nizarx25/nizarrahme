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
    <header className="sticky top-0 z-50 bg-[#061312]/80 backdrop-blur-md surface-border-b">
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
              className="font-display text-xl font-bold tracking-tight text-teal"
            >
              NR
            </motion.span>
            <span className="hidden sm:inline text-sm font-medium text-[#B8C8C4] tracking-wide group-hover:text-white transition-colors">
              NIZAR RAHME
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation" role="navigation">
            {NAV_ITEMS.map((item) => (
              <motion.button
                key={item.section}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNav(item.section)}
                className={`relative px-3 py-2 text-sm rounded-[10px] transition-all duration-200 font-medium ${
                  nav.section === item.section
                    ? 'text-white bg-gradient-to-r from-elevated to-elevated/80 shadow-[0_0_12px_rgba(0,229,176,0.08)]'
                    : 'text-[#718581] hover:text-white hover:bg-elevated/50 hover:shadow-[0_0_8px_rgba(0,229,176,0.05)]'
                }`}
              >
                {item.label}
                {nav.section === item.section && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-gradient-to-r from-teal to-teal-soft rounded-full shadow-[0_0_8px_rgba(0,229,176,0.5)]"
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
                className="hidden sm:inline-flex bg-gradient-to-r from-coral to-coral-hover text-white rounded-[10px] font-medium transition-all hover:shadow-[0_0_24px_rgba(255,77,46,0.4)] hover:brightness-110 gap-2"
              >
                <ShoppingCart className="size-4" />
                Buy a Domain
              </Button>
            </motion.div>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-[#B8C8C4] hover:bg-elevated" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-[#061312] border-surface-border">
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
                          : 'text-[#718581] hover:text-white hover:bg-elevated/50'
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
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}