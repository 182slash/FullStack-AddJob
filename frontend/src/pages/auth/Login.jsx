import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '@/context/AuthContext'
import { loginSchema } from '@/utils/validators'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'

const Login = () => {
  const { login, googleAuth } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [showPw, setShowPw] = useState(false)
  const [apiError, setApiError] = useState('')

  const from = location.state?.from?.pathname

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data) => {
    setApiError('')
    const result = await login(data.email, data.password)
    if (result.success) {
      if (from) return navigate(from, { replace: true })
      navigate(result.role === 'employer' ? '/employer/dashboard' : '/seeker/dashboard', { replace: true })
    } else {
      setApiError(result.error)
    }
  }

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setApiError('')
      const result = await googleAuth(tokenResponse.access_token, 'seeker')
      if (result.success) {
        if (from) return navigate(from, { replace: true })
        navigate(result.role === 'employer' ? '/employer/dashboard' : '/seeker/dashboard', { replace: true })
      } else {
        setApiError(result.error)
      }
    },
    onError: () => setApiError('Google login gagal. Silakan coba lagi.'),
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: 'var(--bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 440 }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 32, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, background: 'var(--gradient-hero)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>AJ</div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.375rem', fontWeight: 800, background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AddJob</span>
        </Link>

        <div className="card card-body">
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 4, color: 'var(--dark)' }}>Selamat Datang Kembali</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9375rem', marginBottom: 28 }}>Masuk untuk melanjutkan perjalanan karir Anda.</p>

          {apiError && (
            <div className="alert alert--error" style={{ marginBottom: 20 }}>
              <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label">Password <span style={{ color: 'var(--error)' }}>*</span></label>
                <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
                  Lupa password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'flex', pointerEvents: 'none' }}>
                  <Lock size={16} />
                </span>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error mt-2"><span style={{ fontSize: 13 }}>⚠</span> {errors.password.message}</p>}
            </div>

            <Button type="submit" variant="accent" block loading={isSubmitting} style={{ marginTop: 8 }}>
              Masuk <ArrowRight size={16} />
            </Button>
          </form>

          <div style={{ position: 'relative', margin: '24px 0', textAlign: 'center' }}>
            <div style={{ height: 1, background: 'var(--border)', position: 'absolute', top: '50%', left: 0, right: 0 }} />
            <span style={{ background: '#fff', padding: '0 12px', color: 'var(--muted)', fontSize: '0.875rem', position: 'relative' }}>atau masuk dengan</span>
          </div>

          <button
            onClick={() => loginWithGoogle()}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '11px 16px',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--dark)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Lanjutkan dengan Google
          </button>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9375rem', color: 'var(--muted)' }}>
            Belum punya akun?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Daftar gratis</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login