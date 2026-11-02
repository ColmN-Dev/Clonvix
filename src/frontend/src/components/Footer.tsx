import { Link } from 'react-router'
import logo from '../assets/clonvix-logo.png'
import GithubIcon from './GithubIcon'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div>
          <Link className="footer-brand" to="/">
            <img className="footer-logo" alt="Clonvix logo" src={logo} />
            <span className="footer-title">Clonvix</span>
          </Link>
          <p className="footer-description">
            Search public repositories, explore source code, and connect with developers.
          </p>
        </div>

        <div>
          <h2 className="footer-heading">Explore</h2>
          <nav aria-label="Footer navigation" className="footer-links">
            <Link to="/">Home</Link>
          </nav>
        </div>

        <div>
          <h2 className="footer-heading">Information</h2>
          <nav aria-label="Information navigation" className="footer-links">
            <Link to="/colmn-dev">ColmN-Dev</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>

        <div>
          <h2 className="footer-heading">Connect</h2>
          <a
            className="footer-github"
            href="https://github.com/ColmN-Dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon size={25} />
            GitHub
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Clonvix. All rights reserved.</p>
        <p className="footer-built-with">Built with Django and React</p>
      </div>
    </footer>
  )
}

export default Footer