import { useState, useEffect, useRef } from 'react'
import { Monitor, Sun, Moon } from 'lucide-react'

type Theme = 'system' | 'light' | 'dark'

function ThemeToggle() {
  const [isOpen, setIsOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'system'
  )

  const toggleRef = useRef<HTMLDivElement>(null)

  // Close the dropdown when clicking outside it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toggleRef.current && !toggleRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Apply the selected theme and save the preference
  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }

    localStorage.setItem('theme', theme)
  }, [theme])

  function changeTheme(theme: Theme) {
    setTheme(theme)
    setIsOpen(false)
  }

  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  return (
    <div className="theme-toggle" ref={toggleRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme"
        aria-expanded={isOpen}
        title={`Current theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
      >
        <Icon size={25} />
      </button>

      {isOpen && (
        <div className="theme-menu">
          <button type="button" onClick={() => changeTheme('system')}>
            <Monitor size={20} /> System
          </button>
          <button type="button" onClick={() => changeTheme('light')}>
            <Sun size={20} /> Light
          </button>
          <button type="button" onClick={() => changeTheme('dark')}>
            <Moon size={20} /> Dark
          </button>
        </div>
      )}
    </div>
  )
}

export default ThemeToggle