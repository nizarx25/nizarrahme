'use client'

import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, FileText, Globe, Layers, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigation } from '@/store/navigation'

const SERVICES = [
  {
    icon: Globe,
    title: 'WordPress Websites',
    desc: 'Custom WordPress website design and development, from business sites to content platforms. Focused on clean design, fast performance, and ease of management.',
  },
  {
    icon: FileText,
    title: 'Digital Content',
    desc: 'Writing, editing, and content strategy for websites, blogs, and marketing materials. Content that communicates clearly and serves a purpose.',
  },
  {
    icon: BarChart3,
    title: 'SEO Foundations',
    desc: 'Technical SEO setup, keyword research, on-page optimization, and site structure to help websites become findable in search results.',
  },
  {
    icon: Sparkles,
    title: 'AI-Assisted Workflows',
    desc: 'Building and implementing AI-assisted processes for content generation, data analysis, and operational efficiency using modern tools.',
  },
  {
    icon: Layers,
    title: 'Digital Brand Foundations',
    desc: 'Naming, domain selection, visual identity basics, and online presence setup for new businesses and projects.',
  },
] as const

export function ServicesSection() {
  const nav = useNavigation()

  return (
    <section className="py-12 sm:py-20" aria-labelledby="services-heading">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-3">What I Offer</p>
        <h1 id="services-heading" className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">Selected Digital Services</h1>
        <p className="text-[#718581] max-w-2xl mb-12 leading-relaxed">
          Alongside domain investing, I offer select digital services for businesses and projects that need a hands-on, thoughtful approach to their online presence.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
          {SERVICES.map((service) => (
            <motion.a
              key={service.title}
              href="#contact"
              onClick={(e) => {
                e.preventDefault()
                nav.setSection('contact')
              }}
              whileHover={{ y: -6, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              role="listitem"
              className="surface-border rounded-[16px] bg-surface p-6 relative overflow-hidden group cursor-pointer block no-underline"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal/10 via-coral/5 to-teal-soft/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-coral/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="absolute -inset-[1px] rounded-[16px] bg-gradient-to-br from-teal/20 via-transparent to-coral/20 opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <service.icon className="size-6 text-teal group-hover:drop-shadow-[0_0_12px_rgba(0,229,176,0.5)] transition-all" />
                  <ArrowRight className="size-4 text-[#718581] group-hover:text-teal group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2 bg-gradient-to-r from-teal via-teal-soft to-coral bg-clip-text text-transparent transition-all duration-300">
                  {service.title}
                </h3>
                <p className="text-sm text-[#B8C8C4] leading-relaxed transition-colors">{service.desc}</p>
              </div>
            </motion.a>
          ))}
        </div>
        <div className="mt-12 text-center">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={() => nav.setSection('contact')}
              className="bg-gradient-to-r from-coral to-coral-hover text-white rounded-[12px] h-12 px-8 font-medium transition-all hover:shadow-[0_0_24px_rgba(255,77,46,0.4)] hover:brightness-110"
            >
              Discuss a Project <ArrowRight className="size-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}