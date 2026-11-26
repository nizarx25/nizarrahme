'use client'

import { useEffect } from 'react'

const HEAD = 'h1, h2, h3'
const ARABIC = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/

type Unit = { el: HTMLElement; y: number; v: number; r: number }

/**
 * Chain wave on headings: while the pointer moves along a heading, each unit
 * is pulled up by the cursor and drags its neighbours with it, then every
 * unit eases back to the baseline. Units are letters for Latin text and whole
 * words for Arabic, so joined letters never get split.
 */
function makeWave(h: HTMLElement) {
  const restores: (() => void)[] = []
  const units: Unit[] = []
  const tw = document.createTreeWalker(h, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  while (tw.nextNode()) {
    const t = tw.currentNode as Text
    if (t.data.trim()) nodes.push(t)
  }
  if (nodes.length === 0 || nodes.length > 4) return null
  nodes.forEach((node) => {
    const arabic = ARABIC.test(node.data)
    const wrap = document.createElement('span')
    wrap.setAttribute('aria-hidden', 'true')
    node.data.split(/(\s+)/).forEach((part) => {
      if (!part) return
      if (/^\s+$/.test(part)) {
        wrap.appendChild(document.createTextNode(' '))
        return
      }
      const w = document.createElement('span')
      w.style.cssText = 'display:inline-block;white-space:nowrap'
      if (arabic) {
        w.style.willChange = 'transform'
        units.push({ el: w, y: 0, v: 0, r: 0 })
      } else {
        for (const ch of part) {
          const c = document.createElement('span')
          c.style.cssText = 'display:inline-block;will-change:transform'
          c.textContent = ch
          w.appendChild(c)
          units.push({ el: c, y: 0, v: 0, r: 0 })
        }
      }
      if (arabic) w.textContent = part
      wrap.appendChild(w)
    })
    const label = document.createElement('span')
    label.className = 'sr-only'
    label.textContent = node.data
    node.parentNode?.replaceChild(wrap, node)
    wrap.parentNode?.insertBefore(label, wrap)
    restores.push(() => {
      if (wrap.parentNode) wrap.parentNode.replaceChild(node, wrap)
      label.remove()
    })
  })
  // Gradient text (bg-clip-text): the gradient lives on the heading, so moving
  // letters would ghost. Give each unit its own slice of the same gradient.
  const g = (h.matches('[class*="bg-clip-text"]') ? h : h.querySelector('[class*="bg-clip-text"]')) as HTMLElement | null
  if (g) {
    const gr = g.getBoundingClientRect()
    const cs = getComputedStyle(g)
    const img = cs.backgroundImage
    const old = g.style.backgroundImage
    units.forEach((u) => {
      const r = u.el.getBoundingClientRect()
      const st = u.el.style
      st.backgroundImage = img
      st.backgroundSize = `${gr.width}px ${gr.height}px`
      st.backgroundPosition = `${-(r.left - gr.left)}px ${-(r.top - gr.top)}px`
      st.backgroundRepeat = 'no-repeat'
      st.setProperty('-webkit-background-clip', 'text')
      st.backgroundClip = 'text'
      st.setProperty('-webkit-text-fill-color', 'transparent')
    })
    g.style.backgroundImage = 'none'
    restores.push(() => {
      g.style.backgroundImage = old
    })
  }
  return { units, restore: () => restores.forEach((f) => f()) }
}

export function EffectsRoot() {
  useEffect(() => {
    const root = document.documentElement
    const onDown = (e: PointerEvent) => {
      root.style.setProperty('--ox', `${e.clientX}px`)
      root.style.setProperty('--oy', `${e.clientY}px`)
    }
    window.addEventListener('pointerdown', onDown, { passive: true })

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let cleanup = () => {}
    if (fine && !reduce) {
      let active: { h: HTMLElement; units: Unit[]; restore: () => void } | null = null
      let cx = -1e5
      let raf = 0
      let inside = false
      let lastMove = 0

      const frame = () => {
        raf = 0
        if (!active) return
        const { units } = active
        const n = units.length
        const rects = units.map((u) => {
          const r = u.el.getBoundingClientRect()
          return r.left + r.width / 2
        })
        const pull = inside && performance.now() - lastMove < 140
        // the unit under the cursor is eased toward a lifted position
        let k = -1
        if (pull) {
          let best = 1e9
          rects.forEach((rx, i) => {
            const d = Math.abs(rx - cx)
            if (d < best) {
              best = d
              k = i
            }
          })
        }
        const ny = units.map((u) => u.y)
        for (let i = 0; i < n; i++) {
          const u = units[i]
          const a = units[i - 1]?.y ?? u.y
          const b = units[i + 1]?.y ?? u.y
          let f = (a - u.y) * 0.1 + (b - u.y) * 0.1 - u.y * (pull ? 0.022 : 0.09)
          if (i === k) f += (-18 - u.y) * 0.07
          else if (k >= 0 && Math.abs(i - k) === 1) f += (-9 - u.y) * 0.025
          u.v = (u.v + f) * (pull ? 0.9 : 0.8)
          ny[i] = u.y + u.v
        }
        let moving = false
        units.forEach((u, i) => {
          u.y = ny[i]
          u.r += (u.y * 0.12 - u.r) * 0.2
          u.el.style.transform = `translateY(${u.y.toFixed(2)}px) rotate(${u.r.toFixed(2)}deg)`
          if (Math.abs(u.y) > 0.15 || Math.abs(u.v) > 0.15) moving = true
        })
        if (moving || pull) raf = requestAnimationFrame(frame)
        else {
          active.restore()
          active = null
        }
      }

      const move = (e: PointerEvent) => {
        if (e.pointerType === 'touch') return
        cx = e.clientX
        lastMove = performance.now()
        const t = e.target as HTMLElement | null
        const h = (t?.closest?.(HEAD) as HTMLElement | null) ?? null
        inside = !!h
        if (h && (!active || active.h !== h)) {
          if (active) {
            active.restore()
            active = null
          }
          const w = makeWave(h)
          if (w) active = { h, units: w.units, restore: w.restore }
        }
        if (active && !raf) raf = requestAnimationFrame(frame)
      }
      window.addEventListener('pointermove', move, { passive: true })
      cleanup = () => {
        window.removeEventListener('pointermove', move)
        cancelAnimationFrame(raf)
        active?.restore()
      }
    }
    return () => {
      window.removeEventListener('pointerdown', onDown)
      cleanup()
    }
  }, [])
  return null
}
