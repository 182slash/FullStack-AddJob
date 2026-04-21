import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Search, FileText, Bookmark,
  User, GraduationCap, LogOut, ChevronRight,
} from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import BottomNav from '@/components/common/BottomNav'
import Avatar from '@/components/common/Avatar'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { to: '/seeker/dashboard',     Icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs',                 Icon: Search,          label: 'Cari Lowongan' },
  { to: '/seeker/applications',  Icon: FileText,        label: 'Lamaran Saya' },
  { to: '/seeker/saved',         Icon: Bookmark,        label: 'Lowongan Disimpan' },
  { to: '/seeker/coaching',      Icon: GraduationCap,   label: 'Bimbingan Karir' },
  { to: '/seeker/profile',       Icon: User,            label: 'Profil Saya' },
]

const Sidebar = () => {
  const { user, logout } = useAuth()

  return (
    <aside className="sidebar">
      {/* User Info */}
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border-light)', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={user?.name} src={user?.avatar} size="md" />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--dark)', fontFamily: 'var(--font-heading)' }} className="truncate">
              {user?.name}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--muted)' }} className="truncate">
              Pencari Kerja
            </p>
          </div>
        </div>
      </div>

      <div className="sidebar__section">
        <p className="sidebar__label">Menu Utama</p>
      </div>

      {NAV_ITEMS.map(({ to, Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/seeker/dashboard'}
          className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}

      <div style={{ marginTop: 'auto', padding: '0 12px', paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
        <button
          onClick={logout}
          className="sidebar__link"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--error)' }}
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  )
}

const SeekerLayout = () => {
  const { isAuthenticated, isSeeker, loading } = useAuth()

  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isSeeker) return <Navigate to="/employer/dashboard" replace />

  return (
    <>
      <Navbar />
      <div className="page-wrapper page-wrapper--dashboard">
        <Sidebar />
        <motion.main
          className="dashboard-main"
          key="seeker"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.main>
      </div>
      <BottomNav />
    </>
  )
}

export default SeekerLayout
