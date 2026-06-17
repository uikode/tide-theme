import type { Theme } from "./createTheme"

/** Converts camelCase to kebab-case. */
export function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
}

// Track applied CSS var keys per element for cleanup
const appliedVarsMap = new WeakMap<HTMLElement, string[]>()

/**
 * Applies a theme's tokens as CSS custom properties on the target element.
 * Sets data-theme and data-mode attributes.
 *
 * @param theme - Theme object to apply
 * @param mode - "light" or "dark"
 * @param root - Target element (defaults to document.documentElement)
 */
export function applyTheme(theme: Theme, mode: "light" | "dark", root?: HTMLElement): void {
  if (!theme || typeof theme !== "object" || !theme.name) {
    throw new Error("applyTheme: theme must be a valid Theme object")
  }
  if (mode !== "light" && mode !== "dark") {
    throw new Error(`applyTheme: mode must be "light" or "dark", got "${mode}"`)
  }

  const el = root ?? (typeof document !== "undefined" ? document.documentElement : undefined)
  if (!el) {
    return // SSR safety: no-op when document is unavailable
  }

  const tokens = mode === "light" ? theme.light : theme.dark
  const appliedVars: string[] = []

  for (const [key, value] of Object.entries(tokens)) {
    if (value == null) continue
    const cssVar = `--color-${camelToKebab(key)}`
    el.style.setProperty(cssVar, value)
    appliedVars.push(cssVar)
  }

  appliedVarsMap.set(el, appliedVars)
  el.setAttribute("data-theme", theme.name)
  el.setAttribute("data-mode", mode)
}

/**
 * Removes all theme CSS variables and attributes from the target element.
 *
 * @param root - Target element (defaults to document.documentElement)
 */
export function removeTheme(root?: HTMLElement): void {
  const el = root ?? (typeof document !== "undefined" ? document.documentElement : undefined)
  if (!el) {
    return // SSR safety
  }

  const vars = appliedVarsMap.get(el)
  if (vars) {
    for (const v of vars) {
      el.style.removeProperty(v)
    }
    appliedVarsMap.delete(el)
  }

  el.removeAttribute("data-theme")
  el.removeAttribute("data-mode")
}
