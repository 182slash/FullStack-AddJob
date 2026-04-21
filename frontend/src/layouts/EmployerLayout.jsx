import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart2, Briefcase, Users, Building2,
  CreditCard, PlusSquare, LogOut,
} from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import BottomNav from '@/components/common/BottomNav'
import Avatar from '@/components/common/Avatar'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { to: '/employer/dashboard',      Icon: BarChart2,   label: 'Dashboard' },
  { to: '/employer/jobs',           Icon: Briefcase,   label: 'Lowongan Saya' },
  { to: '/employer/post-job',       Icon: PlusSquare,  label: 'Pasang Lowongan', accent: true },
  { to: '/employer/applicants',     Icon: Users,       label: 'Manajemen Pelamar' },
  { to: '/employer/company', Icon: Building2, label: 'Profil Perusahaan' },
  { to: '/employer/subscription',   Icon: CreditCard,  label: 'Langganan' },
]

const Sidebar = () => {
  const { user, logout } = useAuth()

  return (
    <aside className="sidebar">
      {/* Company Info */}
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border-light)', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={user?.company?.name || user?.name} src={user?.company?.logo} size="md" />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--dark)', fontFamily: 'var(--font-heading)' }} className="truncate">
              {user?.company?.name || user?.name}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
              {user?.plan === 'premium' ? '⭐ Premium' : 'Employer'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <p className="sidebar__label">Menu Utama</p>
      </div>

      {NAV_ITEMS.map(({ to, Icon, label, accent }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/employer/dashboard'}
          className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}
          style={accent ? { color: 'var(--primary)', fontWeight: 600 } : {}}
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

const EmployerLayout = () => {
  const { isAuthenticated, isEmployer, loading } = useAuth()

  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isEmployer) return <Navigate to="/seeker/dashboard" replace />

  return (
    <>
      <Navbar />
      <div className="page-wrapper page-wrapper--dashboard">
        <Sidebar />
        <motion.main
          className="dashboard-main"
          key="employer"
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

export default EmployerLayout
