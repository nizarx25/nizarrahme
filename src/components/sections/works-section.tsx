'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Facebook, Instagram, MapPin, Sparkles, X, Globe, Layers, Quote } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PROJECTS, type Project } from '@/data/works'

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */

function ProjectCard({
  project,
  onOpen,
  index,
}: {
  project: Project
  onOpen: (p: Project) => void
  index: number
}) {
  const reduce = useReducedMotion()
  const primary = project.images[0]
  const secondary = project.images[1] ?? project.images[0]

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(project)}
      whileHover={reduce ? undefined : { y: -6 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-[22px]"
      aria-label={`View ${project.title} case study`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[22px] border border-surface-border surface-bg shadow-[0_18px_48px_-22px_rgba(0,0,0,0.6)] transition-all duration-500 ease-out group-hover:border-teal/40 group-hover:shadow-[0_32px_80px_-28px_rgba(0,229,176,0.35)]">
        {primary && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primary}
            alt={`${project.title} — primary view`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute left-4 top-4 right-4 flex items-start justify-between gap-3">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[10px] font-mono-accent uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm">
            {String(index + 1).padStart(2, '0')} · {project.category}
          </span>
          <span
            aria-hidden
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/80 backdrop-blur-sm transition-all duration-500 group-hover:border-teal/40 group-hover:text-teal group-hover:rotate-[-15deg]"
          >
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <p className="flex items-center gap-1.5 text-[10px] font-mono-accent uppercase tracking-[0.22em] text-teal/90">
            <MapPin className="h-3 w-3" />
            {project.region}, {project.country}
          </p>
          <h3 className="mt-1 font-display text-lg sm:text-xl font-bold leading-tight text-white line-clamp-2">
            {project.title}
          </h3>
        </div>

        <div className="pointer-events-none absolute left-1/2 bottom-20 -translate-x-1/2 translate-y-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/40 bg-background/85 px-3 py-1.5 text-[11px] font-mono-accent uppercase tracking-[0.2em] text-teal backdrop-blur">
            <span>View project</span>
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[10px] border border-surface-border surface-bg">
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
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-mono-accent uppercase tracking-[0.22em] text-teal/80">
            {project.year} · Case study
          </p>
          <p className="truncate text-xs text-[#B8C8C4]">
            {project.summary}
          </p>
        </div>
      </div>
    </motion.button>
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

  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl w-[96vw] max-h-[92vh] overflow-y-auto surface-border surface-bg p-0 sm:rounded-[24px]"
        aria-describedby={undefined}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-surface-border surface-bg">
          {project.images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.images[0]}
              alt={`${project.title} — cover image`}
              className="absolute inset-0 h-full w-full object-cover object-center"
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

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-0">
          <div className="p-5 sm:p-7 space-y-6 border-b border-surface-border lg:border-b-0 lg:border-r">
            {project.images[1] && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] border border-surface-border surface-bg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.images[1]}
                  alt={`${project.title} — secondary view`}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              </div>
            )}

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
/* Reveal on scroll                                                           */
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
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
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
      className="py-16 sm:py-24"
      aria-labelledby="works-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-14">
            <div>
              <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.22em] mb-3 inline-flex items-center gap-2">
                <span className="inline-block h-px w-6 bg-teal/60" />
                Selected Works
              </p>
              <h1
                id="works-heading"
                className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white"
              >
                A small portfolio, built with care
              </h1>
              <p className="mt-3 text-[#718581] max-w-xl leading-relaxed text-sm sm:text-base">
                A handful of recent projects — websites, brand systems, and
                product surfaces — designed end-to-end with the same
                principles I apply to domain selection: clarity, restraint,
                and a sense of intent.
              </p>
            </div>
            <p className="hidden sm:block text-[11px] font-mono-accent uppercase tracking-[0.22em] text-[#718581]">
              {String(PROJECTS.length).padStart(2, '0')} projects
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {PROJECTS.map((p, idx) => (
            <Reveal key={p.slug} delay={idx * 0.05}>
              <ProjectCard
                project={p}
                index={idx}
                onOpen={(proj) => {
                  setActive(proj)
                  setOpen(true)
                }}
              />
            </Reveal>
          ))}
        </div>
      </div>

      <ProjectDialog project={active} open={open} onOpenChange={setOpen} />
    </section>
  )
}
