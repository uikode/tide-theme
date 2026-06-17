const STORAGE_KEY = "tide-theme-mode"

export type ThemeMode = "light" | "dark"

/**
 * Returns the user's preferred mode from localStorage,
 * falling back to system preference via matchMedia.
 */
export function getPreferredMode(): ThemeMode {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark") {
      return stored
    }
  }

  if (typeof window !== "undefined" && window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    return mq.matches ? "dark" : "light"
  }

  return "light" // SSR fallback
}

/**
 * Persists the preferred mode to localStorage.
 */
export function setPreferredMode(mode: ThemeMode): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, mode)
  }
}

/**
 * Registers a callback for system color-scheme changes.
 * Returns a cleanup function to remove the listener.
 */
export function onSystemModeChange(cb: (mode: ThemeMode) => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {} // SSR no-op
  }

  const mq = window.matchMedia("(prefers-color-scheme: dark)")
  const handler = (e: MediaQueryListEvent | { matches: boolean }) => {
    cb(e.matches ? "dark" : "light")
  }

  mq.addEventListener("change", handler as EventListener)

  return () => {
    mq.removeEventListener("change", handler as EventListener)
  }
}
