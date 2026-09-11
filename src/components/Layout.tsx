import { Link, Outlet } from 'react-router-dom'
import { SITE_NAME } from '../config'

export function Layout() {
  return (
    <div className="layout">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="site-logo">
            {SITE_NAME}
          </Link>
          <nav className="site-nav">
            <Link to="/">首页</Link>
            <Link to="/about">关于</Link>
          </nav>
        </div>
      </header>
      <main className="site-main container">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">
          <p>
            © {new Date().getFullYear()} {SITE_NAME} · Built with Vite + React
          </p>
        </div>
      </footer>
    </div>
  )
}
