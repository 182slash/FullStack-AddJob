import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Tag } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { loginSchema } from '@/utils/validators'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'

const SalesLogin = () => {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [showPw, setShowPw]     = useState(false)
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data) => {
    setApiError('')
    const result = await login(data.email, data.password)
    if (result.success) {
      if (result.role !== 'sales') {
        setApiError('Akun ini bukan akun Sales. Gunakan halaman login utama.')
        return
      }
      navigate('/sales/dashboard', { replace: true })
    } else {
      setApiError(result.error)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: 'var(--bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 440 }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'var(--gradient-hero)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>AJ</div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.375rem', fontWeight: 800, background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AddJob</span>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent-light)', color: 'var(--primary)', fontSize: '0.8125rem', fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>
            <Tag size={13} /> Portal Sales
          </span>
        </div>

        <div className="card card-body">
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 4, color: 'var(--dark)' }}>
            Masuk Sales
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9375rem', marginBottom: 28 }}>
            Halaman khusus untuk tim sales AddJob.
          </p>

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
        </div>
      </motion.div>
    </div>
  )
}

export default SalesLogin