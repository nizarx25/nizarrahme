'use client'

import { useRef, useState, type FormEvent } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ArrowRight, Search } from 'lucide-react'

const NAMES = ['BaseOPolis.com', 'FogEngine.ai', 'KernEngine.com', 'VectorSift.com', 'DnaBite.com', 'MythosScale.com', 'FinTriva.com']

export function EditorialHero({ onSearch, onBrowse }: { onSearch: (q: string) => void; onBrowse: () => void }) {
  const ref = useRef<HTMLElement>(null)
  const [q, setQ] = useState('')
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const sp = useSpring(scrollYProgress, { stiffness: 80, damping: 22 })
  const rot = useTransform(sp, [0, 1], [0, 300])
  const y = useTransform(sp, [0, 1], [0, 140])
  const innerRot = useTransform(sp, [0, 1], [-8, 40])
  const tick = useTransform(sp, [0, 1], ['0%', '-35%'])
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (q.trim()) onSearch(q)
  }
  return (
    <section ref={ref} className="relative px-3 sm:px-5 pt-4 pb-10">
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[44px] bg-[#0c3b2a] border border-surface-border min-h-[640px] lg:min-h-[760px]">
        <div className="relative z-10 px-6 sm:px-12 pt-12 sm:pt-16 pb-28 max-w-[900px]">
          <span className="inline-block mb-6 px-4 py-1.5 rounded-full border border-[#f3ecd9]/20 text-[11px] font-mono-accent tracking-[0.25em] uppercase text-[#ffd83a]">
            Premium Digital Real Estate
          </span>
          <h1 className="font-display text-[3.2rem] sm:text-[5.5rem] lg:text-[7.5rem] leading-[0.92] tracking-[-0.04em] text-[#f3ecd9]">
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
          style={{ rotate: rot, y }}
          className="absolute -right-24 sm:-right-16 bottom-[-120px] sm:bottom-[-140px] size-[360px] sm:size-[520px] lg:size-[640px] rounded-full bg-[#ffd83a] flex items-center justify-center"
        >
          <motion.div
            style={{ rotate: innerRot }}
            className="size-[52%] rounded-full bg-[#f3ecd9] flex items-center justify-center text-[#0c3b2a] font-display italic text-5xl sm:text-6xl lg:text-7xl"
          >
            .com
          </motion.div>
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
