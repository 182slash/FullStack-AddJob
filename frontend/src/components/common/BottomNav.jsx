import { NavLink, useLocation } from 'react-router-dom'
import { Home, Search, Bookmark, FileText, User, Briefcase, PlusSquare, Users, BarChart2, Building2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const SeekerNav = () => (
  <nav className="bottom-nav__items">
    {[
      { to: '/seeker/dashboard',      Icon: Home,      label: 'Beranda' },
      { to: '/jobs',                  Icon: Search,    label: 'Cari Kerja' },
      { to: '/seeker/applications',   Icon: FileText,  label: 'Lamaran' },
      { to: '/seeker/saved',          Icon: Bookmark,  label: 'Disimpan' },
      { to: '/seeker/profile',        Icon: User,      label: 'Profil' },
    ].map(({ to, Icon, label }) => (
      <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
        <Icon size={22} />
        <span className="bottom-nav__label">{label}</span>
      </NavLink>
    ))}
  </nav>
)

const EmployerNav = () => (
  <nav className="bottom-nav__items">
    {[
      { to: '/employer/dashboard', Icon: BarChart2,  label: 'Dashboard' },
      { to: '/employer/jobs',      Icon: Briefcase,  label: 'Lowongan' },
      { to: '/employer/post-job', Icon: PlusSquare, label: 'Pasang' },
      { to: '/employer/applicants',Icon: Users,      label: 'Pelamar' },
      { to: '/employer/company', Icon: Building2, label: 'Profil' },
    ].map(({ to, Icon, label }) => (
      <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
        <Icon size={22} />
        <span className="bottom-nav__label">{label}</span>
      </NavLink>
    ))}
  </nav>
)

const PublicNav = () => (
  <nav className="bottom-nav__items">
    {[
      { to: '/',         Icon: Home,    label: 'Beranda' },
      { to: '/jobs',     Icon: Search,  label: 'Lowongan' },
      { to: '/articles', Icon: FileText,label: 'Artikel' },
      { to: '/login',    Icon: User,    label: 'Masuk' },
    ].map(({ to, Icon, label }) => (
      <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`} end={to === '/'}>
        <Icon size={22} />
        <span className="bottom-nav__label">{label}</span>
      </NavLink>
    ))}
  </nav>
)

const BottomNav = () => {
  const { isAuthenticated, isSeeker, isEmployer } = useAuth()

  return (
    <div className="bottom-nav">
      {!isAuthenticated && <PublicNav />}
      {isAuthenticated && isSeeker && <SeekerNav />}
      {isAuthenticated && isEmployer && <EmployerNav />}
    </div>
  )
}

export default BottomNav
