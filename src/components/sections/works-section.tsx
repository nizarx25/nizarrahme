'use client'

import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  MapPin,
  Sparkles,
  X,
  Globe,
  Layers,
  Quote,
  ArrowUp,
  Eye,
  Zap,
  MoveRight,
} from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PROJECTS, type Project } from '@/data/works'

/* -------------------------------------------------------------------------- */
/* Reveal helper                                                              */
/* -------------------------------------------------------------------------- */

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/* Magnetic button wrapper                                                    */
/* -------------------------------------------------------------------------- */

function MagneticButton({
  children,
  onClick,
  className = '',
  ariaLabel,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  ariaLabel?: string
}) {
  const ref = useRef<HTMLButtonElement | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 22 })
  const sy = useSpring(y, { stiffness: 260, damping: 22 })
  const reduce = useReducedMotion()

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    x.set(dx * 0.35)
    y.set(dy * 0.35)
  }
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: sx, y: sy }}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </motion.button>
  )
}

/* -------------------------------------------------------------------------- */
/* SpotlightCard — advanced 3D tilt with cursor spotlight + grain             */
/* -------------------------------------------------------------------------- */

function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project
  index: number
  onOpen: (p: Project, imageIndex?: number) => void
}) {
  const isReversed = index % 2 === 1
  const imgs = project.images
  const [cover, setCover] = useState(0)

  return (
    <Reveal delay={index * 0.05}>
      <article className="group relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center py-10 lg:py-16 first:pt-0">
        {/* Images: one cover plus a strip of equal thumbnails */}
        <div className={['lg:col-span-7', isReversed ? 'lg:order-2' : 'lg:order-1'].join(' ')}>
          <button
            type="button"
            onClick={() => onOpen(project, cover)}
            aria-label={`Open ${project.title}`}
            className="domain-card-hover group/cover relative block aspect-[16/10] w-full overflow-hidden rounded-[20px] border border-surface-border bg-elevated text-left"
          >
            {imgs[cover] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imgs[cover]}
                alt={`${project.title} view ${cover + 1}`}
                loading="lazy"
                className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover/cover:scale-105"
              />
            )}
            <span className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#FFFDF8]/95 px-3 py-1.5 text-[10px] font-mono-accent uppercase tracking-[0.2em] text-[#0B0B0A] shadow">
              <span className="text-[#0E6B42]">{String(index + 1).padStart(2, '0')}</span>
              {project.category}
            </span>
            <span className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-[#1F4D3A] px-4 py-2 text-xs font-medium text-[#F6F1E8] opacity-0 translate-y-2 transition-all duration-300 group-hover/cover:opacity-100 group-hover/cover:translate-y-0">
              <Eye className="h-3.5 w-3.5" /> View
            </span>
          </button>

          {imgs.length > 1 && (
            <div className="mt-3 flex gap-3">
              {imgs.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onMouseEnter={() => setCover(i)}
                  onFocus={() => setCover(i)}
                  onClick={() => onOpen(project, i)}
                  aria-label={`Open ${project.title} image ${i + 1}`}
                  className={[
                    'relative aspect-[16/10] w-28 sm:w-36 overflow-hidden rounded-[12px] border-2 transition-all duration-300 hover:-translate-y-1',
                    cover === i ? 'border-[#0E6B42] shadow-md' : 'border-surface-border opacity-80 hover:opacity-100',
                  ].join(' ')}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" aria-hidden loading="lazy" className="h-full w-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text */}
        <div className={['lg:col-span-5', isReversed ? 'lg:order-1' : 'lg:order-2'].join(' ')}>
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="text-[10px] font-mono-accent uppercase tracking-[0.25em] text-teal">
              {String(index + 1).padStart(2, '0')} /{String(PROJECTS.length).padStart(2, '0')}
            </span>
            <span className="h-px w-8 bg-teal/50" />
            <span className="text-[10px] font-mono-accent uppercase tracking-[0.25em] text-[var(--ed-mute)]">
              {project.year} · {project.region}
            </span>
          </div>

          <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.05] text-white">
            {project.title}
          </h3>

          <p className="mt-4 text-[var(--ed-soft)] leading-relaxed text-sm sm:text-base">{project.summary}</p>

          {project.highlights && project.highlights.length > 0 && (
            <ul className="mt-6 space-y-2.5">
              {project.highlights.slice(0, 3).map((h) => (
                <li key={h} className="flex items-start gap-3 text-sm text-[var(--ed-soft)]">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0E6B42]" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => onOpen(project, cover)}
              className="bg-[#1F4D3A] text-[#F6F1E8] hover:bg-[#2B6650] rounded-full px-6"
            >
              <span className="inline-flex items-center gap-2">
                View case study
                <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-border surface-bg px-3 py-1.5 text-xs text-[var(--ed-soft)]">
              <MapPin className="h-3.5 w-3.5 text-teal" />
              {project.country}
            </span>
          </div>
        </div>
      </article>
    </Reveal>
  )
}

/* -------------------------------------------------------------------------- */
/* Section divider between cards                                             */
/* -------------------------------------------------------------------------- */

function SectionDivider() {
  return (
    <div className="my-2 sm:my-6 flex items-center gap-3" aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-surface-border to-transparent" />
      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono-accent uppercase tracking-[0.25em] text-[var(--ed-mute)]">
        <Sparkles className="h-3 w-3 text-teal" />
        <span>Next project</span>
        <Zap className="h-3 w-3 text-coral" />
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-surface-border to-transparent" />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Dialog                                                                     */
/* -------------------------------------------------------------------------- */

function ProjectDialog({
  project,
  open,
  onOpenChange,
  initialImage = 0,
}: {
  project: Project | null
  open: boolean
  onOpenChange: (v: boolean) => void
  initialImage?: number
}) {
  const [activeImage, setActiveImage] = useState(initialImage)
  const count = project?.images.length ?? 0

  useEffect(() => {
    setActiveImage(initialImage)
  }, [project?.slug, initialImage, open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
      if (count > 1 && e.key === 'ArrowRight') setActiveImage((i) => (i + 1) % count)
      if (count > 1 && e.key === 'ArrowLeft') setActiveImage((i) => (i - 1 + count) % count)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onOpenChange, count])

  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!block max-w-5xl sm:max-w-5xl w-[96vw] max-h-[94vh] overflow-y-auto surface-border surface-bg p-0 sm:rounded-[28px]"
        aria-describedby={undefined}
      >
        {/* Hero */}
        <div className="relative aspect-[16/9] max-h-[52vh] w-full overflow-hidden border-b border-surface-border surface-bg">
          {project.images[activeImage] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={activeImage}
              src={project.images[activeImage]}
              alt={`${project.title} — view ${activeImage + 1}`}
              className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
          {count > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => setActiveImage((i) => (i - 1 + count) % count)}
                className="absolute left-4 top-1/2 z-20 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-[#FFFDF8]/95 text-[#0B0B0A] shadow-lg text-2xl leading-none hover:bg-[#1F4D3A] hover:!text-[#F6F1E8]"
              >
                &lsaquo;
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() => setActiveImage((i) => (i + 1) % count)}
                className="absolute right-4 top-1/2 z-20 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-[#FFFDF8]/95 text-[#0B0B0A] shadow-lg text-2xl leading-none hover:bg-[#1F4D3A] hover:!text-[#F6F1E8]"
              >
                &rsaquo;
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-[#F6F1E8] hover:bg-black/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 backdrop-blur"
            aria-label="Close project"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <p className="text-[10px] font-mono-accent uppercase tracking-[0.25em] text-teal">
              {project.category} · {project.year}
            </p>
            <DialogTitle className="mt-1 font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              {project.title}
            </DialogTitle>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--ed-soft)]">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-teal" />
                {project.region}, {project.country}
              </span>
              {project.website && (
                <a
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-teal hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Visit live site
                </a>
              )}
            </p>
          </div>
        </div>

        {/* Thumbnail switcher */}
        {project.images.length > 1 && (
          <div className="flex items-center gap-3 px-5 sm:px-7 py-4 border-b border-surface-border surface-bg">
            {project.images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveImage(i)}
                className={[
                  'relative h-14 w-20 overflow-hidden rounded-[10px] border transition-all',
                  activeImage === i
                    ? 'border-teal/60 ring-1 ring-teal/40'
                    : 'border-surface-border opacity-60 hover:opacity-100',
                ].join(' ')}
                aria-label={`View image ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  aria-hidden
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
            <p className="ml-auto text-[11px] font-mono-accent uppercase tracking-[0.22em] text-[var(--ed-mute)]">
              {String(activeImage + 1).padStart(2, '0')} /{' '}
              {String(project.images.length).padStart(2, '0')}
            </p>
          </div>
        )}

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-0">
          <div className="p-5 sm:p-7 space-y-6 border-b border-surface-border lg:border-b-0 lg:border-r">
            <section>
              <h4 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
                <Quote className="h-4 w-4 text-teal" />
                About the work
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ed-soft)]">
                {project.about}
              </p>
            </section>

            <section>
              <h4 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
                <Layers className="h-4 w-4 text-teal" />
                How it was designed
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ed-soft)]">
                {project.designMethod}
              </p>
            </section>
          </div>

          <div className="p-5 sm:p-7 space-y-6 surface-bg/40">
            {project.highlights && project.highlights.length > 0 && (
              <section>
                <h4 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ed-mute)]">
                  Highlights
                </h4>
                <ul className="mt-3 grid grid-cols-1 gap-2">
                  {project.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2.5 rounded-[12px] border border-surface-border surface-bg p-3 text-sm text-[var(--ed-soft)]"
                    >
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-teal" />
                      <span className="leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Separator className="bg-surface-border" />

            <section>
              <h4 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ed-mute)]">
                Summary
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ed-soft)]">
                {project.summary}
              </p>
            </section>

            {(project.facebook || project.instagram) && (
              <>
                <Separator className="bg-surface-border" />
                <section>
                  <h4 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ed-mute)]">
                    Connect
                  </h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.facebook && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-surface-border"
                      >
                        <a
                          href={project.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} on Facebook`}
                        >
                          <Facebook className="h-4 w-4" />
                          Facebook
                        </a>
                      </Button>
                    )}
                    {project.instagram && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-surface-border"
                      >
                        <a
                          href={project.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} on Instagram`}
                        >
                          <Instagram className="h-4 w-4" />
                          Instagram
                        </a>
                      </Button>
                    )}
                    {project.website && (
                      <Button asChild variant="default" size="sm">
                        <a
                          href={project.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Visit ${project.title} live site`}
                        >
                          Visit site
                          <ArrowUp className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/* Section                                                                    */
/* -------------------------------------------------------------------------- */

export function WorksSection() {
  const [active, setActive] = useState<Project | null>(null)
  const [open, setOpen] = useState(false)
  const [startImage, setStartImage] = useState(0)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLElement | null>(null)

  // Track mouse for ambient orbs
  useEffect(() => {
    if (!sectionRef.current) return
    const handler = (e: MouseEvent) => {
      const r = sectionRef.current?.getBoundingClientRect()
      if (!r) return
      setMouse({
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      })
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-24 overflow-hidden"
      aria-labelledby="works-heading"
    >
      {/* Ambient background orbs that follow mouse */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div
          className="absolute h-[480px] w-[480px] rounded-full blur-[120px] opacity-30 transition-all duration-1000 ease-out"
          style={{
            background:
              'radial-gradient(circle, rgba(0,229,176,0.5) 0%, transparent 70%)',
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
            'linear-gradient(rgba(0,229,176,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,176,0.5) 1px, transparent 1px)',
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
              <p className="mt-4 text-[var(--ed-mute)] max-w-xl leading-relaxed text-sm sm:text-base">
                A handful of recent projects — websites, brand systems, and
                product surfaces — designed end-to-end with the same
                principles I apply to domain selection: clarity, restraint,
                and a sense of intent.
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1">
              <p className="text-[11px] font-mono-accent uppercase tracking-[0.25em] text-[var(--ed-mute)]">
                {String(PROJECTS.length).padStart(2, '0')} projects
              </p>
              <p className="text-[11px] font-mono-accent uppercase tracking-[0.25em] text-[var(--ed-mute)]">
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

        {/* Cards (zigzag) */}
        {PROJECTS.map((p, idx) => (
          <div key={p.slug}>
            <ProjectCard
              project={p}
              index={idx}
              onOpen={(proj, imageIndex = 0) => {
                setActive(proj)
                setStartImage(imageIndex)
                setOpen(true)
              }}
            />
            {idx < PROJECTS.length - 1 && <SectionDivider />}
          </div>
        ))}
      </div>

      <ProjectDialog project={active} open={open} onOpenChange={setOpen} initialImage={startImage} />
    </section>
  )
}
