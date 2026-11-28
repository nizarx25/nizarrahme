'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useNavigation } from '@/store/navigation'
import { ArrowRight, Search } from 'lucide-react'

const CARDS = [
  { name: 'FogEngine.ai', tag: 'AI infrastructure', blurb: 'A short, memorable name for a cloud or edge AI platform.', theme: 'cream' },
  { name: 'VectorSift.com', tag: 'AI / Data', blurb: 'Fits search, retrieval and vector database products.', theme: 'yellow' },
  { name: 'Sunly.si', tag: 'Brand / Energy', blurb: 'Warm and simple, made for a consumer or energy brand.', theme: 'green' },
] as const
const THEMES = {
  cream: { card: 'bg-[#f3ecd9] text-[#0c3b2a]', sub: 'text-[#0c3b2a]/70', pill: 'bg-[#0c3b2a] text-[#f3ecd9]', btn: 'bg-[#0c3b2a] text-[#f3ecd9]' },
  yellow: { card: 'bg-[#ffd83a] text-[#0c3b2a]', sub: 'text-[#0c3b2a]/75', pill: 'bg-[#0c3b2a] text-[#ffd83a]', btn: 'bg-[#0c3b2a] text-[#ffd83a]' },
  green: { card: 'bg-[#0a2a1d] text-[#f3ecd9] border-2 border-[#ffd83a]', sub: 'text-[#cfe3d6]', pill: 'bg-[#ffd83a] text-[#0c3b2a]', btn: 'bg-[#ffd83a] text-[#0c3b2a]' },
} as const
const NAMES = ['BaseOPolis.com', 'FogEngine.ai', 'KernEngine.com', 'VectorSift.com', 'DnaBite.com', 'MythosScale.com', 'FinTriva.com']

export function EditorialHero({ onSearch, onBrowse }: { onSearch: (q: string) => void; onBrowse: () => void }) {
  const ref = useRef<HTMLElement>(null)
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const dir = useRef(1)
  const idxRef = useRef(0)
  const lock = useRef(0)
  const touchX = useRef<number | null>(null)
  const reduce = useReducedMotion()
  const nav = useNavigation()
  const go = (n: number, d: number) => {
    dir.current = d
    idxRef.current = n
    setIdx(n)
  }
  useEffect(() => {
    // Wheel drives the cards while the hero is at the top. After the last card, scrolling continues down the page.
    const onWheel = (e: WheelEvent) => {
      if (document.querySelector('[role="dialog"]') || Math.abs(e.deltaY) < 4 || e.ctrlKey) return
      const i = idxRef.current
      const atTop = window.scrollY < 40
      if (e.deltaY > 0 && atTop && i < CARDS.length - 1) {
        e.preventDefault()
        if (Date.now() - lock.current > 650) { lock.current = Date.now(); go(i + 1, 1) }
      } else if (e.deltaY < 0 && atTop && i > 0) {
        e.preventDefault()
        if (Date.now() - lock.current > 650) { lock.current = Date.now(); go(i - 1, -1) }
      }
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const sp = useSpring(scrollYProgress, { stiffness: 80, damping: 22 })
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

        <div
          className="no-shine relative z-10 mx-6 sm:mx-12 mb-24 lg:mb-0 lg:absolute lg:right-12 lg:top-1/2 lg:-translate-y-1/2 lg:w-[460px] -mt-16 lg:mt-0"
          style={{ perspective: 1400, touchAction: 'pan-y' }}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            touchX.current = null
            if (dx < -40 && idx < CARDS.length - 1) go(idx + 1, 1)
            else if (dx > 40 && idx > 0) go(idx - 1, -1)
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {(() => {
              const c = CARDS[idx]
              const t = THEMES[c.theme]
              const d = dir.current
              return (
                <motion.div
                  key={c.name}
                  initial={reduce ? { opacity: 0 } : { rotateX: -80 * d, opacity: 0, y: 40 * d }}
                  animate={reduce ? { opacity: 1 } : { rotateX: 0, opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { rotateX: 80 * d, opacity: 0, y: -40 * d }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: 'center center' }}
                  className={`rounded-3xl p-7 sm:p-9 shadow-[0_30px_80px_rgba(0,0,0,0.45)] ${t.card}`}
                >
                  <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-mono-accent tracking-[0.2em] uppercase ${t.pill}`}>{c.tag}</span>
                  <h2 className="hover-name mt-8 font-display font-bold tracking-tight leading-none text-[2.4rem] sm:text-5xl break-words">{c.name}</h2>
                  <p className={`mt-4 text-sm sm:text-base max-w-[34ch] ${t.sub}`}>{c.blurb}</p>
                  <div className="mt-8 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => { nav.setOfferDomainName(c.name); nav.setShowOfferForm(true) }}
                      className={`h-11 px-5 rounded-full font-bold inline-flex items-center gap-2 whitespace-nowrap ${t.btn}`}
                    >
                      Make an Offer <ArrowRight className="size-4" />
                    </button>
                    <span className={`text-[11px] whitespace-nowrap font-mono-accent tracking-[0.15em] ${t.sub}`}>{String(idx + 1).padStart(2, '0')} / {String(CARDS.length).padStart(2, '0')}</span>
                  </div>
                </motion.div>
              )
            })()}
          </AnimatePresence>
          <div className="mt-5 flex justify-center gap-2" role="group" aria-label="Featured domain cards">
            {CARDS.map((c, i) => (
              <button
                key={c.name}
                type="button"
                aria-label={`Show ${c.name}`}
                aria-current={i === idx}
                onClick={() => go(i, i > idx ? 1 : -1)}
                className={`h-2 rounded-full transition-all ${i === idx ? 'w-8 bg-[#ffd83a]' : 'w-2 bg-[#f3ecd9]/40'}`}
              />
            ))}
          </div>
        </div>

        <motion.div style={{ x: tick }} className="absolute left-6 bottom-6 z-10 whitespace-nowrap font-display italic text-2xl sm:text-3xl text-[#8fc0a6]">
          {[...NAMES, ...NAMES].map((n, i) => (
            <span key={i} className="mr-6">{n} <span className="mx-3 text-[#ffd83a]">&bull;</span></span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
