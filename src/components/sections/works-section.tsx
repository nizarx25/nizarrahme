'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import { ArrowUp, Facebook, Instagram, MapPin, Sparkles, X } from 'lucide-react'
import { PROJECTS, type Project } from '@/data/works'

const ease = [0.16, 1, 0.3, 1] as const

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* One row: small circle, opens into a fan of screenshots with the info beside it. */
function ProjectRow({
  project,
  index,
  hovered,
  anyHovered,
  modalOpen,
  onHover,
  onOpen,
}: {
  project: Project
  index: number
  hovered: boolean
  anyHovered: boolean
  modalOpen: boolean
  onHover: (slug: string | null) => void
  onOpen: (p: Project) => void
}) {
  const reduce = useReducedMotion()
  const [a, b] = [project.images[0], project.images[1] ?? project.images[0]]
  const counter = `${String(index + 1).padStart(2, '0')} / ${String(PROJECTS.length).padStart(2, '0')}`
  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 230, damping: 24 }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open project ${project.title}`}
      onClick={() => onOpen(project)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(project)
        }
      }}
      onMouseEnter={() => onHover(project.slug)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(project.slug)}
      onBlur={() => onHover(null)}
      className="group relative grid cursor-pointer grid-cols-[88px_1fr] items-center gap-x-5 border-t border-surface-border py-6 !outline-none transition-opacity duration-300 last:border-b md:min-h-[176px] md:grid-cols-[112px_minmax(0,1fr)_minmax(0,420px)] md:gap-x-8"
      style={{ opacity: anyHovered && !hovered ? 0.6 : 1 }}
    >
      <div className="grid place-items-center">
        <motion.div
          layoutId={`proj-img-${project.slug}`}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease }}
          className="relative overflow-hidden bg-elevated"
          style={{
            width: 88,
            height: 88,
            borderRadius: 9999,
            border: '2px solid #ffd83a',
            boxShadow: hovered
              ? '0 0 0 6px rgba(255,216,58,0.14), 0 0 34px rgba(255,216,58,0.3)'
              : '0 0 0 4px rgba(255,216,58,0.08), 0 0 18px rgba(255,216,58,0.12)',
            scale: hovered ? 1.1 : 1,
            visibility: modalOpen ? 'hidden' : 'visible',
          }}
        >
          <img src={a} alt="" width={88} height={88} loading="eager" decoding="async" className="h-full w-full object-cover object-top" />
        </motion.div>
      </div>

      <div className="relative min-w-0 md:h-[150px]">
        <div
          className="transition-opacity duration-300 md:absolute md:inset-0 md:flex md:flex-col md:justify-center"
          style={{ opacity: hovered ? 0 : 1 }}
        >
          <h3 dir="auto" className="text-left font-display text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl">
            {project.title}
          </h3>
          <p dir="auto" className="text-left mt-2 line-clamp-2 text-sm text-[#a9c4b4]">
            {project.category}
          </p>
        </div>
        <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
          {[a, b].map((src, i) => (
            <motion.div
              key={i}
              animate={
                hovered
                  ? { opacity: 1, x: i * 118, y: 0, rotate: i * 3, scale: 1 }
                  : { opacity: 0, x: -30, y: 6, rotate: 0, scale: 0.7 }
              }
              transition={{ ...spring, delay: hovered ? i * 0.05 : 0 }}
              className="absolute left-0 top-0 h-[128px] w-[212px] overflow-hidden rounded-[14px] border border-[#276a4f] bg-elevated shadow-[0_14px_30px_rgba(0,0,0,0.5)]"
              style={{ zIndex: 3 - i }}
            >
              <img src={src} alt="" loading="eager" decoding="async" className="h-full w-full object-cover object-top" />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="hidden min-w-0 md:block">
        <p className="font-mono-accent text-[11px] uppercase tracking-[0.2em] text-teal">
          {counter} &nbsp; {project.year}
        </p>
        <motion.div animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }} transition={{ duration: 0.3, ease }}>
          <h3 dir="auto" className="text-left mt-2 font-display text-xl font-bold leading-snug text-white">
            {project.title}
          </h3>
          <p dir="auto" className="text-left mt-2 line-clamp-2 text-sm leading-relaxed text-[#d4e3d9]">
            {project.summary}
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 font-mono-accent text-xs text-teal">
            <MapPin className="size-3" /> <span dir="auto">{project.country}</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

/* Dialog: the circle image grows into the big image. */
function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const h4 = 'font-display text-xs font-semibold uppercase tracking-[0.18em] text-[#a9c4b4]'
  const ghost = 'inline-flex items-center gap-1.5 rounded-[12px] border border-surface-border px-4 py-2.5 text-sm text-[#d4e3d9] transition-colors hover:border-teal/40 hover:text-white'

  return (
    <motion.div
      className="fixed inset-0 z-[70] grid place-items-center p-3 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="absolute inset-0 bg-[#030a09]/80 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.35, ease }}
        className="relative grid max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[22px] border border-[#276a4f] bg-[#0f4030] shadow-[0_30px_80px_rgba(0,0,0,0.6)] lg:grid-cols-[1.45fr_1fr] lg:overflow-hidden"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full border border-[#276a4f] bg-[#0a3022]/80 text-white transition-colors hover:border-teal hover:text-teal"
        >
          <X className="size-4" />
        </button>

        <div className="p-4 sm:p-6">
          <motion.div
            layoutId={`proj-img-${project.slug}`}
            transition={reduce ? { duration: 0 } : { duration: 0.5, ease }}
            className="relative aspect-[16/10] w-full overflow-hidden border border-[#276a4f] bg-elevated"
            style={{ borderRadius: 16 }}
          >
            <AnimatePresence mode="popLayout">
              <motion.img
                key={active}
                src={project.images[active]}
                alt={`${project.title} screenshot ${active + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            </AnimatePresence>
          </motion.div>
          {project.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {project.images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Screenshot ${i + 1}`}
                  className={`h-[72px] w-[116px] overflow-hidden rounded-[10px] border-2 transition-colors ${
                    active === i ? 'border-teal' : 'border-[#276a4f] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={src} alt="" loading="eager" className="h-full w-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease }}
          className="space-y-5 p-5 sm:p-7 lg:max-h-[92vh] lg:overflow-y-auto"
        >
          <p className="font-mono-accent text-[11px] uppercase tracking-[0.2em] text-teal">
            {project.year} &nbsp;/&nbsp; <span dir="auto">{project.country}</span>
          </p>
          <h2 dir="auto" className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
            {project.title}
          </h2>
          <p dir="auto" className="text-sm leading-relaxed text-[#d4e3d9]">{project.summary}</p>
          <div>
            <h4 className={h4}>About the work</h4>
            <p dir="auto" className="mt-2 text-sm leading-relaxed text-[#d4e3d9]">{project.about}</p>
          </div>
          <div>
            <h4 className={h4}>How it was designed</h4>
            <p dir="auto" className="mt-2 text-sm leading-relaxed text-[#d4e3d9]">{project.designMethod}</p>
          </div>
          {project.highlights && project.highlights.length > 0 && (
            <div>
              <h4 className={h4}>Highlights</h4>
              <ul className="mt-3 grid gap-2">
                {project.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 rounded-[12px] border border-surface-border bg-[#0a3022]/50 p-3 text-sm text-[#d4e3d9]">
                    <Sparkles className="mt-0.5 size-3.5 shrink-0 text-teal" />
                    <span dir="auto" className="leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {project.website && (
              <a href={project.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-[12px] bg-teal px-4 py-2.5 text-sm font-semibold text-[#041412] transition-colors hover:bg-teal-soft">
                Visit site <ArrowUp className="size-3.5 rotate-45" />
              </a>
            )}
            {project.facebook && (
              <a href={project.facebook} target="_blank" rel="noopener noreferrer" className={ghost}>
                <Facebook className="size-4" /> Facebook
              </a>
            )}
            {project.instagram && (
              <a href={project.instagram} target="_blank" rel="noopener noreferrer" className={ghost}>
                <Instagram className="size-4" /> Instagram
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export function WorksSection() {
  const [active, setActive] = useState<Project | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLElement | null>(null)
  const close = useCallback(() => setActive(null), [])

  useEffect(() => {
    if (!sectionRef.current) return
    const handler = (e: MouseEvent) => {
      const r = sectionRef.current?.getBoundingClientRect()
      if (!r) return
      setMouse({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-16 sm:py-24" aria-labelledby="works-heading">
      {/* Ambient background orbs that follow mouse */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div
          className="absolute h-[480px] w-[480px] rounded-full blur-[120px] opacity-30 transition-all duration-1000 ease-out"
          style={{
            background:
              'radial-gradient(circle, rgba(255,216,58,0.5) 0%, transparent 70%)',
            left: `${mouse.x}%`,
            top: `${mouse.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-coral/15 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-teal/10 blur-[120px]" />
      </div>

      {/* Animated grid background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        aria-hidden
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,216,58,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,216,58,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 sm:mb-20">
            <div>
              <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.25em] mb-3 inline-flex items-center gap-2">
                <span className="inline-block h-px w-6 bg-teal/60" />
                Selected Works
              </p>
              <h1
                id="works-heading"
                className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.05]"
              >
                <span className="bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-transparent">
                  A small portfolio,
                </span>
                <br />
                <span className="bg-gradient-to-r from-teal via-teal-soft to-coral bg-clip-text text-transparent">
                  built with care.
                </span>
              </h1>
              <p className="mt-4 text-[#a9c4b4] max-w-xl leading-relaxed text-sm sm:text-base">
                A handful of recent projects — websites, brand systems, and
                product surfaces — designed end-to-end with the same
                principles I apply to domain selection: clarity, restraint,
                and a sense of intent.
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1">
              <p className="text-[11px] font-mono-accent uppercase tracking-[0.25em] text-[#a9c4b4]">
                {String(PROJECTS.length).padStart(2, '0')} projects
              </p>
              <p className="text-[11px] font-mono-accent uppercase tracking-[0.25em] text-[#a9c4b4]">
               2026
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
                </span>
                <span className="text-[10px] font-mono-accent uppercase tracking-[0.22em] text-teal">
                  All live
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        <LayoutGroup>
          <Reveal>
            <div>
              {PROJECTS.map((p, idx) => (
                <ProjectRow
                  key={p.slug}
                  project={p}
                  index={idx}
                  hovered={hovered === p.slug}
                  anyHovered={hovered !== null}
                  modalOpen={active?.slug === p.slug}
                  onHover={setHovered}
                  onOpen={setActive}
                />
              ))}
            </div>
          </Reveal>
          <AnimatePresence>{active && <ProjectModal key={active.slug} project={active} onClose={close} />}</AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  )
}
