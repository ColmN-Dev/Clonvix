import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Menu, X } from 'lucide-react'
import Nav from './Nav'
import ThemeToggle from './ThemeToggle'
import logo from '../assets/clonvix-logo.png'

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  // Stop the page scrolling behind the menu while it is open
  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="site-header">
      <Link className="site-brand" to="/" onClick={closeMenu}>
        <img className="logo" alt="Clonvix logo" src={logo} />
        <span className="title">Clonvix</span>
      </Link>

      {/* Desktop nav (hidden on small screens) */}
      <Nav />

      <div className="header-actions">
        <ThemeToggle />
        <button
          type="button"
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menu overlay */}
      <div
        className={`menu-overlay ${menuOpen ? 'active' : ''}`}
        onClick={closeMenu}
      />

      {/* Slide-out menu (small screens only) */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Nav onLinkClick={closeMenu} />
      </div>
    </header>
  )
}

export default Header