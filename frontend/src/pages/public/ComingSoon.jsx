import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

const LAUNCH_DATE = new Date('2026-05-20T00:00:00')

const glassmorphismStyle = {
  background: 'rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(25px) saturate(150%)',
  WebkitBackdropFilter: 'blur(25px) saturate(150%)',
  border: '1px solid rgba(255, 255, 255, 0.7)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
  borderRadius: '24px',
}

const useCountdown = () => {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const diff = Math.max(0, LAUNCH_DATE - now)
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

const CountdownBox = ({ value, label }) => (
  <div style={{
    background: 'var(--primary)',
    borderRadius: 14,
    padding: '20px 16px',
    minWidth: 76,
    textAlign: 'center',
  }}>
    <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2.25rem', color: '#fff', lineHeight: 1, margin: 0 }}>
      {String(value).padStart(2, '0')}
    </p>
    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
      {label}
    </p>
  </div>
)

export default function ComingSoon() {
  const location = useLocation()
  const name = location.state?.name || ''
  const { days, hours, minutes, seconds } = useCountdown()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: 560 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo/addjob-logo.png" alt="AddJob" style={{ height: 52, width: 'auto', objectFit: 'contain' }} />
        </div>

        {/* Main card */}
        <div style={{ ...glassmorphismStyle, padding: '40px 32px', textAlign: 'center', marginBottom: 16 }}>

          {/* Success badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ width: 68, height: 68, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={34} color="#16a34a" />
            </div>
          </div>

          {name && (
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: '#1A1A2E', marginBottom: 10 }}>
              Halo, {name}! 
            </h1>
          )}

          <p style={{ color: '#444', fontSize: '1rem', lineHeight: 1.7, marginBottom: 8, fontWeight: 500 }}>
            Akun Anda sudah terdaftar dan siap digunakan.
          </p>
          <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 32 }}>
            AddJob akan diluncurkan dalam:
          </p>

          {/* Countdown */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
            <CountdownBox value={days}    label="Hari" />
            <CountdownBox value={hours}   label="Jam" />
            <CountdownBox value={minutes} label="Menit" />
            <CountdownBox value={seconds} label="Detik" />
          </div>

          {/* What to expect */}
          <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 14, padding: '20px 24px', textAlign: 'left', marginBottom: 28 }}>
            <p style={{ fontWeight: 700, color: '#1A1A2E', fontSize: '0.9rem', marginBottom: 12 }}>Yang akan Anda dapatkan saat launch:</p>
            {[
              '✓ Akun langsung aktif — tidak perlu daftar ulang',
              '✓ Akses ke ribuan lowongan kerja terpercaya',
              '✓ Notifikasi lowongan sesuai jurusan Anda',
              '✓ Fitur review CV & bimbingan karir',
              '✓ Akses prioritas ke fitur eksklusif early member',
            ].map(t => (
              <p key={t} style={{ fontSize: '0.875rem', color: '#333', margin: '6px 0', fontWeight: 500 }}>{t}</p>
            ))}
          </div>

          <p style={{ fontSize: '0.85rem', color: '#666' }}>
            Kami akan menghubungi Anda via email saat platform diluncurkan.
          </p>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#888' }}>
          © 2026 AddJob · globaladaptasi.com · adaptasindonesia@gmail.com
        </p>
      </motion.div>
    </div>
  )
}