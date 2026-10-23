import { Link } from 'react-router'
import logo from '../assets/clonvix-logo.png'
import githubIcon from '../assets/github-icon.png'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div>
          <Link className="footer-brand" to="/">
            <img alt="Clonvix logo" src={logo} />
            <span>Clonvix</span>
          </Link>
          <p className="footer-description">
            Search public repositories, explore source code, and connect with developers.
          </p>
        </div>

        <div>
          <h2 className="footer-heading">Explore</h2>
          <nav aria-label="Footer navigation" className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/colmn-dev">ColmN-Dev</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>

        <div>
          <h2 className="footer-heading">Find me on GitHub</h2>
          <a
            className="footer-github"
            href="https://github.com/ColmN-Dev"
            rel="noreferrer"
            target="_blank"
          >
            <img src={githubIcon} alt="" aria-hidden="true" />
            <span>ColmN-Dev on GitHub</span>
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Clonvix. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer