import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Briefcase, ArrowRight } from 'lucide-react'

const RoleSelect = () => {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: 'var(--bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 540 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>Anda bergabung sebagai?</h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.0625rem' }}>Pilih peran Anda untuk melanjutkan ke AddJob</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            {
              role: 'seeker',
              title: 'Pencari Kerja',
              desc: ' impian, upload CV, dan lamar ke ratusan perusahaan terpercaya.',
              Icon: GraduationCap,
              gradient: 'linear-gradient(135deg, #1B6FC8, #21CBF3)',
              to: '/register?role=seeker',
            },
            {
              role: 'employer',
              title: 'Perusahaan / Rekruter',
              desc: 'Pasang lowongan, kelola lamaran, dan temukan talenta terbaik untuk tim Anda.',
              Icon: Briefcase,
              gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
              to: '/register?role=employer',
            },
          ].map(({ title, desc, Icon, gradient, to }) => (
            <motion.button
              key={title}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(to)}
              style={{
                background: '#fff',
                border: '2px solid var(--border-light)',
                borderRadius: 16,
                padding: '32px 24px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                boxShadow: 'var(--shadow)',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
            >
              <div style={{ width: 56, height: 56, borderRadius: 16, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Icon size={28} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.125rem', marginBottom: 8, color: 'var(--dark)' }}>{title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</p>
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 700 }}>
                Mulai <ArrowRight size={15} />
              </span>
            </motion.button>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 28, fontSize: '0.9375rem', color: 'var(--muted)' }}>
          Sudah punya akun?{' '}
          <a href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Masuk</a>
        </p>
      </motion.div>
    </div>
  )
}

export default RoleSelect
