import React, { createContext, useContext, useEffect, useState } from 'react'

interface ThemeState {
  theme: 'light' | 'dark'
  toggle(): void
  setTheme(t: 'light' | 'dark'): void
}

const ThemeContext = createContext<ThemeState | null>(null)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function toggle() { setTheme(t => t === 'light' ? 'dark' : 'light') }

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('ThemeProvider missing')
  return ctx
}
