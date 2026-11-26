'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const NAME = 'NIZAR RAHME'
const KEY = 'nizarrahme:intro-seen'

// True once the curtain has played (or was skipped) in this page session.
let introDone = false
if (typeof window !== 'undefined') {
  try {
    introDone = window.sessionStorage.getItem(KEY) === '1'
  } catch {
    // ignore
  }
}

/** Seconds the hero should wait before animating in. */
export function heroDelay(): number {
  return introDone ? 0.15 : 1.5
}

/**
 * Full-screen green curtain that spells the name letter by letter and then
 * lifts. Plays once per browser session and is skipped for users who prefer
 * reduced motion.
 */
export function IntroCurtain() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    let skip = false
    try {
      skip =
        window.sessionStorage.getItem(KEY) === '1' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.sessionStorage.setItem(KEY, '1')
    } catch {
      // storage blocked: just play it
    }
    if (skip) {
      setShow(false)
      return
    }
    const t = setTimeout(() => {
      introDone = true
      setShow(false)
    }, 1900)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1F4D3A] text-[#F6F1E8]"
          exit={{ y: '-100%' }}
          transition={{ duration: 1, ease: [0.77, 0, 0.18, 1] }}
        >
          <div className="flex font-display text-3xl sm:text-5xl tracking-tight">
            {NAME.split('').map((ch, i) => (
              <span key={i} className="inline-block overflow-hidden pb-1">
                <motion.span
                  className="inline-block whitespace-pre"
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.7, delay: 0.05 * i, ease: [0.77, 0, 0.18, 1] }}
                >
                  {ch}
                </motion.span>
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
