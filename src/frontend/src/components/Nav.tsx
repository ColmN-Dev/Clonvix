import { Link } from 'react-router'
import { scrollToTop } from '../utils/scrollToTop'

type NavProps = {
  onLinkClick?: () => void
}

function Nav({ onLinkClick }: NavProps) {

  function handleNavigation() {
    onLinkClick?.()
    scrollToTop()
}

  return (
    <nav aria-label="Primary navigation" className="nav-links">
      <Link to="/" onClick={handleNavigation}>Home</Link>
      <Link to="/search" onClick={handleNavigation}>Search</Link>
      <Link to="/topics" onClick={handleNavigation}>Topics</Link>
      <Link to="/about" onClick={handleNavigation}>About</Link>
      <Link to="/ColmN-Dev" onClick={handleNavigation}>ColmN-Dev</Link>
      <Link to="/contact" onClick={handleNavigation}>Contact</Link>
    </nav>
  )
}

export default Nav