'use client'

import { useLayoutEffect } from 'react'

/**
 * Turns on the Editorial Light theme for the public site by adding
 * `theme-ed` to <body> (so portaled dialogs get it too). The admin area
 * never mounts this, so it keeps its original dark look.
 */
export function ThemeEd() {
  useLayoutEffect(() => {
    document.body.classList.add('theme-ed')
    return () => document.body.classList.remove('theme-ed')
  }, [])
  return null
}
