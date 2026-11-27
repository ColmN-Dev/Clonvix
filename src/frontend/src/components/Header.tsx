import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { Menu, X } from 'lucide-react'
import Nav from './Nav'
import ThemeToggle from './ThemeToggle'
import logo from '../assets/clonvix-logo.png'
import type { ClonvixProfile } from '../types/clonvix_profile'

type HeaderProps = {
    user: { id: number; email: string; username: string } | null
    setUser: React.Dispatch<React.SetStateAction<{ id: number; email: string; username: string } | null>>
}

function Header({ user, setUser }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profile, setProfile] = useState<ClonvixProfile | null>(null)

  useEffect(() => {
      if (!user) return

      // Fetch the user's profile data when the user state changes
      async function fetchProfile() {
          try {
              const response = await fetch('/api/accounts/profile/', {
                  credentials: 'include',
              })

              if (!response.ok) throw new Error('Failed to fetch profile.')

              const data: ClonvixProfile = await response.json()
              setProfile(data)
          } catch (error) {
              console.error('Failed to fetch profile:', error)
          }
      }

      fetchProfile()
  }, [user])

  // Stop the page scrolling behind the menu while it is open
  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  function closeMenu() {
    setMenuOpen(false)
  }

  const navigate = useNavigate()

  // Handle user logout
  async function handleLogout() {
    try {
      await fetch('/api/accounts/csrf/', {
        credentials: 'include',
      })

      const csrfToken = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('csrftoken='))
        ?.split('=')[1]

      const response = await fetch('/api/accounts/logout/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken || '',
        },
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Logout failed')

      setUser(null)
      closeMenu()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="site-header">
      <Link className="site-brand" to="/" onClick={closeMenu}>
        <img className="logo" alt="Clonvix logo" src={logo} />
        <span className="title">Clonvix</span>
      </Link>

      {/* Desktop nav (hidden on small screens) */}
      <Nav />

      <div className="header-right">
        <div className="auth-links">
          {user ? (
            <>
            {profile?.image && (
              <Link to="/profile" className="profile-link">
                  <img
                      src={profile.image}
                      alt={`${profile.username}'s avatar`}
                      className="profile-avatar"
                      onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = '/default.png'
                      }}
                  />
              </Link>
            )}
              <button type="button" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/signup">Sign up</Link>
              <Link to="/login">Log in</Link>
            </>
          )}
        </div>

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
      </div>

      {/* Menu overlay */}
      <div
        className={`menu-overlay ${menuOpen ? 'active' : ''}`}
        onClick={closeMenu}
      />

      {/* Slide-out menu (small screens only) */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Nav onLinkClick={closeMenu} />
          <nav className="nav-links" aria-label="Account navigation">
            {user ? (
              <>
                <Link to="/profile" onClick={closeMenu} className="mobile-profile-link">
                    <span>Profile</span>
                    {profile?.image && (
                        <img src={profile.image} alt="" className="mobile-profile-avatar" />
                    )}
                </Link>
                <button type="button" onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <>
                <Link to="/signup" onClick={closeMenu}>Sign up</Link>
                <Link to="/login" onClick={closeMenu}>Log in</Link>
              </>
            )}
          </nav>
      </div>
    </header>
  )
}

export default Header