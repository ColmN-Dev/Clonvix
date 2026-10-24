import { Link } from 'react-router'
import logo from '../assets/clonvix-logo.png'


function GithubIcon({ size = 25 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.38-3.37-1.38-.46-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1.01.08 1.54 1.07 1.54 1.07.9 1.58 2.36 1.12 2.94.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.18 9.18 0 0 1 12 6.93a9.2 9.2 0 0 1 2.5.35c1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.35 4.8-4.58 5.06.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.25 10.25 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z" />
    </svg>
  )
}

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