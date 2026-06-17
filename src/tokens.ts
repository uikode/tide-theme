import { createTheme } from "./createTheme"
import type { Theme } from "./createTheme"

/**
 * Gilt Cartography — a warm gold-and-parchment preset theme.
 */
export const giltCartography: Theme = createTheme(
  "giltCartography",
  {
    accent: "#C5A03F",
    accentHover: "#D4AD4A",
    bg: "#F5F3EE",
    surface1: "#ECEAE4",
    surface2: "#E4E2DC",
    surface3: "#DBD9D3",
    ink1: "#12110E",
    ink2: "#4A4843",
    ink3: "#8A8780",
    border: "#DBD9D3",
    success: "#3D8B5F",
    error: "#B8443A",
    warning: "#C5A03F",
    info: "#5C7A8A",
  },
  {
    accent: "#D4AD4A",
    accentHover: "#E0BC58",
    bg: "#191714",
    surface1: "#232019",
    surface2: "#2D2A22",
    surface3: "#38342B",
    ink1: "#F5F3EE",
    ink2: "#C4C1BA",
    ink3: "#8A8780",
    border: "#38342B",
    success: "#3D8B5F",
    error: "#B8443A",
    warning: "#C5A03F",
    info: "#5C7A8A",
  }
)
