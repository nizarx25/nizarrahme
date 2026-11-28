'use client'

import { useRef, useState, type FormEvent } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { ArrowRight, Search } from 'lucide-react'

type Stage = { key: string; word: string; accent: string; line: string; names: string[] }

const STAGES: Stage[] = [
  { key: 'ai', word: 'AI', accent: '#19ffb0', line: 'Names for models, agents and the infrastructure behind them.', names: ['FogEngine.com', 'VectorSift.com', 'ModelCompress.com'] },
  { key: 'saas', word: 'SaaS', accent: '#4da3ff', line: 'Names that scale from first customer to enterprise.', names: ['MythosScale.com', 'PartnerPods.com', 'ScopingTool.com'] },
  { key: 'fintech', word: 'Fintech', accent: '#ff6a2e', line: 'Trust, payments and money, in a name people remember.', names: ['FinTriva.com', 'BulwarkPay.com', 'SortedLoans.com'] },
  { key: 'brand', word: 'Brand', accent: '#d86bff', line: 'Short, brandable and ready to become a company.', names: ['BaseOPolis.com', 'DnaBite.com', 'Sunly.si'] },
]

const ACCENTS = STAGES.map((s) => s.accent)
const POINTS = STAGES.map((_, i) => i / (STAGES.length - 1))

export function CinematicHero({
  onSearch,
  onBrowse,
}: {
  onSearch: (q: string) => void
  onBrowse: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [stage, setStage] = useState(0)
  const [q, setQ] = useState('')

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 64px', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = Math.min(STAGES.length - 1, Math.max(0, Math.round(v * (STAGES.length - 1))))
    setStage((s) => (s === i ? s : i))
  })

  const accent = useTransform(p, POINTS, ACCENTS)
  const orbBg = useMotionTemplate`radial-gradient(circle at 35% 30%, ${accent} 0, ${accent} 12%, #04100c 74%)`
  const glow = useMotionTemplate`0 0 160px 30px ${accent}55, inset -50px -50px 110px rgba(0,0,0,0.75)`
  const orbScale = useTransform(p, [0, 0.33, 0.66, 1], [1, 1.12, 0.92, 1.15])
  const orbY = useTransform(p, [0, 1], ['0%', '-8%'])
  const ringRot = useTransform(p, [0, 1], [0, 220])
  const ringRot2 = useTransform(p, [0, 1], [0, -160])
  const wordX = useTransform(p, [0, 1], ['4%', '-4%'])

  const s = STAGES[stage]

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (q.trim()) onSearch(q)
  }

  return (
    <div ref={ref} className="relative" style={{ height: reduce ? 'auto' : '380vh' }}>
      <div className="sticky top-[64px] h-[calc(100vh-64px)] min-h-[600px] overflow-hidden">
        {/* orb + rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div style={{ scale: orbScale, y: orbY }} className="relative size-[68vmin] max-w-[620px] max-h-[620px]">
            <motion.div className="absolute inset-0 rounded-full" style={{ background: orbBg, boxShadow: glow }} />
            <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 32% 26%, rgba(255,255,255,0.5), rgba(255,255,255,0) 32%)' }} />
            <motion.div
              className="absolute -inset-[24%] rounded-full border"
              style={{ rotateX: 72, rotateZ: ringRot, borderColor: accent, opacity: 0.45 }}
            />
            <motion.div
              className="absolute -inset-[42%] rounded-full border"
              style={{ rotateX: 72, rotateZ: ringRot2, borderColor: accent, opacity: 0.22 }}
            />
          </motion.div>
        </div>

        {/* giant word */}
        <motion.div style={{ x: wordX }} className="absolute inset-x-0 top-[26%] sm:top-[24%] flex justify-center pointer-events-none select-none">
          <AnimatePresence mode="wait">
            <motion.span
              key={s.key}
              initial={{ opacity: 0, y: 60, filter: 'blur(14px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -60, filter: 'blur(14px)' }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="font-display font-bold leading-none tracking-[-0.05em] text-white text-[26vw] sm:text-[20vw] lg:text-[16rem]"
              style={{ textShadow: `0 0 80px ${s.accent}88` }}
            >
              {s.word}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* top label + h1 */}
        <div className="absolute top-[11%] inset-x-0 text-center px-4">
          <span className="inline-block px-4 py-1.5 rounded-full border border-white/10 text-[11px] font-mono-accent tracking-[0.25em] uppercase" style={{ color: s.accent }}>
            Premium Digital Real Estate
          </span>
          <h1 className="sr-only">Own the Name Behind What&rsquo;s Next.</h1>
        </div>

        {/* bottom content */}
        <div className="absolute bottom-[5%] inset-x-0 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-base sm:text-lg text-[#c3d3ce]">{s.line}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {s.names.map((n) => (
                    <button
                      key={n}
                      onClick={onBrowse}
                      className="px-3.5 py-1.5 rounded-full text-sm font-mono-accent border bg-black/40 backdrop-blur hover:bg-white/10 transition-colors"
                      style={{ borderColor: `${s.accent}66`, color: s.accent }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <form onSubmit={submit} className="mt-6 max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#718581]" />
              <input
                aria-label="Search domains from hero"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search premium domains..."
                className="w-full h-12 pl-11 pr-28 rounded-full bg-black/50 backdrop-blur border border-white/10 text-white placeholder:text-[#718581] outline-none focus:border-white/30"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-5 rounded-full font-semibold text-[#04100c] inline-flex items-center gap-1"
                style={{ background: s.accent }}
              >
                Search <ArrowRight className="size-4" />
              </button>
            </form>
          </div>
        </div>

        {/* stage index */}
        <div className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col gap-3 font-mono-accent text-xs">
          {STAGES.map((x, i) => (
            <span key={x.key} className="transition-colors" style={{ color: i === stage ? x.accent : '#2f4a41' }}>
              0{i + 1} &nbsp;{x.word}
            </span>
          ))}
        </div>
        <div className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 font-mono-accent text-[11px] tracking-[0.4em] text-[#2f4a41] [writing-mode:vertical-rl]">
          SCROLL TO MORPH
        </div>
      </div>
    </div>
  )
}
