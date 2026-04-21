import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react'

const Footer = () => (
  <footer style={{ background: '#f5f5f5', color: '#111827', paddingTop: 64, paddingBottom: 32, marginTop: 'auto' }}>
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 48 }}>

        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <img
              src="/logo/addjob-logo.png"
              alt="AddJob"
              style={{ height: 44, width: 'auto', display: 'block' }}
            />
          </div>

          <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.7, marginBottom: 20 }}>
            Portal pencarian kerja & bimbingan karir terbaik di Indonesia.
          </p>

          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { Icon: Instagram, href: '#', label: 'Instagram' },
              { Icon: Linkedin,  href: '#', label: 'LinkedIn' },
              { Icon: Twitter,   href: '#', label: 'Twitter' },
              { Icon: Youtube,   href: '#', label: 'YouTube' },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                style={{ width: 36, height: 36, borderRadius: 8, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#e5e7eb'; e.currentTarget.style.color = '#6b7280' }}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Job Seeker Links */}
        <div>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: '#111827', marginBottom: 16 }}>
            Pencari Kerja
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { to: '/jobs', label: 'Cari Lowongan' },
              { to: '/register?role=seeker', label: 'Buat Profil' },
              { to: '/seeker/coaching', label: 'Bimbingan Karir' },
              { to: '/articles', label: 'Tips Karir' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} style={{ fontSize: '0.9rem', color: '#6b7280', transition: 'color 0.15s', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#111827'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Employer Links */}
        <div>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: '#111827', marginBottom: 16 }}>
            Perusahaan
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { to: '/register?role=employer', label: 'Pasang Lowongan' },
              { to: '/employer/subscription', label: 'Paket Rekrutmen' },
              { to: '/companies', label: 'Direktori Perusahaan' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} style={{ fontSize: '0.9rem', color: '#6b7280', transition: 'color 0.15s', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#111827'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: '#111827', marginBottom: 16 }}>
            Kontak
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { Icon: Mail,    text: 'halo@addjob.id' },
              { Icon: Phone,   text: '+62 21 1234 5678' },
              { Icon: MapPin,  text: 'Jakarta Selatan, Indonesia' },
            ].map(({ Icon, text }) => (
              <li key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', color: '#6b7280' }}>
                <Icon size={15} style={{ flexShrink: 0, color: 'var(--primary)' }} />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
          © {new Date().getFullYear()} AddJob. Hak cipta dilindungi.
        </p>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { to: '/privacy', label: 'Privasi' },
            { to: '/terms', label: 'Syarat' },
            { to: '/sitemap', label: 'Sitemap' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{ fontSize: '0.875rem', color: '#9ca3af', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#111827'}
              onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
)

export default Footer