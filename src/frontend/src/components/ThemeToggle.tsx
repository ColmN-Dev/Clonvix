import { useState, useEffect, useRef } from 'react'
import { Monitor, Sun, Moon } from 'lucide-react'

// Restrict the theme to system, light, or dark
type Theme = 'system' | 'light' | 'dark'

function ThemeToggle() {
  // Store whether the theme dropdown is open
  const [isOpen, setIsOpen] = useState(false)

  // Load the saved theme from localStorage, defaulting to system preference
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'system'
  )

  // Reference the dropdown container to detect clicks outside it
  const toggleRef = useRef<HTMLDivElement>(null)

  // Close the dropdown when a click occurs outside the component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check that the container exists and the click target is outside it
      if (toggleRef.current && !toggleRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    // Listen for mouse clicks across the document
    document.addEventListener('mousedown', handleClickOutside)

    // Remove the event listener when the component unmounts
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Apply the selected theme and save the preference whenever the theme changes
  useEffect(() => {
    if (theme === 'system') {
      // Remove the theme override so CSS follows the operating system preference
      document.documentElement.removeAttribute('data-theme')
    } else {
      // Set the theme attribute to apply the selected light or dark styles
      document.documentElement.setAttribute('data-theme', theme)
    }

    // Save the selected theme so it persists after a page refresh
    localStorage.setItem('theme', theme)
  }, [theme])

  // Update the selected theme and close the dropdown
  function changeTheme(newTheme: Theme) {
    setTheme(newTheme)
    setIsOpen(false)
  }

  // Select the icon that matches the current theme
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  return (
    <div className="theme-toggle" ref={toggleRef}>
      <button
        type="button"
        // Toggle the dropdown between open and closed
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme"
        aria-expanded={isOpen}
        // Display the current theme in the button tooltip
        title={`Current theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
      >
        <Icon size={25} />
      </button>

      {/* Render the dropdown only when isOpen is true */}
      {isOpen && (
        <div className="theme-menu">
          {/* Select the system theme and close the dropdown */}
          <button type="button" onClick={() => changeTheme('system')}>
            <Monitor size={20} /> System
          </button>

          {/* Select the light theme and close the dropdown */}
          <button type="button" onClick={() => changeTheme('light')}>
            <Sun size={20} /> Light
          </button>

          {/* Select the dark theme and close the dropdown */}
          <button type="button" onClick={() => changeTheme('dark')}>
            <Moon size={20} /> Dark
          </button>
        </div>
      )}
    </div>
  )
}

export default ThemeToggle