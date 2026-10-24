import { Link } from 'react-router'

type NavProps = {
  onLinkClick?: () => void
}

function Nav({ onLinkClick }: NavProps) {
  return (
    <nav aria-label="Primary navigation" className="nav-links">
      <Link to="/" onClick={onLinkClick}>Home</Link>
      <Link to="/about" onClick={onLinkClick}>About</Link>
      <Link to="/colmn-dev" onClick={onLinkClick}>ColmN-Dev</Link>
      <Link to="/contact" onClick={onLinkClick}>Contact</Link>
    </nav>
  )
}

export default Nav