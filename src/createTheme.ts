/**
 * Theme token map. Keys are camelCase token names, values are CSS color strings.
 */
export interface ThemeTokens {
  [key: string]: string
}

/**
 * A complete theme with name and light/dark token sets.
 */
export interface Theme {
  readonly name: string
  readonly light: ThemeTokens
  readonly dark: ThemeTokens
}

/**
 * Creates a Theme object from a name and light/dark token sets.
 */
export function createTheme(name: string, light: ThemeTokens, dark: ThemeTokens): Theme {
  return Object.freeze({ name, light, dark })
}
