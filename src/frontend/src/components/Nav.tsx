import { Link } from 'react-router'

type NavProps = {
  onLinkClick?: () => void
}

function Nav({ onLinkClick }: NavProps) {
  return (
    <nav aria-label="Primary navigation" className="nav-links">
      <Link to="/" onClick={() => { onLinkClick?.(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Home</Link>
      <Link to="/about" onClick={() => { onLinkClick?.(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>About</Link>
      <Link to="/colmn-dev" onClick={() => { onLinkClick?.(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>ColmN-Dev</Link>
      <Link to="/contact" onClick={() => { onLinkClick?.(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Contact</Link>
    </nav>
  )
}

export default Nav