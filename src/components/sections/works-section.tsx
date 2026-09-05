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
  onOpen: (p: Project) => void
}) {
  const reduce = useReducedMotion()
  const cardRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [hover, setHover] = useState(false)
  const [spot, setSpot] = useState({ x: 50, y: 50 })

  // 3D tilt values
  const rotateX = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 })
  const liftZ = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 })

  // Parallax scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ['-6%', '10%'])
  const cardOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [0, 1, 1, 0.95]
  )
  const labelY = useTransform(scrollYProgress, [0, 1], ['8%', '-12%'])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reduce || !cardRef.current) return
    const r = cardRef.current.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * 100
    const py = ((e.clientY - r.top) / r.height) * 100
    setSpot({ x: px, y: py })
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
    rotateY.set(dx * 8)
    rotateX.set(-dy * 8)
    liftZ.set(1)
  }
  const handleMouseLeave = () => {
    setHover(false)
    rotateX.set(0)
    rotateY.set(0)
    liftZ.set(0)
  }

  const isReversed = index % 2 === 1
  const primary = project.images[0]
  const secondary = project.images[1] ?? project.images[0]

  return (
    <Reveal delay={index * 0.05}>
      <motion.article
        ref={containerRef}
        style={{ opacity: reduce ? undefined : cardOpacity }}
        className={[
          'group relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center',
          'py-10 lg:py-16 first:pt-0',
        ].join(' ')}
      >
        {/* Image / card block — 3D tilt */}
        <div
          className={[
            'relative lg:col-span-7 [perspective:1500px]',
            isReversed ? 'lg:order-2 lg:col-start-6' : 'lg:order-1',
          ].join(' ')}
        >
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={handleMouseLeave}
            style={{
              rotateX: reduce ? undefined : rotateX,
              rotateY: reduce ? undefined : rotateY,
              z: reduce ? undefined : liftZ,
              transformStyle: 'preserve-3d',
            }}
            className="relative aspect-[16/11] w-full"
          >
            {/* Outer frame — animated gradient border */}
            <div className="absolute -inset-px rounded-[26px] bg-gradient-to-br from-teal/0 via-coral/0 to-teal-soft/0 p-[1px] transition-all duration-700 group-hover:from-teal/60 group-hover:via-coral/40 group-hover:to-teal-soft/60">
              <div className="relative h-full w-full overflow-hidden rounded-[25px] surface-bg">
                {/* Primary image with parallax */}
                {primary && (
                  <motion.div
                    style={{ y: imageY }}
                    className="absolute inset-[-8%]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={primary}
                      alt={`${project.title} — primary view`}
                      loading="lazy"
                      className="h-full w-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-110"
                    />
                  </motion.div>
                )}

                {/* Top + bottom gradient scrims */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-black/65 via-black/20 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Cursor spotlight — follows mouse on hover */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 mix-blend-screen"
                  style={{
                    background: `radial-gradient(420px circle at ${spot.x}% ${spot.y}%, rgba(0, 229, 176, 0.22), transparent 55%)`,
                  }}
                />
                {/* Secondary radial highlight */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(280px circle at ${spot.x}% ${spot.y}%, rgba(255, 77, 46, 0.15), transparent 60%)`,
                  }}
                />

                {/* Grain overlay */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.7'/></svg>\")",
                    backgroundSize: '160px 160px',
                  }}
                />

                {/* Animated scan line */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <motion.div
                    initial={{ y: '-100%' }}
                    animate={hover && !reduce ? { y: '100%' } : { y: '-100%' }}
                    transition={{ duration: 1.4, ease: 'easeInOut' }}
                    className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-teal/20 to-transparent"
                  />
                </div>

                {/* Top-left index pill */}
                <div
                  className="absolute left-5 top-5 z-10"
                  style={{ transform: 'translateZ(40px)' }}
                >
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/40 px-3.5 py-1.5 text-[10px] font-mono-accent uppercase tracking-[0.22em] text-white backdrop-blur-xl">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-70" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
                    </span>
                    <span className="text-teal">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="h-px w-4 bg-white/30" />
                    <span>{project.category}</span>
                  </span>
                </div>

                {/* Top-right live badge */}
                {project.website && (
                  <div
                    className="absolute right-5 top-5 z-10"
                    style={{ transform: 'translateZ(40px)' }}
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/30 bg-teal/10 px-2.5 py-1 text-[9px] font-mono-accent uppercase tracking-[0.22em] text-teal backdrop-blur-xl">
                      <span className="h-1 w-1 rounded-full bg-teal animate-pulse" />
                      Live
                    </span>
                  </div>
                )}

                {/* Bottom content — title strip */}
                <div
                  className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7"
                  style={{ transform: 'translateZ(50px)' }}
                >
                  <p className="text-[10px] font-mono-accent uppercase tracking-[0.25em] text-teal mb-2 inline-flex items-center gap-2">
                    <span className="inline-block h-px w-5 bg-teal/60" />
                    {project.year} · {project.region}
                  </p>
                  <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-bold leading-[1.1] text-white max-w-[90%]">
                    {project.title}
                  </h3>
                </div>

                {/* Open button (magnetic) */}
                <div
                  className="absolute bottom-5 right-5 z-20"
                  style={{ transform: 'translateZ(60px)' }}
                >
                  <MagneticButton
                    onClick={() => onOpen(project)}
                    ariaLabel={`View ${project.title}`}
                    className="group/open relative inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-background/85 text-white backdrop-blur-xl transition-all duration-500 group-hover:border-teal/60 group-hover:text-teal"
                  >
                    <span className="absolute inset-0 rounded-full bg-teal/0 transition-all duration-500 group-hover:bg-teal/15 group-hover:scale-150 group-hover:opacity-0" />
                    <ArrowUpRight className="relative h-5 w-5 transition-all duration-500 group-hover:rotate-45" />
                  </MagneticButton>
                </div>

                {/* Reflective gloss */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.07] to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              </div>
            </div>

            {/* Outer glow shadow on hover */}
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] bg-teal/0 blur-3xl transition-all duration-700 group-hover:bg-teal/20" />
          </motion.div>

          {/* Floating secondary thumbnail — peeking card */}
          <motion.div
            style={{ y: reduce ? undefined : labelY }}
            className={[
              'absolute -bottom-10 z-20 hidden md:block',
              isReversed ? 'left-2 lg:-left-6' : 'right-2 lg:-right-6',
            ].join(' ')}
          >
            <div className="group/thumb relative h-28 w-40 overflow-hidden rounded-[16px] border border-surface-border surface-bg shadow-2xl transition-transform duration-500 hover:scale-105 hover:-rotate-2">
              {secondary && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={secondary}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="h-full w-full object-cover opacity-95"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <span className="text-[9px] font-mono-accent uppercase tracking-[0.2em] text-white/80">
                  View 02
                </span>
                <Eye className="h-3.5 w-3.5 text-teal" />
              </div>
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/15 rounded-[16px]" />
            </div>
          </motion.div>
        </div>

        {/* Text block */}
        <div
          className={[
            'relative lg:col-span-5',
            isReversed ? 'lg:order-1 lg:col-start-1' : 'lg:order-2',
          ].join(' ')}
        >
          <motion.div
            initial={false}
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          >
            <div className="mb-4 inline-flex items-center gap-2">
              <span className="text-[10px] font-mono-accent uppercase tracking-[0.25em] text-teal">
                {String(index + 1).padStart(2, '0')} /
                {String(PROJECTS.length).padStart(2, '0')}
              </span>
              <span className="h-px w-8 bg-gradient-to-r from-teal/60 to-transparent" />
            </div>

            <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.02] text-white">
              <span className="bg-gradient-to-br from-white via-white to-white/70 bg-clip-text text-transparent">
                {project.title}
              </span>
            </h3>

            <p className="mt-4 text-[#B8C8C4] leading-relaxed text-sm sm:text-base">
              {project.summary}
            </p>

            {project.highlights && project.highlights.length > 0 && (
              <ul className="mt-6 space-y-2.5">
                {project.highlights.slice(0, 3).map((h, i) => (
                  <motion.li
                    key={h}
                    initial={reduce ? false : { opacity: 0, x: -8 }}
                    whileInView={
                      reduce ? undefined : { opacity: 1, x: 0 }
                    }
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="flex items-start gap-3 text-sm text-[#B8C8C4]"
                  >
                    <span className="mt-1.5 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-gradient-to-r from-teal to-coral" />
                    <span>{h}</span>
                  </motion.li>
                ))}
              </ul>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                onClick={() => onOpen(project)}
                className="relative overflow-hidden bg-gradient-to-r from-teal to-teal-soft text-background hover:shadow-[0_0_30px_-5px_rgba(0,229,176,0.6)] transition-shadow"
              >
                <span className="relative z-10 inline-flex items-center gap-2">
                  View case study
                  <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 -z-0 bg-gradient-to-r from-teal-soft to-teal opacity-0 transition-opacity hover:opacity-100" />
              </Button>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-border surface-bg px-3 py-1.5 text-xs text-[#B8C8C4]">
                <MapPin className="h-3.5 w-3.5 text-teal" />
                {project.country}
              </span>
            </div>
          </motion.div>
        </div>
      </motion.article>
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
      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono-accent uppercase tracking-[0.25em] text-[#718581]">
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
}: {
  project: Project | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onOpenChange])

  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    setActiveImage(0)
  }, [project?.slug])

  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl w-[96vw] max-h-[94vh] overflow-y-auto surface-border surface-bg p-0 sm:rounded-[28px]"
        aria-describedby={undefined}
      >
        {/* Hero */}
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-surface-border surface-bg">
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
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white hover:bg-black/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 backdrop-blur"
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
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#B8C8C4]">
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
            <p className="ml-auto text-[11px] font-mono-accent uppercase tracking-[0.22em] text-[#718581]">
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
              <p className="mt-2 text-sm leading-relaxed text-[#B8C8C4]">
                {project.about}
              </p>
            </section>

            <section>
              <h4 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
                <Layers className="h-4 w-4 text-teal" />
                How it was designed
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-[#B8C8C4]">
                {project.designMethod}
              </p>
            </section>
          </div>

          <div className="p-5 sm:p-7 space-y-6 surface-bg/40">
            {project.highlights && project.highlights.length > 0 && (
              <section>
                <h4 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-[#718581]">
                  Highlights
                </h4>
                <ul className="mt-3 grid grid-cols-1 gap-2">
                  {project.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2.5 rounded-[12px] border border-surface-border surface-bg p-3 text-sm text-[#B8C8C4]"
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
              <h4 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-[#718581]">
                Summary
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-[#B8C8C4]">
                {project.summary}
              </p>
            </section>

            {(project.facebook || project.instagram) && (
              <>
                <Separator className="bg-surface-border" />
                <section>
                  <h4 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-[#718581]">
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
              <p className="mt-4 text-[#718581] max-w-xl leading-relaxed text-sm sm:text-base">
                A handful of recent projects — websites, brand systems, and
                product surfaces — designed end-to-end with the same
                principles I apply to domain selection: clarity, restraint,
                and a sense of intent.
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1">
              <p className="text-[11px] font-mono-accent uppercase tracking-[0.25em] text-[#718581]">
                {String(PROJECTS.length).padStart(2, '0')} projects
              </p>
              <p className="text-[11px] font-mono-accent uppercase tracking-[0.25em] text-[#718581]">
                2015 — 2026
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
              onOpen={(proj) => {
                setActive(proj)
                setOpen(true)
              }}
            />
            {idx < PROJECTS.length - 1 && <SectionDivider />}
          </div>
        ))}
      </div>

      <ProjectDialog project={active} open={open} onOpenChange={setOpen} />
    </section>
  )
}
