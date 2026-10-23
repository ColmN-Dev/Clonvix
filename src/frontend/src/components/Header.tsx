import Nav from './Nav'
import ThemeToggle from './ThemeToggle'
import { Link } from 'react-router'
import logo from '../assets/clonvix-logo.png'

function Header() {
  return (
    <header className="site-header">
      <Link className="site-brand" to="/">
        <img alt="Clonvix logo" src={logo} />
        <span>Clonvix</span>
      </Link>
      <Nav />
      <ThemeToggle />
    </header>
  )
}

export default Header