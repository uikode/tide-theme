import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  createTheme,
  applyTheme,
  removeTheme,
  getPreferredMode,
  setPreferredMode,
  onSystemModeChange,
  giltCartography,
} from "../src/index"
import type { Theme, ThemeTokens } from "../src/index"

// Mock DOM environment
function createMockElement(): HTMLElement {
  const styles = new Map<string, string>()
  const attributes = new Map<string, string>()
  return {
    style: {
      setProperty: (key: string, value: string) => styles.set(key, value),
      removeProperty: (key: string) => { styles.delete(key); return "" },
      getPropertyValue: (key: string) => styles.get(key) ?? "",
    },
    setAttribute: (key: string, value: string) => attributes.set(key, value),
    removeAttribute: (key: string) => attributes.delete(key),
    getAttribute: (key: string) => attributes.get(key) ?? null,
    _styles: styles,
    _attributes: attributes,
  } as unknown as HTMLElement
}

describe("createTheme", () => {
  it("returns correct Theme object with name, light, and dark tokens", () => {
    const light: ThemeTokens = { accent: "#fff", bg: "#000" }
    const dark: ThemeTokens = { accent: "#000", bg: "#fff" }
    const theme = createTheme("myTheme", light, dark)

    expect(theme.name).toBe("myTheme")
    expect(theme.light).toEqual(light)
    expect(theme.dark).toEqual(dark)
  })

  it("preserves all token keys", () => {
    const light: ThemeTokens = {
      accent: "#C5A03F",
      accentHover: "#D4AD4A",
      bg: "#F5F3EE",
      surface1: "#ECEAE4",
    }
    const dark: ThemeTokens = {
      accent: "#D4AD4A",
      accentHover: "#E0BC58",
      bg: "#191714",
      surface1: "#232019",
    }
    const theme = createTheme("test", light, dark)
    expect(Object.keys(theme.light)).toHaveLength(4)
    expect(Object.keys(theme.dark)).toHaveLength(4)
  })
})

describe("applyTheme", () => {
  let root: HTMLElement

  beforeEach(() => {
    root = createMockElement()
    // Mock documentElement
    vi.stubGlobal("document", { documentElement: root })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("sets CSS variables on root for light mode", () => {
    const theme = createTheme("test", { accent: "#C5A03F", bg: "#F5F3EE" }, { accent: "#D4AD4A", bg: "#191714" })
    applyTheme(theme, "light")

    const styles = (root as unknown as { _styles: Map<string, string> })._styles
    expect(styles.get("--color-accent")).toBe("#C5A03F")
    expect(styles.get("--color-bg")).toBe("#F5F3EE")
  })

  it("sets CSS variables on root for dark mode", () => {
    const theme = createTheme("test", { accent: "#C5A03F", bg: "#F5F3EE" }, { accent: "#D4AD4A", bg: "#191714" })
    applyTheme(theme, "dark")

    const styles = (root as unknown as { _styles: Map<string, string> })._styles
    expect(styles.get("--color-accent")).toBe("#D4AD4A")
    expect(styles.get("--color-bg")).toBe("#191714")
  })

  it("sets data-theme and data-mode attributes", () => {
    const theme = createTheme("gilt", { accent: "#fff" }, { accent: "#000" })
    applyTheme(theme, "light")

    const attrs = (root as unknown as { _attributes: Map<string, string> })._attributes
    expect(attrs.get("data-theme")).toBe("gilt")
    expect(attrs.get("data-mode")).toBe("light")
  })

  it("applies to custom target element", () => {
    const custom = createMockElement()
    const theme = createTheme("custom", { accent: "#abc" }, { accent: "#def" })
    applyTheme(theme, "dark", custom)

    const styles = (custom as unknown as { _styles: Map<string, string> })._styles
    expect(styles.get("--color-accent")).toBe("#def")

    const attrs = (custom as unknown as { _attributes: Map<string, string> })._attributes
    expect(attrs.get("data-theme")).toBe("custom")
    expect(attrs.get("data-mode")).toBe("dark")
  })

  it("converts camelCase token keys to kebab-case CSS vars (e.g. accentHover -> --color-accent-hover)", () => {
    const theme = createTheme("test", { accentHover: "#D4AD4A" }, { accentHover: "#E0BC58" })
    applyTheme(theme, "light")

    const styles = (root as unknown as { _styles: Map<string, string> })._styles
    expect(styles.get("--color-accent-hover")).toBe("#D4AD4A")
    expect(styles.has("--color-accentHover")).toBe(false)
  })

  it("throws on invalid mode", () => {
    const theme = createTheme("test", { accent: "#fff" }, { accent: "#000" })
    expect(() => applyTheme(theme, "invalid" as "light")).toThrow()
  })

  it("throws on null theme", () => {
    expect(() => applyTheme(null as unknown as Theme, "light")).toThrow()
  })

  it("handles empty tokens object", () => {
    const theme = createTheme("empty", {}, {})
    // Should not throw
    applyTheme(theme, "light")

    const attrs = (root as unknown as { _attributes: Map<string, string> })._attributes
    expect(attrs.get("data-theme")).toBe("empty")
    expect(attrs.get("data-mode")).toBe("light")
  })
})

describe("removeTheme", () => {
  let root: HTMLElement

  beforeEach(() => {
    root = createMockElement()
    vi.stubGlobal("document", { documentElement: root })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("clears CSS vars, data-theme, and data-mode", () => {
    const theme = createTheme("test", { accent: "#C5A03F", bg: "#F5F3EE" }, { accent: "#D4AD4A", bg: "#191714" })
    applyTheme(theme, "light")
    removeTheme()

    const styles = (root as unknown as { _styles: Map<string, string> })._styles
    const attrs = (root as unknown as { _attributes: Map<string, string> })._attributes
    expect(styles.size).toBe(0)
    expect(attrs.has("data-theme")).toBe(false)
    expect(attrs.has("data-mode")).toBe(false)
  })

  it("clears from custom target element", () => {
    const custom = createMockElement()
    const theme = createTheme("test", { accent: "#fff" }, { accent: "#000" })
    applyTheme(theme, "dark", custom)
    removeTheme(custom)

    const styles = (custom as unknown as { _styles: Map<string, string> })._styles
    const attrs = (custom as unknown as { _attributes: Map<string, string> })._attributes
    expect(styles.size).toBe(0)
    expect(attrs.has("data-theme")).toBe(false)
  })
})

describe("persistence", () => {
  let mockStorage: Map<string, string>
  let mockMatchMedia: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockStorage = new Map()
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => mockStorage.get(key) ?? null,
      setItem: (key: string, value: string) => mockStorage.set(key, value),
      removeItem: (key: string) => mockStorage.delete(key),
    })

    mockMatchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    vi.stubGlobal("window", { matchMedia: mockMatchMedia })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("getPreferredMode returns stored value from localStorage", () => {
    mockStorage.set("tide-theme-mode", "dark")
    expect(getPreferredMode()).toBe("dark")
  })

  it("getPreferredMode falls back to system preference (dark)", () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    expect(getPreferredMode()).toBe("dark")
  })

  it("getPreferredMode falls back to system preference (light)", () => {
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    expect(getPreferredMode()).toBe("light")
  })

  it("setPreferredMode persists to localStorage", () => {
    setPreferredMode("dark")
    expect(mockStorage.get("tide-theme-mode")).toBe("dark")

    setPreferredMode("light")
    expect(mockStorage.get("tide-theme-mode")).toBe("light")
  })

  it("onSystemModeChange registers listener and returns cleanup fn", () => {
    const addEventListener = vi.fn()
    const removeEventListener = vi.fn()
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener,
      removeEventListener,
    })

    const cb = vi.fn()
    const cleanup = onSystemModeChange(cb)

    expect(addEventListener).toHaveBeenCalledWith("change", expect.any(Function))

    // Call cleanup
    cleanup()
    expect(removeEventListener).toHaveBeenCalledWith("change", expect.any(Function))
  })

  it("onSystemModeChange callback receives correct mode on change", () => {
    const listeners: Array<(e: { matches: boolean }) => void> = []
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: (_: string, fn: (e: { matches: boolean }) => void) => listeners.push(fn),
      removeEventListener: vi.fn(),
    })

    const cb = vi.fn()
    onSystemModeChange(cb)

    // Simulate dark mode activation
    listeners[0]({ matches: true })
    expect(cb).toHaveBeenCalledWith("dark")

    // Simulate light mode activation
    listeners[0]({ matches: false })
    expect(cb).toHaveBeenCalledWith("light")
  })
})

describe("giltCartography preset", () => {
  it("has correct name", () => {
    expect(giltCartography.name).toBe("giltCartography")
  })

  it("has correct light accent color", () => {
    expect(giltCartography.light.accent).toBe("#C5A03F")
  })

  it("has correct dark accent color", () => {
    expect(giltCartography.dark.accent).toBe("#D4AD4A")
  })

  it("has all expected token keys in light mode", () => {
    const expectedKeys = [
      "accent", "accentHover", "bg", "surface1", "surface2", "surface3",
      "ink1", "ink2", "ink3", "border", "success", "error", "warning", "info",
    ]
    for (const key of expectedKeys) {
      expect(giltCartography.light).toHaveProperty(key)
    }
  })

  it("has all expected token keys in dark mode", () => {
    const expectedKeys = [
      "accent", "accentHover", "bg", "surface1", "surface2", "surface3",
      "ink1", "ink2", "ink3", "border", "success", "error", "warning", "info",
    ]
    for (const key of expectedKeys) {
      expect(giltCartography.dark).toHaveProperty(key)
    }
  })
})

describe("edge cases", () => {
  let root: HTMLElement

  beforeEach(() => {
    root = createMockElement()
    vi.stubGlobal("document", { documentElement: root })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("handles undefined values in tokens gracefully", () => {
    const theme = createTheme("test", { accent: undefined as unknown as string }, { accent: "#000" })
    // Should not throw, just skip undefined values
    applyTheme(theme, "light")
    const styles = (root as unknown as { _styles: Map<string, string> })._styles
    expect(styles.has("--color-accent")).toBe(false)
  })
})
