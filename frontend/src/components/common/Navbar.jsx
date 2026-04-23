import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, Search, ChevronDown, LogOut, User, Settings,
  Bell, LayoutDashboard, Plus,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Avatar from './Avatar'

const Navbar = () => {
  const { user, isAuthenticated, isSeeker, isEmployer, logout } = useAuth()
  const navigate  = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [dropdown, setDropdown]   = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setDropdown(false)
  }

  const logoHref = isEmployer ? '/employer/dashboard' : '/'

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">

        {/* Logo */}
        <Link to={logoHref} className="navbar__logo">
          <img src="/logo/addjob-logo.png" alt="AddJob" style={{ height: 36 }} />
        </Link>

        {/* Center Nav */}
        <nav className="navbar__nav">
          <NavLink to="/jobs" className={({ isActive }) => `navbar__nav-link ${isActive ? 'active' : ''}`}>
            Lowongan
          </NavLink>
          <NavLink to="/articles" className={({ isActive }) => `navbar__nav-link ${isActive ? 'active' : ''}`}>
            Artikel Karir
          </NavLink>
          {isSeeker && (
            <NavLink to="/seeker/coaching" className={({ isActive }) => `navbar__nav-link ${isActive ? 'active' : ''}`}>
              Bimbingan
            </NavLink>
          )}
        </nav>

        {/* Right Actions */}
        <div className="navbar__actions">
          {isAuthenticated ? (
            <>
              {/* Dashboard shortcut */}
              
<Link
  to={isEmployer ? '/employer/dashboard' : '/seeker/dashboard'}
  className="btn btn--ghost btn--sm hide-mobile"
  style={{ gap: 6 }}
>
  <LayoutDashboard size={16} />
  <span>Dashboard</span>
</Link>
<Link
  to={isEmployer ? '/employer/dashboard' : '/seeker/dashboard'}
  className="btn btn--ghost btn--sm show-mobile"
  style={{ padding: '6px 8px' }}
  title="Dashboard"
>
  <LayoutDashboard size={18} />
</Link>

              {isEmployer && (
  <>
    <Link to="/employer/post-job" className="btn btn--primary btn--sm hide-mobile">
      <Plus size={15} /> Pasang Lowongan
    </Link>
    <Link to="/employer/company" className="btn btn--ghost btn--sm show-mobile" style={{ gap: 6, display:'none' }}>
      <User size={16} />
    </Link>
  </>
)}

              {/* User dropdown */}
              <div className="dropdown" ref={dropRef}>
                <button
                  onClick={() => setDropdown(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 'var(--radius)' }}
                >
                  <Avatar name={user?.name} src={user?.avatar} size="sm" />
                  <span className="hide-mobile" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--dark)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
  {user?.name?.split(' ')[0]}
</span>
                  <ChevronDown size={14} style={{ color: 'var(--muted)', flexShrink: 0, transform: dropdown ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                </button>

                <AnimatePresence>
                  {dropdown && (
                    <motion.div
                      className="dropdown__menu"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--dark)' }}>{user?.name}</p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{user?.email}</p>
                      </div>

                      <Link
                        to={isEmployer ? '/employer/dashboard' : '/seeker/dashboard'}
                        className="dropdown__item"
                        onClick={() => setDropdown(false)}
                      >
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>

                      <Link
                        to={isEmployer ? '/employer/company' : '/seeker/profile'}
                        className="dropdown__item"
                        onClick={() => setDropdown(false)}
                      >
                        <User size={16} /> Profil Saya
                      </Link>

                      <div style={{ height: 1, background: 'var(--border-light)', margin: '4px 0' }} />

                      <button className="dropdown__item dropdown__item--danger" onClick={handleLogout}>
                        <LogOut size={16} /> Keluar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost btn--sm">Masuk</Link>
              <Link to="/register" className="btn btn--primary btn--sm">
  <span className="hide-mobile">Daftar Gratis</span>
  <span className="show-mobile" style={{ display: 'none' }}>Daftar</span>
</Link>
            </>
          )}
        </div>

      </div>
    </header>
  )
}

export default Navbar