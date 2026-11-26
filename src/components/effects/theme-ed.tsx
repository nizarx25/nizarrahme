'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'

/**
 * Turns on the Editorial Light theme for the public site by adding
 * `theme-ed` to <body> (so portaled dialogs get it too). The admin area
 * never mounts this, so it keeps its original dark look.
 *
 * Also renders the site-wide cursor lens: a lit circle that follows the
 * mouse on every page and sharpens the words under it. It also feeds the
 * pointer position into domain cards for their hover flood.
 */
export function ThemeEd() {
  const lens = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    document.body.classList.add('theme-ed')
    return () => document.body.classList.remove('theme-ed')
  }, [])

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const el = lens.current
    let raf = 0
    let x = -400
    let y = -400
    let tx = -400
    let ty = -400
    let shown = false
    const tick = () => {
      x += (tx - x) * 0.22
      y += (ty - y) * 0.22
      if (el) el.style.transform = `translate3d(${x - 110}px, ${y - 110}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      tx = e.clientX
      ty = e.clientY
      if (!shown) {
        x = tx
        y = ty
        shown = true
        el?.classList.add('is-on')
      }
      const card = (e.target as HTMLElement | null)?.closest?.('.domain-card-hover') as HTMLElement | null
      if (card) {
        const r = card.getBoundingClientRect()
        card.style.setProperty('--mx', `${e.clientX - r.left}px`)
        card.style.setProperty('--my', `${e.clientY - r.top}px`)
      }
    }
    const leave = () => {
      shown = false
      el?.classList.remove('is-on')
    }
    raf = requestAnimationFrame(tick)
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [])

  return <div ref={lens} aria-hidden="true" className="ed-lens" />
}
