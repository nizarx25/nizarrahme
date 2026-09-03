'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { SocialLinks } from '@/components/layout/social-links'

const EVALUATION_CRITERIA = [
  { title: 'Brandability', desc: 'Does the name sound like a real company, not a keyword string?' },
  { title: 'Length', desc: 'Shorter is generally better. I prefer names under 12 characters when possible.' },
  { title: 'Memorability', desc: 'Can someone recall the name after hearing it once?' },
  { title: 'Pronounceability', desc: 'Can it be said out loud without confusion?' },
  { title: 'Industry fit', desc: 'Does it align with a growing sector like AI, SaaS, fintech, or digital services?' },
  { title: 'Extension quality', desc: '.com is preferred. Other extensions are selected only when the name is strong.' },
  { title: 'Search and confusion risk', desc: 'Does it avoid trademark conflicts and confusion with existing brands?' },
  { title: 'Practical value', desc: 'Would a real business benefit from owning this name?' },
] as const

const SUPPORTING_CAPABILITIES = [
  'WordPress website design and development',
  'Content creation and copywriting',
  'Social media strategy and management',
  'SEO foundations and technical optimization',
  'AI-assisted workflows and automation',
]

export function AboutSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="py-12 sm:py-20" aria-labelledby="about-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-3">About</p>
        <h1 id="about-heading" className="font-display text-3xl sm:text-4xl font-bold text-white mb-8">About NIZAR RAHME</h1>
        <div className="space-y-6 text-[#B8C8C4] leading-relaxed">
          <p>I&rsquo;m NIZAR RAHME. I invest in and curate domain names for businesses operating in AI, SaaS, fintech, technology, and the broader digital economy.</p>
          <p>My approach to domain investing is straightforward: I look for names that are short, memorable, and genuinely brandable: names that could serve as the foundation for a real business. I don&rsquo;t register names at scale or flip domains for quick returns. Each name in the catalog has been selected with specific industries and use cases in mind.</p>
          <p>Beyond domain investing, I have hands-on experience building WordPress websites, creating digital content, and working with AI-assisted workflows. This practical background informs how I evaluate names: I think about how a domain will work in context, not just how it sounds.</p>
        </div>

        <Separator className="my-12 bg-surface-border" />

        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-8">How I Evaluate a Domain</h2>
        <div className="space-y-0">
          {EVALUATION_CRITERIA.map((item, idx) => (
            <motion.div
              key={item.title}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onTouchStart={() => setHoveredIndex(hoveredIndex === idx ? null : idx)}
              className={`flex gap-4 py-4 px-3 -mx-3 rounded-xl surface-border-b last:border-b-0 transition-all duration-300 cursor-pointer relative overflow-hidden ${
                hoveredIndex === idx ? 'bg-gradient-to-r from-teal/8 via-elevated/50 to-transparent' : ''
              }`}
            >
              {hoveredIndex === idx && (
                <motion.div
                  layoutId="evalHighlight"
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal to-teal-soft"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <motion.div
                animate={{ scale: hoveredIndex === idx ? 1.2 : 1 }}
                transition={{ duration: 0.2 }}
                className="shrink-0"
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-elevated border flex items-center justify-center text-xs font-mono-accent transition-all duration-300 ${
                    hoveredIndex === idx
                      ? 'text-[#061312] border-teal/40 bg-gradient-to-br from-teal to-teal-soft shadow-[0_0_16px_rgba(0,229,176,0.25)]'
                      : 'text-teal/70 border-surface-border'
                  }`}
                >
                  {idx + 1}
                </div>
              </motion.div>
              <div className="min-w-0">
                <h3
                  className={`font-medium text-sm transition-all duration-300 ${
                    hoveredIndex === idx
                      ? 'bg-gradient-to-r from-teal to-teal-soft bg-clip-text text-transparent'
                      : 'text-white'
                  }`}
                >
                  {item.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed transition-colors duration-300 ${
                    hoveredIndex === idx ? 'text-[#B8C8C4]' : 'text-[#718581]'
                  }`}
                >
                  {item.desc}
                </p>
              </div>
              {hoveredIndex === idx && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="shrink-0 self-center"
                >
                  <Sparkles className="size-4 text-teal" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <Separator className="my-12 bg-surface-border" />
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-6">Supporting capabilities</h2>
        <ul className="space-y-3">
          {SUPPORTING_CAPABILITIES.map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm text-[#B8C8C4]">
              <CheckCircle2 className="size-4 text-teal shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <Separator className="my-12 bg-surface-border" />
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#718581] font-mono-accent">Connect:</span>
          <SocialLinks />
        </div>
      </div>
    </section>
  )
}