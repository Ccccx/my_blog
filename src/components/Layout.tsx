import { Link, NavLink, Outlet } from 'react-router-dom'
import { GITHUB_REPO, SITE_NAME } from '../config'
import { WaifuCompanion } from './WaifuCompanion'

export function Layout() {
  return (
    <div className="layout">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="site-logo">
            <span className="site-logo-mark" aria-hidden="true" />
            <span>
              {SITE_NAME}
              <small>Soft UI Evolution</small>
            </span>
          </Link>
          <nav className="site-nav">
            <NavLink to="/" end>
              首页
            </NavLink>
            <NavLink to="/about">关于</NavLink>
            <a href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
        </div>
      </header>
      <main className="site-main container">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <strong>{SITE_NAME}</strong>
            <p>Vite · React · 开源观察</p>
          </div>
          <p>© {new Date().getFullYear()} · 部署于 GitHub Pages</p>
        </div>
      </footer>
      <WaifuCompanion />
    </div>
  )
}
