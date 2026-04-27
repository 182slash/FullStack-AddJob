import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from '@/layouts/PublicLayout'
import SeekerLayout from '@/layouts/SeekerLayout'
import EmployerLayout from '@/layouts/EmployerLayout'
import SalesLayout from '@/layouts/SalesLayout'
import SuperAdminLayout from '@/layouts/SuperAdminLayout'
import { useAuth } from '@/context/AuthContext'
import Terms   from '@/pages/public/Terms'
import Privacy from '@/pages/public/Privacy'

const PageLoader = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--accent-light)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Memuat...</p>
    </div>
  </div>
)

// Public
const Landing        = lazy(() => import('@/pages/public/Landing'))
const JobList        = lazy(() => import('@/pages/seeker/JobList'))
const JobDetail      = lazy(() => import('@/pages/public/JobDetail'))
const CompanyProfile = lazy(() => import('@/pages/public/CompanyProfile'))
const Articles       = lazy(() => import('@/pages/public/Articles'))
const ArticleDetail  = lazy(() => import('@/pages/public/ArticleDetail'))

// Pre-register & Coming Soon
const PreRegister    = lazy(() => import('@/pages/public/PreRegister'))
const ComingSoon     = lazy(() => import('@/pages/public/ComingSoon'))

// Auth
const RoleSelect     = lazy(() => import('@/pages/auth/RoleSelect'))
const Login          = lazy(() => import('@/pages/auth/Login'))
const Register       = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))

// Seeker
const SeekerDashboard = lazy(() => import('@/pages/seeker/Dashboard'))
const SeekerJobList   = lazy(() => import('@/pages/seeker/JobList'))
const ApplyJob        = lazy(() => import('@/pages/seeker/ApplyJob'))
const MyApplications  = lazy(() => import('@/pages/seeker/MyApplications'))
const SavedJobs       = lazy(() => import('@/pages/seeker/SavedJobs'))
const SeekerProfile   = lazy(() => import('@/pages/seeker/Profile'))
const Coaching        = lazy(() => import('@/pages/seeker/Coaching'))

// Employer
const EmployerDashboard = lazy(() => import('@/pages/employer/Dashboard'))
const PostJob           = lazy(() => import('@/pages/employer/PostJob'))
const EditJob           = lazy(() => import('@/pages/employer/EditJob'))
const MyJobs            = lazy(() => import('@/pages/employer/MyJobs'))
const Applicants        = lazy(() => import('@/pages/employer/Applicants'))
const EmployerCompany   = lazy(() => import('@/pages/employer/CompanyProfile'))
const Subscription      = lazy(() => import('@/pages/employer/Subscription'))

// Sales
const SalesDashboard = lazy(() => import('@/pages/sales/Dashboard'))
const SalesLogin     = lazy(() => import('@/pages/sales/Login'))

// Super Admin
const SuperAdminDashboard = lazy(() => import('@/pages/superadmin/Dashboard'))
const SuperAdminLogin     = lazy(() => import('@/pages/superadmin/Login'))
const SuperAdminSales     = lazy(() => import('@/pages/superadmin/Sales'))


// Redirects authenticated users away from auth pages based on their role
const AuthRedirect = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return children
  if (user?.role === 'seeker')     return <Navigate to="/seeker/dashboard"     replace />
  if (user?.role === 'employer')   return <Navigate to="/employer/dashboard"   replace />
  if (user?.role === 'sales')      return <Navigate to="/sales/dashboard"      replace />
  if (user?.role === 'superadmin') return <Navigate to="/superadmin/dashboard" replace />
  return children
}

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/"               element={<Landing />} />
        <Route path="/jobs"           element={<JobList />} />
        <Route path="/jobs/:id"       element={<JobDetail />} />
        <Route path="/companies/:id"  element={<CompanyProfile />} />
        <Route path="/articles"       element={<Articles />} />
        <Route path="/articles/:slug" element={<ArticleDetail />} />
      </Route>

      {/* Pre-register & Coming Soon — standalone, no layout */}
      <Route path="/pre-register" element={<PreRegister />} />
      <Route path="/coming-soon"  element={<ComingSoon />} />
      <Route path="/terms"        element={<Terms />} />
      <Route path="/privacy"      element={<Privacy />} />

      {/* Auth */}
      <Route element={<PublicLayout hideFooter />}>
        <Route path="/role-select"      element={<AuthRedirect><RoleSelect /></AuthRedirect>} />
        <Route path="/login"            element={<AuthRedirect><Login /></AuthRedirect>} />
        <Route path="/register"         element={<AuthRedirect><Register /></AuthRedirect>} />
        <Route path="/forgot-password"  element={<AuthRedirect><ForgotPassword /></AuthRedirect>} />
        <Route path="/sales-login"      element={<SalesLogin />} />
        <Route path="/superadmin-login" element={<SuperAdminLogin />} />
      </Route>

      {/* Seeker dashboard */}
      <Route path="/seeker" element={<SeekerLayout />}>
        <Route index                  element={<Navigate to="/seeker/dashboard" replace />} />
        <Route path="dashboard"       element={<SeekerDashboard />} />
        <Route path="jobs"            element={<SeekerJobList />} />
        <Route path="apply/:jobId"    element={<ApplyJob />} />
        <Route path="applications"    element={<MyApplications />} />
        <Route path="saved"           element={<SavedJobs />} />
        <Route path="profile"         element={<SeekerProfile />} />
        <Route path="coaching"        element={<Coaching />} />
      </Route>

      {/* Employer dashboard */}
      <Route path="/employer" element={<EmployerLayout />}>
        <Route index                    element={<Navigate to="/employer/dashboard" replace />} />
        <Route path="dashboard"         element={<EmployerDashboard />} />
        <Route path="post-job"          element={<PostJob />} />
        <Route path="edit-job/:jobId"   element={<EditJob />} />
        <Route path="jobs"              element={<MyJobs />} />
        <Route path="applicants"        element={<Applicants />} />
        <Route path="applicants/:jobId" element={<Applicants />} />
        <Route path="company"           element={<EmployerCompany />} />
        <Route path="subscription"      element={<Subscription />} />
      </Route>

      {/* Sales dashboard */}
      <Route path="/sales" element={<SalesLayout />}>
        <Route index            element={<Navigate to="/sales/dashboard" replace />} />
        <Route path="dashboard" element={<SalesDashboard />} />
      </Route>

      {/* Super Admin dashboard */}
      <Route path="/superadmin" element={<SuperAdminLayout />}>
        <Route index            element={<Navigate to="/superadmin/dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="sales"     element={<SuperAdminSales />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '4rem', fontWeight: 800, background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>Halaman tidak ditemukan</p>
          <a href="/" className="btn btn--primary">Kembali ke Beranda</a>
        </div>
      } />
    </Routes>
  </Suspense>
)

export default AppRoutes