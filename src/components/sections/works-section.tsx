'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Facebook, Instagram, MapPin, Sparkles, X, Globe } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PROJECTS, type Project } from '@/data/works'

/** A single project card with exactly two images:
 *  - the first is upright and carries the alt text
 *  - the second is tilted 15° and slightly offset to the side
 *  On hover, the tilted card straightens, the lift grows, and a teal shadow
 *  appears. Inside the detail dialog, all images are shown straight. */
function ProjectCard({
  project,
  onOpen,
}: {
  project: Project
  onOpen: (p: Project) => void
}) {
  const reduce = useReducedMotion()
  const primary = project.images[0]
  const secondary = project.images[1] ?? project.images[0]

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(project)}
      whileHover={reduce ? undefined : { y: -6 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-[20px]"
      aria-label={`View ${project.title} case study`}
    >
      <div className="relative aspect-[16/10] w-full">
        {/* Upright primary card */}
        <div
          className="absolute inset-0 rounded-[18px] overflow-hidden border border-surface-border surface-bg shadow-[0_18px_48px_-20px_rgba(0,0,0,0.55)] transition-all duration-500 ease-out group-hover:shadow-[0_30px_80px_-30px_rgba(0,229,176,0.35)] group-hover:border-teal/30"
          style={{ transform: 'translate(-6%, 2%)' }}
        >
          {primary && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primary}
              alt={`${project.title} — primary view`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          )}
        </div>

        {/* Tilted secondary card (15° to the right) */}
        <div
          className="absolute inset-0 rounded-[18px] overflow-hidden border border-surface-border surface-bg shadow-[0_22px_60px_-22px_rgba(0,0,0,0.65)] transition-all duration-500 ease-out group-hover:shadow-[0_36px_90px_-30px_rgba(0,229,176,0.4)] group-hover:border-teal/40"
          style={{
            transform: 'rotate(15deg) translate(8%, -3%)',
            transformOrigin: 'center',
          }}
        >
          <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:rotate-[-15deg] group-hover:scale-[1.04]">
            {secondary && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={secondary}
                alt={`${project.title} — secondary view`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Subtle hover overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* "Tap to view" affordance */}
        <div className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full border border-surface-border surface-bg/90 px-3 py-1.5 text-xs font-mono-accent text-teal opacity-0 translate-y-1 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
          <span>View project</span>
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </div>

      <div className="mt-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono-accent uppercase tracking-[0.25em] text-teal/80">
            {project.category} · {project.year}
          </p>
          <h3 className="mt-1 font-display text-xl sm:text-2xl font-bold text-white">
            {project.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#718581]">
            <MapPin className="h-3.5 w-3.5" />
            {project.region}, {project.country}
          </p>
        </div>
        <span
          aria-hidden
          className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-surface-border surface-bg text-[#B8C8C4] transition-all duration-500 group-hover:text-teal group-hover:border-teal/40 group-hover:rotate-[-15deg]"
        >
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </motion.button>
  )
}

function ProjectDialog({
  project,
  open,
  onOpenChange,
}: {
  project: Project | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  // Close on Escape for keyboard users (Dialog already traps focus, this is a safety net)
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
        className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto surface-border surface-bg p-0 sm:rounded-[20px]"
        aria-describedby={undefined}
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full surface-border surface-bg/90 text-[#B8C8C4] hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/60"
            aria-label="Close project"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Image pair: stacked on mobile, side-by-side, fully straight (no tilt) on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-6">
            {project.images.slice(0, 2).map((src, i) => (
              <div
                key={src}
                className="relative aspect-[4/3] overflow-hidden rounded-[16px] border border-surface-border surface-bg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${project.title} — view ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="px-4 sm:px-6 pb-6 space-y-5">
            <div>
              <p className="text-[10px] font-mono-accent uppercase tracking-[0.25em] text-teal">
                {project.category} · {project.year}
              </p>
              <DialogTitle className="mt-1 font-display text-2xl sm:text-3xl font-bold text-white">
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

            <Separator className="bg-surface-border" />

            <section>
              <h4 className="font-display text-lg font-semibold text-white">About the work</h4>
              <p className="mt-2 text-sm leading-relaxed text-[#B8C8C4]">{project.about}</p>
              {project.highlights && project.highlights.length > 0 && (
                <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {project.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-center gap-2 rounded-[10px] border border-surface-border surface-bg px-3 py-2 text-sm text-[#B8C8C4]"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-teal" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h4 className="font-display text-lg font-semibold text-white">How it was designed</h4>
              <p className="mt-2 text-sm leading-relaxed text-[#B8C8C4]">
                {project.designMethod}
              </p>
            </section>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              {project.facebook && (
                <Button asChild variant="outline" size="sm" className="border-surface-border">
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
                <Button asChild variant="outline" size="sm" className="border-surface-border">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Reveal-on-scroll container. */
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

export function WorksSection() {
  const [active, setActive] = useState<Project | null>(null)
  const [open, setOpen] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-20"
      aria-labelledby="works-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-3">
            Selected Works
          </p>
          <h1
            id="works-heading"
            className="font-display text-3xl sm:text-4xl font-bold text-white mb-3"
          >
            A small portfolio, built with care
          </h1>
          <p className="text-[#718581] max-w-2xl mb-12 leading-relaxed">
            A handful of recent projects — websites, brand systems, and product
            surfaces — designed end-to-end with the same principles I apply to
            domain selection: clarity, restraint, and a sense of intent.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14">
          {PROJECTS.map((p, idx) => (
            <Reveal key={p.slug} delay={idx * 0.05}>
              <ProjectCard
                project={p}
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
