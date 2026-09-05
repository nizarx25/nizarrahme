'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
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
  ArrowRight,
  ArrowUp,
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
}: {
  children: React.ReactNode
  delay?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/* Card with parallax tilt                                                    */
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
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ['-4%', '8%'])
  const cardRotate = useTransform(scrollYProgress, [0, 1], [-1.5, 1.5])
  const cardOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [0.4, 1, 0.95])

  const isReversed = index % 2 === 1
  const primary = project.images[0]
  const secondary = project.images[1] ?? project.images[0]

  return (
    <Reveal delay={index * 0.05}>
      <motion.article
        ref={containerRef}
        style={{ opacity: reduce ? undefined : cardOpacity }}
        className={[
          'group relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center',
          'py-12 lg:py-20 first:pt-0',
        ].join(' ')}
      >
        {/* Image block — flips side every other card */}
        <div
          className={[
            'relative lg:col-span-7',
            isReversed ? 'lg:order-2 lg:col-start-6' : 'lg:order-1',
          ].join(' ')}
        >
          <motion.div
            style={{ rotate: reduce ? undefined : cardRotate }}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] border border-surface-border surface-bg shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] transition-shadow duration-700 group-hover:shadow-[0_50px_100px_-30px_rgba(0,229,176,0.4)]"
          >
            {/* Animated gradient border on hover */}
            <div className="pointer-events-none absolute inset-0 z-10 rounded-[24px] opacity-0 transition-opacity duration-700 group-hover:opacity-100">
              <div className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-teal/40 via-coral/30 to-teal-soft/40 [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] p-[1.5px]" />
            </div>

            {/* The image with parallax */}
            {primary && (
              <motion.div
                style={{ y: imageY }}
                className="absolute inset-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={primary}
                  alt={`${project.title} — primary view`}
                  loading="lazy"
                  className="h-[110%] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </motion.div>
            )}

            {/* Top + bottom gradients */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/50 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Top-left index pill */}
            <div className="absolute left-5 top-5 z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-mono-accent uppercase tracking-[0.22em] text-white backdrop-blur-md">
                <span className="text-teal">{String(index + 1).padStart(2, '0')}</span>
                <span className="h-px w-4 bg-white/30" />
                <span>{project.category}</span>
              </span>
            </div>

            {/* Bottom-right open button */}
            <button
              type="button"
              onClick={() => onOpen(project)}
              className="absolute bottom-5 right-5 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-background/85 text-white backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:border-teal/50 group-hover:text-teal group-hover:rotate-[-15deg]"
              aria-label={`View ${project.title}`}
            >
              <ArrowUpRight className="h-5 w-5" />
            </button>
          </motion.div>

          {/* Floating secondary thumbnail */}
          <div
            className={[
              'absolute -bottom-8 z-20 hidden md:block',
              isReversed ? 'left-0' : 'right-0',
            ].join(' ')}
          >
            <div className="relative h-24 w-32 overflow-hidden rounded-[14px] border border-surface-border surface-bg shadow-xl">
              {secondary && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={secondary}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="h-full w-full object-cover opacity-90"
                />
              )}
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[14px]" />
            </div>
          </div>
        </div>

        {/* Text block */}
        <div
          className={[
            'relative lg:col-span-5',
            isReversed ? 'lg:order-1 lg:col-start-1' : 'lg:order-2',
          ].join(' ')}
        >
          <p className="text-[10px] font-mono-accent uppercase tracking-[0.25em] text-teal mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-6 bg-teal/60" />
            {project.year} · {project.region}
          </p>

          <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.05] text-white">
            {project.title}
          </h3>

          <p className="mt-4 text-[#B8C8C4] leading-relaxed text-sm sm:text-base">
            {project.summary}
          </p>

          {project.highlights && project.highlights.length > 0 && (
            <ul className="mt-5 space-y-2">
              {project.highlights.slice(0, 3).map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-2.5 text-sm text-[#B8C8C4]"
                >
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-teal" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex items-center gap-3">
            <Button
              onClick={() => onOpen(project)}
              variant="outline"
              className="border-surface-border group/btn"
            >
              View case study
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover/btn:rotate-45" />
            </Button>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#718581]">
              <MapPin className="h-3.5 w-3.5" />
              {project.country}
            </span>
          </div>
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
    <div className="my-4 sm:my-8 flex items-center gap-3" aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-surface-border to-transparent" />
      <span className="inline-flex items-center gap-1 text-[10px] font-mono-accent uppercase tracking-[0.25em] text-[#718581]">
        <Sparkles className="h-3 w-3 text-teal" />
        <span>Next project</span>
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
              {String(activeImage + 1).padStart(2, '0')} / {String(project.images.length).padStart(2, '0')}
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
                      <Button
                        asChild
                        variant="default"
                        size="sm"
                      >
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

  return (
    <section
      className="relative py-16 sm:py-24"
      aria-labelledby="works-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.05]"
              >
                A small portfolio,
                <br />
                built with care.
              </h1>
              <p className="mt-4 text-[#718581] max-w-xl leading-relaxed text-sm sm:text-base">
                A handful of recent projects — websites, brand systems, and
                product surfaces — designed end-to-end with the same
                principles I apply to domain selection: clarity, restraint,
                and a sense of intent.
              </p>
            </div>
            <p className="hidden sm:block text-[11px] font-mono-accent uppercase tracking-[0.25em] text-[#718581] text-right">
              {String(PROJECTS.length).padStart(2, '0')} projects
              <br />
              2015 — 2026
            </p>
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
