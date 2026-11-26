'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'

const HEAD = 'h1, h2, h3'
const ARABIC = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/
const WORD_TAGS = 'P, LI, LABEL, BLOCKQUOTE, DD'

/** Wrap each letter of a text node in hop-able spans. Returns a restore fn. */
function splitText(node: Text): () => void {
  const wrap = document.createElement('span')
  wrap.setAttribute('aria-hidden', 'true')
  wrap.className = 'ed-split'
  let n = 0
  node.data.split(/(\s+)/).forEach((part) => {
    if (!part) return
    if (/^\s+$/.test(part)) {
      wrap.appendChild(document.createTextNode(' '))
      return
    }
    const w = document.createElement('span')
    w.className = 'ed-w'
    for (const ch of part) {
      const c = document.createElement('span')
      c.className = 'ed-c'
      c.style.animationDelay = `${n++ * 22}ms`
      c.textContent = ch
      w.appendChild(c)
    }
    wrap.appendChild(w)
  })
  const label = document.createElement('span')
  label.className = 'sr-only'
  label.textContent = node.data
  node.parentNode?.replaceChild(wrap, node)
  wrap.parentNode?.insertBefore(label, wrap)
  return () => {
    if (wrap.parentNode) wrap.parentNode.replaceChild(node, wrap)
    label.remove()
  }
}

/**
 * Turns on the Editorial Light theme for the public site by adding
 * `theme-ed` to <body> (so portaled dialogs get it too). The admin area
 * never mounts this, so it keeps its original dark look.
 *
 * Also owns the site-wide pointer effects: cursor lens, trailing glow and
 * dot grid, magnetic buttons, card tilt and ripple, heading letter hop and
 * the word highlighter.
 */
export function ThemeEd() {
  const lens = useRef<HTMLDivElement>(null)
  const glow = useRef<HTMLDivElement>(null)
  const dots = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    document.body.classList.add('theme-ed')
    return () => document.body.classList.remove('theme-ed')
  }, [])

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const el = lens.current
    const root = document.documentElement
    let raf = 0
    let x = -400
    let y = -400
    let tx = -400
    let ty = -400
    let shown = false
    let card: HTMLElement | null = null
    let mag: HTMLElement | null = null
    let head: HTMLElement | null = null
    let restore: (() => void)[] = []
    let headTimer = 0
    let wordRaf = 0
    let wmx = 0
    let wmy = 0
    const hl = (window as unknown as { Highlight?: new (...r: Range[]) => unknown }).Highlight
    const reg = (CSS as unknown as { highlights?: Map<string, unknown> }).highlights

    const tick = () => {
      x += (tx - x) * 0.22
      y += (ty - y) * 0.22
      if (el) el.style.transform = `translate3d(${x - 60}px, ${y - 60}px, 0)`
      raf = requestAnimationFrame(tick)
    }

    const resetCard = () => {
      if (!card) return
      card.style.removeProperty('--rx')
      card.style.removeProperty('--ry')
      card = null
    }
    const resetMag = () => {
      if (mag) mag.style.translate = ''
      mag = null
    }
    const endHead = () => {
      restore.forEach((f) => f())
      restore = []
      head = null
    }
    const startHead = (h: HTMLElement) => {
      if (h === head) return
      window.clearTimeout(headTimer)
      endHead()
      head = h
      if (ARABIC.test(h.textContent ?? '')) {
        // joined scripts must never be split: lift the whole heading instead
        h.classList.add('ed-ar-hover')
        restore = [() => h.classList.remove('ed-ar-hover')]
        return
      }
      const tw = document.createTreeWalker(h, NodeFilter.SHOW_TEXT)
      const nodes: Text[] = []
      while (tw.nextNode()) {
        const t = tw.currentNode as Text
        if (t.data.trim()) nodes.push(t)
      }
      if (nodes.length > 4) return
      restore = nodes.map(splitText)
    }

    const wordAt = () => {
      wordRaf = 0
      if (!hl || !reg) return
      const d = document as unknown as {
        caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null
        caretRangeFromPoint?: (x: number, y: number) => Range | null
      }
      let node: Node | null = null
      let off = 0
      if (d.caretPositionFromPoint) {
        const p = d.caretPositionFromPoint(wmx, wmy)
        if (p) {
          node = p.offsetNode
          off = p.offset
        }
      } else if (d.caretRangeFromPoint) {
        const r = d.caretRangeFromPoint(wmx, wmy)
        if (r) {
          node = r.startContainer
          off = r.startOffset
        }
      }
      if (!node || node.nodeType !== 3) {
        reg.delete('ed-word')
        return
      }
      const parent = (node as Text).parentElement
      if (!parent || !parent.closest(WORD_TAGS.toLowerCase()) || parent.closest(HEAD) || parent.closest('[role="dialog"]')) {
        reg.delete('ed-word')
        return
      }
      const text = (node as Text).data
      let a = off
      let b = off
      while (a > 0 && /\S/.test(text[a - 1])) a--
      while (b < text.length && /\S/.test(text[b])) b++
      if (a === b) {
        reg.delete('ed-word')
        return
      }
      const range = document.createRange()
      range.setStart(node, a)
      range.setEnd(node, b)
      const r = range.getBoundingClientRect()
      if (wmx < r.left - 2 || wmx > r.right + 2 || wmy < r.top - 2 || wmy > r.bottom + 2) {
        reg.delete('ed-word')
        return
      }
      reg.set('ed-word', new hl(range))
    }

    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      tx = e.clientX
      ty = e.clientY
      root.style.setProperty('--px', `${tx}px`)
      root.style.setProperty('--py', `${ty}px`)
      if (!shown) {
        x = tx
        y = ty
        shown = true
        el?.classList.add('is-on')
        glow.current?.classList.add('is-on')
        dots.current?.classList.add('is-on')
      }
      const t = e.target as HTMLElement | null
      const inDialog = !!t?.closest?.('[role="dialog"]')

      // lens grows over interactive things
      const interactive = !!t?.closest?.('a, button, [role="button"], .domain-card-hover')
      el?.classList.toggle('is-big', interactive)

      // card tilt
      const c = (t?.closest?.('.domain-card-hover') as HTMLElement | null) ?? null
      if (c !== card) resetCard()
      if (c) {
        card = c
        const r = c.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        c.style.setProperty('--mx', `${e.clientX - r.left}px`)
        c.style.setProperty('--my', `${e.clientY - r.top}px`)
        c.style.setProperty('--ry', `${((px - 0.5) * 10).toFixed(2)}deg`)
        c.style.setProperty('--rx', `${((0.5 - py) * 8).toFixed(2)}deg`)
      }

      // magnetic buttons and nav links
      const m = inDialog ? null : ((t?.closest?.('button, a') as HTMLElement | null) ?? null)
      const magOk = m && !m.closest('.domain-card-hover') && m.getBoundingClientRect().width < 360
      if ((magOk ? m : null) !== mag) resetMag()
      if (magOk && m) {
        mag = m
        const r = m.getBoundingClientRect()
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.28
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.28
        m.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`
      }

      // heading hop
      const h = (t?.closest?.(HEAD) as HTMLElement | null) ?? null
      if (h && !h.closest('.domain-card-hover') && !inDialog) startHead(h)
      else if (head && !h) {
        window.clearTimeout(headTimer)
        headTimer = window.setTimeout(endHead, 700)
      }

      // word highlighter
      wmx = e.clientX
      wmy = e.clientY
      if (!wordRaf) wordRaf = requestAnimationFrame(wordAt)
    }

    const down = (e: PointerEvent) => {
      el?.classList.add('is-down')
      root.style.setProperty('--ox', `${e.clientX}px`)
      root.style.setProperty('--oy', `${e.clientY}px`)
      const c = (e.target as HTMLElement | null)?.closest?.('.domain-card-hover') as HTMLElement | null
      if (c) {
        const r = c.getBoundingClientRect()
        const rip = document.createElement('span')
        rip.className = 'ed-ripple'
        rip.style.left = `${e.clientX - r.left}px`
        rip.style.top = `${e.clientY - r.top}px`
        c.appendChild(rip)
        window.setTimeout(() => rip.remove(), 750)
      }
    }
    const up = () => el?.classList.remove('is-down')
    const leave = () => {
      shown = false
      el?.classList.remove('is-on')
      glow.current?.classList.remove('is-on')
      dots.current?.classList.remove('is-on')
      resetCard()
      resetMag()
      reg?.delete('ed-word')
    }
    // Tag every element holding Arabic text so spacing never breaks the joins
    let tagTimer = 0
    const tagArabic = () => {
      const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      while (tw.nextNode()) {
        const n = tw.currentNode as Text
        if (ARABIC.test(n.data)) n.parentElement?.classList.add('ed-ar-text')
      }
    }
    const sched = () => {
      window.clearTimeout(tagTimer)
      tagTimer = window.setTimeout(tagArabic, 150)
    }
    tagArabic()
    const mo = new MutationObserver(sched)
    mo.observe(document.body, { childList: true, subtree: true, characterData: true })
    raf = requestAnimationFrame(tick)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    root.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      mo.disconnect()
      window.clearTimeout(tagTimer)
      window.clearTimeout(headTimer)
      endHead()
      resetCard()
      resetMag()
      reg?.delete('ed-word')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      root.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <>
      <div ref={glow} aria-hidden="true" className="ed-glow" />
      <div ref={dots} aria-hidden="true" className="ed-dots" />
      <div ref={lens} aria-hidden="true" className="ed-lens" />
    </>
  )
}
