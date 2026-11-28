'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ArrowRight, Search } from 'lucide-react'

const TAGS = [
  { n: 'fogengine', e: '.ai' },
  { n: 'vectorsift', e: '.com' },
  { n: 'sunly', e: '.si' },
  { n: 'finlyra', e: '.io' },
  { n: 'dnabite', e: '.com' },
  { n: 'mythosscale', e: '.ai' },
]
const NAMES = ['BaseOPolis.com', 'FogEngine.ai', 'KernEngine.com', 'VectorSift.com', 'DnaBite.com', 'MythosScale.com', 'FinTriva.com']

export function EditorialHero({ onSearch, onBrowse }: { onSearch: (q: string) => void; onBrowse: () => void }) {
  const ref = useRef<HTMLElement>(null)
  const [q, setQ] = useState('')
  const [ext, setExt] = useState(0)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setExt((e) => (e + 1) % TAGS.length), 2800)
    return () => clearInterval(t)
  }, [reduce])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const sp = useSpring(scrollYProgress, { stiffness: 80, damping: 22 })
  const y = useTransform(sp, [0, 1], [0, 140])
  const tick = useTransform(sp, [0, 1], ['0%', '-35%'])
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (q.trim()) onSearch(q)
  }
  return (
    <section ref={ref} className="relative px-3 sm:px-5 pt-4 pb-10">
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[44px] bg-[#0c3b2a] border border-surface-border min-h-[640px] lg:min-h-[760px]">
        <div className="relative z-10 px-6 sm:px-12 pt-12 sm:pt-16 pb-28 max-w-[900px] lg:max-w-[700px]">
          <span className="inline-block mb-6 px-4 py-1.5 rounded-full border border-[#f3ecd9]/20 text-[11px] font-mono-accent tracking-[0.25em] uppercase text-[#ffd83a]">
            Premium Digital Real Estate
          </span>
          <h1 className="font-display text-[3.2rem] sm:text-[5.5rem] lg:text-[5.6rem] xl:text-[6.4rem] leading-[0.92] tracking-[-0.04em] text-[#f3ecd9]">
            Own the name behind{' '}
            <span className="italic font-medium text-[#ffd83a]">what&rsquo;s next.</span>
          </h1>
          <p className="mt-6 max-w-md text-base sm:text-lg text-[#cfe3d6]">
            Curated, brandable domain names for AI, SaaS, fintech and technology businesses. Each name selected for real-world impact.
          </p>
          <form onSubmit={submit} className="mt-8 max-w-md relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#a9c4b4]" />
            <input
              aria-label="Search domains from hero"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search premium domains..."
              className="w-full h-13 py-3.5 pl-11 pr-32 rounded-full bg-[#f3ecd9] text-[#0c3b2a] placeholder:text-[#5d7d6b] outline-none"
            />
            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-10 px-5 rounded-full bg-[#ffd83a] text-[#0c3b2a] font-bold inline-flex items-center gap-1">
              Search <ArrowRight className="size-4" />
            </button>
          </form>
          <button onClick={onBrowse} className="mt-4 text-sm underline underline-offset-4 text-[#f3ecd9]/80 hover:text-[#ffd83a]">
            Browse all 150+ domains
          </button>
        </div>

        <motion.div
          style={{ y }}
          className="relative z-10 mx-6 sm:mx-12 mb-24 lg:mb-0 lg:absolute lg:right-12 lg:top-1/2 lg:-translate-y-1/2 lg:w-[480px] -mt-16 lg:mt-0"
        >
          <div className="rounded-3xl bg-[#f3ecd9] shadow-[0_30px_80px_rgba(0,0,0,0.45)] rotate-[-3deg] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#0c3b2a]/10">
              <span className="size-3 rounded-full bg-[#0c3b2a]/20" />
              <span className="size-3 rounded-full bg-[#0c3b2a]/20" />
              <span className="size-3 rounded-full bg-[#ffd83a]" />
              <span className="ml-3 text-[11px] font-mono-accent tracking-[0.2em] uppercase text-[#0c3b2a]/60">Your next domain</span>
            </div>
            <div className="px-6 sm:px-8 py-10 sm:py-14 font-display text-[#0c3b2a] flex items-baseline flex-wrap gap-y-2 min-h-[150px]">
              <span className="relative inline-flex text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight" aria-hidden>
                <AnimatePresence mode="wait">
                  <motion.span key={TAGS[ext].n} className="inline-flex">
                    {TAGS[ext].n.split('').map((c, i) => (
                      <motion.span
                        key={i}
                        initial={{ y: '110%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '-110%', opacity: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.025 }}
                        className="inline-block"
                      >
                        {c}
                      </motion.span>
                    ))}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="ml-1 inline-flex overflow-hidden rounded-xl bg-[#ffd83a] px-3 py-1 text-4xl sm:text-5xl lg:text-6xl font-bold italic" aria-hidden>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={ext}
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '-100%' }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.25 }}
                    className="inline-block"
                  >
                    {TAGS[ext].e}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="sr-only">{TAGS[ext].n}{TAGS[ext].e}</span>
            </div>
            <div className="flex items-center justify-between px-6 sm:px-8 py-4 bg-[#0c3b2a] text-[#f3ecd9] text-xs font-mono-accent tracking-[0.2em] uppercase">
              <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-[#ffd83a] animate-pulse" /> Curated listing</span>
              <span className="text-[#ffd83a]">Make an offer &rarr;</span>
            </div>
          </div>
        </motion.div>

        <motion.div style={{ x: tick }} className="absolute left-6 bottom-6 z-10 whitespace-nowrap font-display italic text-2xl sm:text-3xl text-[#8fc0a6]">
          {[...NAMES, ...NAMES].map((n, i) => (
            <span key={i} className="mr-6">{n} <span className="mx-3 text-[#ffd83a]">&bull;</span></span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
