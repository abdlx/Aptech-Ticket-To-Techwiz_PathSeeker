import { useEffect } from 'react'
import { useAccessibilityStore } from '../stores/appStores'

export function AccessibilityProvider({ children }) {
  const { theme, fontScale, reducedMotion } = useAccessibilityStore()
  useEffect(() => {
    const root = document.documentElement
    const prefersDark = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolvedTheme = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme
    root.dataset.theme = resolvedTheme
    root.style.fontSize = `${fontScale * 100}%`
    root.dataset.reducedMotion = String(reducedMotion)
  }, [theme, fontScale, reducedMotion])
  return children
}
