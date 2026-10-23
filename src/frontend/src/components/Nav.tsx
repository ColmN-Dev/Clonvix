import { Link } from 'react-router'

function Nav() {
  return (
    <nav aria-label="Primary navigation" className="nav-links">
      <Link to="/">Home</Link>
      |
      <Link to="/about">About</Link>
      |
      <Link to="/colmn-dev">ColmN-Dev</Link>
      |
      <Link to="/contact">Contact</Link>
    </nav>
  )
}

export default Nav