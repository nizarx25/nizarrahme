'use client'

import { useEffect } from 'react'

const ARABIC = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/

type Unit = { el: HTMLElement; y: number; v: number; r: number; g?: HTMLElement; f?: number }
type Shine = { base: [number, number, number]; dur: number; t0: number }
const YEL: [number, number, number] = [255, 216, 58]
const WHT: [number, number, number] = [255, 255, 255]
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
function parseRgb(c: string): [number, number, number] {
  const m = c.trim()
  if (m.startsWith('#')) {
    const h = m.length === 4 ? m.slice(1).split('').map((x) => x + x).join('') : m.slice(1)
    return [parseInt(h.slice(0, 2), 16) || 0, parseInt(h.slice(2, 4), 16) || 0, parseInt(h.slice(4, 6), 16) || 0]
  }
  const n = m.match(/\d+/g)
  return n && n.length >= 3 ? [+n[0], +n[1], +n[2]] : [185, 209, 194]
}
// Solid per-letter colour for the travelling yellow/white band. No background-clip, so it cannot go blank under transforms.
function shineColor(sh: Shine, f: number, now: number) {
  const p = (((now - sh.t0) / 1000) / sh.dur) % 1
  const c = p * 1.6 - 0.3
  const d = Math.abs(f - c) / 0.13
  if (d >= 1) return `rgb(${sh.base.join(',')})`
  const k = 1 - d
  const col = k > 0.7 ? mix(YEL, WHT, (k - 0.7) / 0.3) : mix(sh.base, YEL, k / 0.7)
  return `rgb(${col.join(',')})`
}
const SKIP = 'button, [role="button"], svg, input, textarea, select, [role="combobox"], [role="option"], [aria-hidden="true"], .sr-only, script, style'
const GRAD = '[class*="bg-clip-text"]'
const TEXTY = 'h1, h2, h3, h4, h5, p, li, label, dt, dd, blockquote, figcaption, td'
function hasDirectText(e: Element) {
  for (const c of Array.from(e.childNodes)) if (c.nodeType === 3 && (c.textContent ?? '').trim()) return true
  return false
}
// real buttons and icons are skipped; a clickable card (div role=button holding headings/paragraphs) is text, not a button
function skipped(e: Element | null | undefined): boolean {
  let c = e?.closest(SKIP) as HTMLElement | null
  while (c) {
    const card = c.getAttribute('role') === 'button' && c.tagName !== 'BUTTON' && !!c.querySelector('h1,h2,h3,h4,p')
    if (!card) return true
    c = c.parentElement?.closest(SKIP) as HTMLElement | null
  }
  return false
}
function targetFor(t: HTMLElement | null): HTMLElement | null {
  if (!t || skipped(t) || t.closest('.ed-caret')) return null
  const blk = t.closest(TEXTY) as HTMLElement | null
  if (blk) return blk
  return hasDirectText(t) ? t : null
}

/**
 * Chain wave on headings: while the pointer moves along a heading, each unit
 * is pulled up by the cursor and drags its neighbours with it, then every
 * unit eases back to the baseline. Units are letters for Latin text and whole
 * words for Arabic, so joined letters never get split.
 */
function makeWave(h: HTMLElement) {
  const hcs = getComputedStyle(h)
  const shimmer = hcs.animationName === 'shineSweep'
  const shImg = hcs.backgroundImage
  const shDur = parseFloat(hcs.animationDuration) || 7
  const restores: (() => void)[] = []
  const units: Unit[] = []
  const tw = document.createTreeWalker(h, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (skipped(n.parentElement) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  })
  const nodes: Text[] = []
  while (tw.nextNode()) {
    const t = tw.currentNode as Text
    if (t.data.trim()) nodes.push(t)
  }
  if (nodes.length === 0 || nodes.length > 80) return null
  nodes.forEach((node) => {
    const arabic = ARABIC.test(node.data)
    const gEl = (node.parentElement?.closest(GRAD) as HTMLElement | null) ?? null
    const mark = units.length
    const wrap = document.createElement('span')
    wrap.setAttribute('aria-hidden', 'true')
    // Split into script runs. Each run is its own bidi isolate, so Arabic
    // words (inline-blocks) keep right-to-left order and mixed text keeps its order.
    wrap.dir = 'auto'
    wrap.style.unicodeBidi = 'isolate'
    let run: HTMLElement | null = null
    let runAr = false
    node.data.split(/(\s+)/).forEach((part) => {
      if (!part) return
      const neutral = /^[\s\p{P}\p{S}\d]+$/u.test(part)
      const partAr = ARABIC.test(part)
      if (!run || (!neutral && partAr !== runAr)) {
        run = document.createElement('span')
        runAr = neutral ? false : partAr
        run.dir = runAr ? 'rtl' : 'ltr'
        run.style.unicodeBidi = 'isolate'
        wrap.appendChild(run)
      }
      if (/^\s+$/.test(part)) {
        run.appendChild(document.createTextNode(' '))
        return
      }
      const w = document.createElement('span')
      w.style.cssText = 'display:inline-block;white-space:nowrap'
      if (partAr || runAr) {
        w.style.willChange = 'transform'
        w.textContent = part
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
      run.appendChild(w)
    })
    if (gEl) for (let q = mark; q < units.length; q++) units[q].g = gEl
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
  // Gradient text: each unit carries its own slice of its heading's gradient.
  const gs = new Set<HTMLElement>()
  units.forEach((u) => u.g && gs.add(u.g))
  const info = new Map<HTMLElement, { gr: DOMRect; img: string }>()
  gs.forEach((g) => info.set(g, { gr: g.getBoundingClientRect(), img: getComputedStyle(g).backgroundImage }))
  units.forEach((u) => {
    if (!u.g) return
    const { gr, img } = info.get(u.g)!
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
  let shine: Shine | null = null
  if (shimmer && shImg !== 'none') {
    const hr = h.getBoundingClientRect()
    shine = { base: parseRgb(hcs.getPropertyValue('--sb') || '#b9d1c2'), dur: shDur, t0: performance.now() - (((performance.now() / 1000) % shDur) * 1000) }
    units.forEach((u) => {
      if (u.g) return
      const r = u.el.getBoundingClientRect()
      u.f = Math.min(1, Math.max(0, (r.left - hr.left) / (hr.width || 1)))
      u.el.style.setProperty('-webkit-text-fill-color', shineColor(shine!, u.f, performance.now()))
    })
    const oldH = h.style.backgroundImage
    h.style.backgroundImage = 'none'
    restores.push(() => {
      h.style.backgroundImage = oldH
    })
  }
  gs.forEach((g) => {
    const old = g.style.backgroundImage
    g.style.backgroundImage = 'none'
    restores.push(() => {
      g.style.backgroundImage = old
    })
  })
  return { units, shine, restore: () => restores.forEach((f) => f()) }
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
      let active: { h: HTMLElement; units: Unit[]; shine: Shine | null; restore: () => void } | null = null
      let cx = -1e5
      let raf = 0
      let inside = false
      let lastMove = 0

      const frame = () => {
        raf = 0
        if (!active) return
        const { units, shine } = active
        const nowT = performance.now()
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
          if (shine && u.f !== undefined) u.el.style.setProperty('-webkit-text-fill-color', shineColor(shine, u.f, nowT))
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
        const h = active && t && active.h.contains(t) ? active.h : targetFor(t)
        inside = !!h
        if (h && (!active || active.h !== h)) {
          if (active) {
            active.restore()
            active = null
          }
          const w = makeWave(h)
          if (w) active = { h, units: w.units, shine: w.shine, restore: w.restore }
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
