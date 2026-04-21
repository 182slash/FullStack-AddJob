import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { forgotPasswordSchema } from '@/utils/validators'
import { authService } from '@/services/authService'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'

const ForgotPassword = () => {
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email)
      setSentEmail(data.email)
      setSent(true)
    } catch (err) {
      // Show success anyway for security
      setSentEmail(data.email)
      setSent(true)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: 'var(--bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 32, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, background: 'var(--gradient-hero)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>AJ</div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.375rem', fontWeight: 800, background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AddJob</span>
        </Link>

        <div className="card card-body">
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 64, height: 64, background: 'var(--success-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--success)' }}>
                <CheckCircle2 size={32} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: 12 }}>Email Terkirim!</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: 28 }}>
                Kami telah mengirim link reset password ke <strong style={{ color: 'var(--dark)' }}>{sentEmail}</strong>. Periksa inbox Anda.
              </p>
              <Link to="/login" className="btn btn--primary btn--block">
                <ArrowLeft size={16} /> Kembali ke Halaman Masuk
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Lupa Password?</h1>
              <p style={{ color: 'var(--muted)', fontSize: '0.9375rem', marginBottom: 28, lineHeight: 1.6 }}>
                Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.
              </p>

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
                <Button type="submit" variant="accent" block loading={isSubmitting}>
                  Kirim Link Reset Password
                </Button>
              </form>

              <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9375rem' }}>
                <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <ArrowLeft size={15} /> Kembali ke Masuk
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPassword
