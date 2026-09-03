'use client'

import { Linkedin, Instagram, Facebook, Twitter, MessageCircle } from 'lucide-react'
import { useSettings } from '@/hooks/use-domain-data'

export function SocialLinks() {
  const { data: settings } = useSettings()
  const links: Record<string, string> = {
    x: 'https://x.com/mr_nizarrahme',
    linkedin: 'https://www.linkedin.com/in/nizarrahme/',
    instagram: 'https://www.instagram.com/mr_nizarrahme/',
    facebook: 'https://www.facebook.com/mr.nizarrahme',
    ...settings?.socialLinks,
  }

  return (
    <div className="flex items-center gap-2">
      {links.x && (
        <a
          href={links.x}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-[10px] hover:bg-elevated transition-all text-muted-foreground hover:text-white hover:shadow-[0_0_12px_rgba(255,255,255,0.05)]"
          aria-label="X (Twitter)"
        >
          <Twitter className="size-4" />
        </a>
      )}
      {links.linkedin && (
        <a
          href={links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-[10px] hover:bg-elevated transition-all text-muted-foreground hover:text-[#0A66C2] hover:shadow-[0_0_12px_rgba(10,102,194,0.15)]"
          aria-label="LinkedIn"
        >
          <Linkedin className="size-4" />
        </a>
      )}
      {links.instagram && (
        <a
          href={links.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-[10px] hover:bg-elevated transition-all text-muted-foreground hover:text-[#E4405F] hover:shadow-[0_0_12px_rgba(228,64,95,0.15)]"
          aria-label="Instagram"
        >
          <Instagram className="size-4" />
        </a>
      )}
      {links.facebook && (
        <a
          href={links.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-[10px] hover:bg-elevated transition-all text-muted-foreground hover:text-[#1877F2] hover:shadow-[0_0_12px_rgba(24,119,242,0.15)]"
          aria-label="Facebook"
        >
          <Facebook className="size-4" />
        </a>
      )}
      <a
        href="https://wa.me/963932264918"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-[10px] hover:bg-elevated transition-all text-muted-foreground hover:text-teal hover:shadow-[0_0_12px_rgba(0,229,176,0.15)]"
        aria-label="WhatsApp"
      >
        <MessageCircle className="size-4" />
      </a>
    </div>
  )
}