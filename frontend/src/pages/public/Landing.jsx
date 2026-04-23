import WaveBackground from '@/components/common/WaveBackground'
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, MapPin, TrendingUp, Shield, Zap, Users,
  Briefcase, ArrowRight, CheckCircle2, ChevronRight,
} from 'lucide-react'
import Badge from '@/components/common/Badge'
import { useFeaturedJobs, useCategories } from '@/hooks/useJobs'
import JobCard from '@/components/common/JobCard'
import { SkeletonJobCard } from '@/components/common/Skeleton'

const CATEGORY_ICONS = {
  'Teknologi': '💻',
  'Desain': '🎨',
  'Marketing': '📣',
  'Keuangan': '💰',
  'Pendidikan': '📚',
  'Kesehatan': '🏥',
  'Hukum': '⚖️',
  'Logistik': '🚚',
  'Hospitality': '🏨',
  'HR': '👥',
}

const NETWORK_PEOPLE = [
  { name: 'Budiman',  role: 'Finance Specialist' },
  { name: 'Raymond',  role: 'Network Engineer' },
  { name: 'Sari',     role: 'UI/UX Designer' },
  { name: 'Dika',     role: 'Software Developer' },
  { name: 'Putri',    role: 'Marketing Manager' },
  { name: 'Hendra',   role: 'Data Analyst' },
  { name: 'Rina',     role: 'HR Specialist' },
  { name: 'Budi',     role: 'Project Manager' },
  { name: 'Dewi',     role: 'Content Writer' },
  { name: 'Fajar',    role: 'System Admin' },
  { name: 'Mega',     role: 'Graphic Designer' },
  { name: 'Aldi',     role: 'Business Analyst' },
  { name: 'Lina',     role: 'Data Scientist' },
  { name: 'Rizky',    role: 'Frontend Engineer' },
];

const NetworkBackground = () => {
  const canvasRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const stateRef = useRef({ nodes: [], hovered: null, raf: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    state.nodes = NETWORK_PEOPLE.map(p => ({
      ...p,
      x:  Math.random() * (canvas.width  - 80) + 40,
      y:  Math.random() * (canvas.height - 80) + 40,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r:  22,
    }));

    const drawNode = (x, y, r, active) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, active ? 'rgba(79,195,247,0.22)' : 'rgba(79,195,247,0.08)');
      grad.addColorStop(1, 'rgba(79,195,247,0.01)');
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = active ? 'rgba(79,195,247,0.95)' : 'rgba(79,195,247,0.38)';
      ctx.lineWidth   = active ? 2 : 1.5;
      ctx.stroke();

      const c = active ? 'rgba(79,195,247,0.95)' : 'rgba(79,195,247,0.48)';
      ctx.beginPath();
      ctx.arc(x, y - r * 0.17, r * 0.30, 0, Math.PI * 2);
      ctx.fillStyle = c; ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x, y + r * 0.44, r * 0.43, r * 0.30, 0, Math.PI, Math.PI * 2);
      ctx.fillStyle = c; ctx.fill();
    };

    const animate = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      for (const n of state.nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < n.r || n.x > width  - n.r) n.vx *= -1;
        if (n.y < n.r || n.y > height - n.r) n.vy *= -1;
        n.x = Math.max(n.r, Math.min(width  - n.r, n.x));
        n.y = Math.max(n.r, Math.min(height - n.r, n.y));
      }

      const DIST = 185;
      for (let i = 0; i < state.nodes.length; i++) {
        for (let j = i + 1; j < state.nodes.length; j++) {
          const a = state.nodes[i], b = state.nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < DIST) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(79,195,247,${(1 - d / DIST) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      for (const n of state.nodes) {
        drawNode(n.x, n.y, n.r, n === state.hovered);
      }
      state.raf = requestAnimationFrame(animate);
    };
    animate();

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let found = null;
      for (const n of state.nodes) {
        const dx = mx - n.x, dy = my - n.y;
        if (Math.sqrt(dx * dx + dy * dy) < n.r + 6) { found = n; break; }
      }
      if (found !== state.hovered) {
        state.hovered = found;
        setTooltip(found ? { name: found.name, role: found.role, x: found.x, y: found.y } : null);
      } else if (found) {
        setTooltip({ name: found.name, role: found.role, x: found.x, y: found.y });
      }
    };
    const onMouseLeave = () => { state.hovered = null; setTooltip(null); };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    return () => {
      cancelAnimationFrame(state.raf);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'all', opacity: 0.85 }}
      />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y - 54,
            transform: 'translateX(-50%)',
            background: 'rgba(8, 20, 40, 0.88)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#fff',
            padding: '5px 14px',
            borderRadius: '20px',
            fontSize: '0.73rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            border: '1px solid rgba(79,195,247,0.5)',
            boxShadow: '0 4px 20px rgba(79,195,247,0.25)',
            letterSpacing: '0.02em',
            zIndex: 5,
            transition: 'opacity 0.15s ease',
          }}
        >
          {tooltip.name}{' '}
          <span style={{ color: '#4FC3F7', margin: '0 3px' }}>|</span>{' '}
          {tooltip.role}
        </div>
      )}
    </div>
  );
};

const IC = '#4FC3F7';
const S = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: IC, strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' };

const CAT_ICONS = {
  tech:      <svg {...S}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  finance:   <svg {...S}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  marketing: <svg {...S}><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
  design:    <svg {...S}><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>,
  hr:        <svg {...S}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  engineer:  <svg {...S}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  health:    <svg {...S}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  education: <svg {...S}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  sales:     <svg {...S}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  logistics: <svg {...S}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  legal:     <svg {...S}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  default:   <svg {...S}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
};

const getCategoryIcon = (name = '') => {
  const n = name.toLowerCase();
  if (/teknologi|software|it\b|programmer|tech|sistem/.test(n))      return CAT_ICONS.tech;
  if (/keuangan|finance|akuntansi|accounting|audit/.test(n))          return CAT_ICONS.finance;
  if (/marketing|pemasaran|digital/.test(n))                          return CAT_ICONS.marketing;
  if (/desain|design|kreatif|creative|grafis/.test(n))                return CAT_ICONS.design;
  if (/sdm|hr\b|human resource|rekrutmen|sumber daya/.test(n))        return CAT_ICONS.hr;
  if (/teknik|engineer|mekanik|elektro|konstruksi/.test(n))           return CAT_ICONS.engineer;
  if (/kesehatan|medis|health|farmasi|dokter|perawat/.test(n))        return CAT_ICONS.health;
  if (/pendidikan|edukasi|education|guru|pengajar/.test(n))           return CAT_ICONS.education;
  if (/sales|penjualan/.test(n))                                       return CAT_ICONS.sales;
  if (/logistik|pengiriman|driver|supir|kurir/.test(n))               return CAT_ICONS.logistics;
  if (/hukum|legal|advokat/.test(n))                                   return CAT_ICONS.legal;
  return CAT_ICONS.default;
};

const STATS = [
  { value: '50.000+', label: 'Lowongan Aktif' },
  { value: '12.000+', label: 'Perusahaan' },
  { value: '500.000+', label: 'Pencari Kerja' },
  { value: '95%', label: 'Tingkat Kepuasan' },
]

const FEATURES = [
  {
    num: '01',
    icon: <Zap size={20} />,
    title: 'Lamaran Cepat',
    desc: 'Kirim lamaran dalam hitungan menit dengan profil tersimpan.',
  },
  {
    num: '02',
    icon: <Shield size={20} />,
    title: 'Lowongan Terverifikasi',
    desc: 'Semua perusahaan telah diverifikasi untuk keamanan Anda.',
  },
  {
    num: '03',
    icon: <TrendingUp size={20} />,
    title: 'Bimbingan Karir',
    desc: 'Coaching, review CV, dan persiapan interview dari para ahli.',
  },
  {
    num: '04',
    icon: <Users size={20} />,
    title: 'Komunitas Aktif',
    desc: 'Bergabung dengan ratusan ribu profesional Indonesia.',
  },
]

const BLUES = [
  {
    badge: 'linear-gradient(160deg,#0f2460,#1e3a8a)',
    bar:   'linear-gradient(90deg,#1e3a8a,#2563eb)',
    ring:    '#1e3a8a',
    ringEnd: '#3b82f6',
    connEnd: '#3b82f6',
    glow:    'rgba(30,58,138,0.55)',
  },
  {
    badge: 'linear-gradient(160deg,#1e3a8a,#1d4ed8)',
    bar:   'linear-gradient(90deg,#1d4ed8,#3b82f6)',
    ring:    '#1d4ed8',
    ringEnd: '#60a5fa',
    connEnd: '#60a5fa',
    glow:    'rgba(29,78,216,0.5)',
  },
  {
    badge: 'linear-gradient(160deg,#1d4ed8,#2563eb)',
    bar:   'linear-gradient(90deg,#2563eb,#60a5fa)',
    ring:    '#2563eb',
    ringEnd: '#93c5fd',
    connEnd: '#93c5fd',
    glow:    'rgba(37,99,235,0.45)',
  },
  {
    badge: 'linear-gradient(160deg,#2563eb,#3b82f6)',
    bar:   'linear-gradient(90deg,#3b82f6,#93c5fd)',
    ring:    '#3b82f6',
    ringEnd: '#bfdbfe',
    connEnd: '#bfdbfe',
    glow:    'rgba(59,130,246,0.4)',
  },
]

/* ── Fixed layout constants (desktop only) ── */
const SECTION_H    = 420
const BAR_H        = 56
const BAR_GAP      = 18
const BARS_TOTAL   = 4 * BAR_H + 3 * BAR_GAP
const BAR_OFFSET_T = (SECTION_H - BARS_TOTAL) / 2
const BAR_CY = [0, 1, 2, 3].map(i => BAR_OFFSET_T + i * (BAR_H + BAR_GAP) + BAR_H / 2)

const SVG_CX    = 390
const SVG_CY    = 210
const RING_R    = [170, 124, 83, 44]
const CONN_X    = 82
const RING_ATTACH = RING_R.map(r => ({ x: SVG_CX - r, y: SVG_CY }))

const connectorD = (i) => {
  const sy  = BAR_CY[i]
  const ex  = RING_ATTACH[i].x
  const cp1x = CONN_X + 85
  const cp2x = ex - 55
  return `M ${CONN_X} ${sy} C ${cp1x} ${sy}, ${cp2x} ${SVG_CY}, ${ex} ${SVG_CY}`
}

const container = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const TESTIMONIALS = [
  { name: 'Rizki Pratama',  role: 'Software Engineer di Tokopedia', avatar: 'RP', text: 'AddJob membantu saya menemukan pekerjaan impian dalam 2 minggu. Fitur bimbingan karinya sangat membantu persiapan interview.' },
  { name: 'Siti Nurhaliza', role: 'Marketing Manager di Gojek',     avatar: 'SN', text: 'Platform terbaik! Proses lamaran sangat mudah dan respons dari recruiter cepat. Sangat recommended.' },
  { name: 'Ahmad Fauzi',    role: 'HR Manager di Shopee',           avatar: 'AF', text: 'Sebagai recruiter, AddJob memberikan akses ke kandidat berkualitas dengan fitur screening yang canggih.' },
  { name: 'Dewi Rahayu',    role: 'Product Manager di Traveloka',   avatar: 'DR', text: 'Proses pencarian kerja jadi jauh lebih mudah dengan AddJob. Dalam seminggu sudah dapat 3 panggilan interview.' },
  { name: 'Budi Santoso',   role: 'Data Scientist di Bukalapak',    avatar: 'BS', text: 'Fitur filter lowongan sangat membantu. Saya bisa menemukan posisi yang benar-benar sesuai skill dan ekspektasi gaji saya.' },
  { name: 'Rina Kusuma',    role: 'UI/UX Designer di Grab',         avatar: 'RK', text: 'AddJob bukan sekadar job board biasa. Fitur coaching dan review CV-nya benar-benar membantu saya tampil lebih percaya diri.' },
]

/* ═══════════════════════════════════════════════════════════════ */
const TestimonialsCarousel = () => {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % TESTIMONIALS.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="testimonials-carousel">
      <div
        className="testimonials-carousel__track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {TESTIMONIALS.map(({ name, role, avatar, text }) => (
          <div key={name} className="testimonials-carousel__slide">
            <div style={{
              background: '#fff',
              border: '1px solid var(--border-light)',
              borderRadius: 18,
              padding: '18px 20px',
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.03)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--gradient-hero)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: '0.82rem', flexShrink: 0,
              }}>
                {avatar}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--dark)', margin: 0, lineHeight: 1.2 }}>{name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '3px 0 0' }}>{role}</p>
                  </div>
                  <div style={{ fontSize: '1.2rem', lineHeight: 1, color: 'var(--primary)', flexShrink: 0 }}>"</div>
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--dark)', margin: 0 }}>{text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="testimonials-carousel__dots">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            className={`testimonials-carousel__dot${i === current ? ' testimonials-carousel__dot--active' : ''}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
const Landing = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery]       = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [hoveredBar, setHoveredBar]         = useState(null)

  const { data: featuredJobs, isLoading: jobsLoading } = useFeaturedJobs()
  const { data: categories,   isLoading: catLoading  } = useCategories()

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery)    params.set('q', searchQuery)
    if (searchLocation) params.set('location', searchLocation)
    navigate(`/jobs?${params.toString()}`)
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge
              variant="primary"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', margin: '0 auto 24px', display: 'flex', width: 'fit-content' }}
            >
              🇮🇩 &nbsp;Portal Kerja #1 Indonesia
            </Badge>

            <h1 className="hero__title">
              <span style={{ color: '#fff' }}>Bersama AddJob</span><br />
              <span className="hero__highlight">Raih Impian Anda</span>{' '}
              <span style={{ color: '#fff' }}>Hari Ini</span>
            </h1>

            <p className="hero__subtitle">
              Bergabung dengan 500.000+ pencari kerja yang telah menemukan karir terbaik mereka lewat AddJob. Lowongan terverifikasi dari perusahaan terpercaya.
            </p>

            <motion.form
              className="search-bar"
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Search size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginLeft: 4 }} />
              <input
                type="text"
                className="search-bar__input"
                placeholder="Posisi dan perusahaan..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <div className="search-bar__divider" />
              <MapPin size={18} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <input
                type="text"
                className="search-bar__input"
                placeholder="Kota atau kategori..."
                value={searchLocation}
                onChange={e => setSearchLocation(e.target.value)}
                style={{ maxWidth: 180 }}
              />
              <button type="submit" className="btn btn--primary" style={{ flexShrink: 0 }}>
                Cari Kerja
              </button>
            </motion.form>

            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', marginTop: 16 }}>
              Populer:{' '}
              <span style={{ color: '#fff', cursor: 'pointer' }} onClick={() => navigate('/jobs?q=React Developer')}>React Developer</span> · <span style={{ color: '#fff', cursor: 'pointer' }} onClick={() => navigate('/jobs?q=Data Analyst')}>Data Analyst</span> · <span style={{ color: '#fff', cursor: 'pointer' }} onClick={() => navigate('/jobs?q=UI UX Designer')}>UI/UX Designer</span> · <span style={{ color: '#fff', cursor: 'pointer' }} onClick={() => navigate('/jobs?q=Product Manager')}>Product Manager</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '40px 0', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }} variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {STATS.map(({ value, label }) => (
              <motion.div key={label} variants={item} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: 4 }}>{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Job Categories ────────────────────────────────── */}
<section style={{ padding: '64px 0', background: 'var(--bg)', position: 'relative', minHeight: 420, overflow: 'hidden' }}>
  <WaveBackground />
  <div className="container" style={{ position: 'relative', zIndex: 1 }}>
    <div className="section-header text-center" style={{ marginBottom: '36px' }}>
      <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 800, color: 'var(--dark)', marginBottom: '8px' }}>
        Jelajahi Kategori Populer
      </h2>
      <p className="section-subtitle" style={{ fontSize: '1rem', color: 'var(--muted)' }}>
        Temukan peluang kerja sesuai bidang keahlian Anda
      </p>
    </div>
    <motion.div 
      style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
        gap: '24px',
        justifyContent: 'center',
        maxWidth: 1100,
        margin: '0 auto'
      }} 
      variants={container} 
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: '-50px' }}
    >
      {(catLoading ? Array(8).fill({}) : (categories?.data || [])).map((cat, i) => (
        <motion.div key={cat._id || i} variants={item} style={{ height: '100%' }}>
          <Link
            to={`/jobs?category=${cat.slug || ''}`}
            style={{ 
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: 'var(--radius-md)', 
              padding: '40px 32px', 
              textAlign: 'center', 
              border: '1px solid var(--border-light)', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none', 
              transition: 'all 0.3s ease', 
              cursor: 'pointer',
              height: '100%',
              boxSizing: 'border-box'
            }}
            onMouseEnter={e => { 
              e.currentTarget.style.borderColor = '#4FC3F7'; 
              e.currentTarget.style.transform = 'translateY(-4px)'; 
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(79,195,247,0.22)'; 
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.borderColor = 'var(--border-light)'; 
              e.currentTarget.style.transform = 'translateY(0)'; 
              e.currentTarget.style.boxShadow = 'none'; 
            }}
          >
            {catLoading ? (
              <>
                <div style={{ height: 56, width: 56, background: 'var(--bg-alt)', borderRadius: '50%', marginBottom: 16 }} />
                <div style={{ height: 14, background: 'var(--bg-alt)', borderRadius: 4, width: '75%', marginBottom: 10 }} />
                <div style={{ height: 12, background: 'var(--bg-alt)', borderRadius: 4, width: '45%' }} />
              </>
            ) : (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, rgba(79,195,247,0.14) 0%, rgba(79,195,247,0.06) 100%)',
                  borderRadius: '50%',
                  marginBottom: '16px',
                  border: '1.5px solid rgba(79,195,247,0.28)',
                }}>
                  {getCategoryIcon(cat.name)}
                </div>
                <h3 style={{ 
                  fontFamily: 'var(--font-heading)', 
                  fontWeight: 700, 
                  fontSize: '0.95rem', 
                  color: 'var(--dark)', 
                  marginBottom: '6px',
                  lineHeight: 1.3
                }}>
                  {cat.name}
                </h3>
                <p style={{ 
                  fontSize: '0.8125rem', 
                  color: 'var(--muted)', 
                  margin: 0,
                  fontWeight: 500
                }}>
                  {cat.jobCount || 0} lowongan
                </p>
              </>
            )}
          </Link>
        </motion.div>
      ))}
    </motion.div>
  </div>
</section>

      {/* ── Featured Jobs ─────────────────────────────────── */}
      <section style={{ padding: '56px 0', background: '#fff' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <h2 className="section-title" style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)' }}>Lowongan Terbaru</h2>
              <p className="section-subtitle" style={{ fontSize: '0.9375rem' }}>Diperbarui setiap hari dari perusahaan terpercaya</p>
            </div>
            <Link to="/jobs" className="btn btn--secondary btn--sm" style={{ flexShrink: 0 }}>Lihat Semua <ChevronRight size={16} /></Link>
          </div>
          <div className="grid-2-featured">
            {jobsLoading
              ? Array(6).fill(0).map((_, i) => <SkeletonJobCard key={i} />)
              : (featuredJobs?.data || []).slice(0, 6).map(job => <JobCard key={job._id} job={job} />)
            }
          </div>
          {!jobsLoading && !featuredJobs?.data?.length && (
            <div className="empty-state">
              <div className="empty-state__icon"><Briefcase size={32} /></div>
              <p>Belum ada lowongan tersedia saat ini.</p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ── Features — Kenapa Pilih Kami ──
          Desktop: absolute bars (left) + concentric rings SVG (right)
          Mobile:  stacked feature cards only, rings hidden
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '72px 0 80px', background: '#eef4ff' }}>
        <div className="container">

          {/* ── Section header ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: 52 }}
          >
            <span style={{
              display: 'inline-block',
              background: '#dbeafe',
              color: 'var(--primary)',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '4px 16px',
              borderRadius: 999,
              marginBottom: 14,
            }}>
              ✦ &nbsp;Kenapa Pilih Kami
            </span>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
              color: '#0f172a',
              marginBottom: 10,
              lineHeight: 1.25,
            }}>
              Semua yang Anda Butuhkan,<br />Ada di AddJob
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#64748b', maxWidth: 460, margin: '0 auto', lineHeight: 1.65 }}>
              Fitur lengkap untuk memaksimalkan pencarian kerja Anda, dari rekomendasi relevan hingga notifikasi real-time.
            </p>
          </motion.div>

          {/* ── DESKTOP layout: absolute bars + SVG rings ── */}
          <div className="features-desktop" style={{
            position: 'relative',
            height: SECTION_H,
            maxWidth: 960,
            margin: '0 auto',
          }}>
            {/* LEFT: numbered bars */}
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '55%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: BAR_GAP,
              zIndex: 2,
            }}>
              {FEATURES.map((f, i) => {
                const isHov = hoveredBar === i
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, x: -28 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: i * 0.09 }}
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                    style={{
                      height: BAR_H,
                      display: 'flex',
                      borderRadius: 10,
                      overflow: 'hidden',
                      cursor: 'default',
                      transform: isHov ? 'translateX(-5px) scale(1.015)' : 'translateX(0) scale(1)',
                      boxShadow: isHov
                        ? '0 0 0 1.5px var(--primary), 0 8px 30px rgba(59,130,246,0.35)'
                        : '0 3px 10px rgba(59,130,246,0.12)',
                      transition: 'transform 0.28s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.28s ease',
                    }}
                  >
                    {/* Number + icon badge */}
                    <div style={{
                      width: 72,
                      background: 'var(--primary)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      gap: 3,
                      opacity: isHov ? 1 : 0.85,
                      transition: 'opacity 0.28s ease',
                    }}>
                      <span style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        fontFamily: 'var(--font-heading)',
                      }}>
                        {f.num}
                      </span>
                      <span style={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
                        {f.icon}
                      </span>
                    </div>

                    {/* Bar body */}
                    <div style={{
                      flex: 1,
                      background: isHov ? 'var(--primary)' : 'color-mix(in srgb, var(--primary) 80%, white)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      padding: '0 22px',
                      transition: 'background 0.28s ease',
                    }}>
                      <p style={{
                        color: '#fff',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: '0.975rem',
                        margin: 0,
                        letterSpacing: '0.01em',
                      }}>
                        {f.title}
                      </p>
                      <p style={{
                        color: 'rgba(255,255,255,0.75)',
                        fontSize: '0.775rem',
                        margin: '3px 0 0',
                        lineHeight: 1.4,
                      }}>
                        {f.desc}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* RIGHT: concentric rings SVG */}
            <div style={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: '62%',
              height: '100%',
              pointerEvents: 'none',
            }}>
              <svg
                viewBox="0 0 600 420"
                preserveAspectRatio="xMidYMid meet"
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
              >
                <defs>
                  <linearGradient id="rg0" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.7" />
                  </linearGradient>
                  <linearGradient id="rg1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.5" />
                  </linearGradient>
                  <linearGradient id="rg2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="rg3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.15" />
                  </linearGradient>
                  {RING_R.map((_, i) => (
                    <filter key={`gf${i}`} id={`gf${i}`} x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  ))}
                  <radialGradient id="cgCenter" cx="38%" cy="34%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="var(--primary)" />
                  </radialGradient>
                  <filter id="cgCenterGlow" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                {RING_R.map((r, i) => (
                  <circle
                    key={`ring${i}`}
                    cx={SVG_CX}
                    cy={SVG_CY}
                    r={r}
                    fill="none"
                    stroke={`url(#rg${i})`}
                    strokeWidth={hoveredBar === i ? 24 : 16}
                    opacity={
                      hoveredBar === null ? 0.78
                      : hoveredBar === i  ? 1
                      : 0.28
                    }
                    filter={hoveredBar === i ? `url(#gf${i})` : ''}
                    style={{ transition: 'stroke-width 0.25s ease, opacity 0.25s ease' }}
                  />
                ))}

                <circle
                  cx={SVG_CX}
                  cy={SVG_CY}
                  r={44}
                  fill="url(#cgCenter)"
                  filter="url(#cgCenterGlow)"
                />

                <g transform={`translate(${SVG_CX - 24}, ${SVG_CY - 20})`}>
                  <circle cx="24" cy="9"  r="7.5" fill="white" opacity="0.95" />
                  <path   d="M11 38 Q24 27 37 38" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.95" />
                  <circle cx="7"  cy="12" r="5.5" fill="white" opacity="0.65" />
                  <path   d="-2 38 Q7 29 16 38"   stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.65" />
                  <circle cx="41" cy="12" r="5.5" fill="white" opacity="0.65" />
                  <path   d="32 38 Q41 29 50 38"  stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.65" />
                </g>

                <text x={SVG_CX} y={SVG_CY + 30} textAnchor="middle" fill="rgba(255,255,255,0.82)" fontSize="7.5" fontWeight="700" fontFamily="var(--font-heading)" letterSpacing="0.09em">
                  ADDJOB
                </text>
              </svg>
            </div>
          </div>

          {/* ── MOBILE layout: stacked cards, rings hidden ── */}
          <div className="features-mobile">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title + '-mobile'}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: 'var(--primary)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 3px 10px rgba(59,130,246,0.18)',
                  marginBottom: i < FEATURES.length - 1 ? 12 : 0,
                }}
              >
                {/* Badge */}
                <div style={{
                  width: 64,
                  minHeight: 72,
                  background: 'rgba(0,0,0,0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  gap: 4,
                  padding: '12px 0',
                }}>
                  <span style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    fontFamily: 'var(--font-heading)',
                  }}>
                    {f.num}
                  </span>
                  <span style={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
                    {f.icon}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '14px 16px 14px 0', flex: 1 }}>
                  <p style={{
                    color: '#fff',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    margin: 0,
                  }}>
                    {f.title}
                  </p>
                  <p style={{
                    color: 'rgba(255,255,255,0.78)',
                    fontSize: '0.8rem',
                    margin: '4px 0 0',
                    lineHeight: 1.45,
                  }}>
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* ── CSS to toggle desktop/mobile layouts ── */}
        <style>{`
          .features-mobile { display: none; }
          @media (max-width: 768px) {
            .features-desktop { display: none !important; }
            .features-mobile  { display: block; }
          }
        `}</style>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section style={{ padding: '72px 0', background: '#eef4ff' }}>
        <style>{`
          .testimonials-grid {
            display: grid;
            grid-template-columns: minmax(280px, 0.95fr) minmax(0, 1.05fr);
            gap: 32px;
            align-items: start;
          }
          .testimonials-scroll {
            max-height: 460px;
            overflow-y: auto;
            padding-right: 8px;
          }
          .testimonials-carousel { display: none; }

          @media (max-width: 768px) {
            .testimonials-grid {
              grid-template-columns: 1fr;
              gap: 20px;
            }
            .testimonials-intro {
              padding: 24px 20px !important;
            }
            .testimonials-scroll { display: none; }
            .testimonials-carousel {
              display: block;
              position: relative;
              overflow: hidden;
              border-radius: 18px;
            }
            .testimonials-carousel__track {
              display: flex;
              transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .testimonials-carousel__slide {
              min-width: 100%;
              box-sizing: border-box;
            }
            .testimonials-carousel__dots {
              display: flex;
              justify-content: center;
              gap: 6px;
              margin-top: 14px;
            }
            .testimonials-carousel__dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: rgba(37, 99, 235, 0.25);
              border: none;
              padding: 0;
              cursor: pointer;
              transition: all 0.3s ease;
            }
            .testimonials-carousel__dot--active {
              width: 20px;
              border-radius: 3px;
              background: var(--primary);
            }
          }
        `}</style>
        <div className="container">
          <div className="testimonials-grid">

            {/* Left intro */}
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="testimonials-intro"
              style={{
                background: '#fff',
                border: '1px solid var(--border-light)',
                borderRadius: 20,
                padding: '40px 36px',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
              }}
            >
              <span style={{
                display: 'inline-block',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--primary)',
                marginBottom: 14,
              }}>
                Testimoni
              </span>
              <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.25rem)', marginBottom: 12, lineHeight: 1.15 }}>
                Cerita Sukses Mereka
              </h2>
              <p className="section-subtitle" style={{ fontSize: '0.98rem', lineHeight: 1.7, marginBottom: 24, maxWidth: 360 }}>
                Bergabunglah dengan ribuan yang telah berhasil menemukan pekerjaan terbaik mereka melalui AddJob.
              </p>
              <Link to="/jobs" className="btn btn--primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Lihat Lowongan <ArrowRight size={16} />
              </Link>
            </motion.div>

            {/* Desktop: scrollable reviews */}
            <motion.div
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="testimonials-scroll"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {TESTIMONIALS.map(({ name, role, avatar, text }) => (
                  <motion.div
                    key={name}
                    variants={item}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--border-light)',
                      borderRadius: 18,
                      padding: '18px 20px',
                      display: 'flex',
                      gap: 14,
                      alignItems: 'flex-start',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.03)',
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'var(--gradient-hero)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 800, fontSize: '0.82rem', flexShrink: 0,
                    }}>
                      {avatar}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 6 }}>
                        <div>
                          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--dark)', margin: 0, lineHeight: 1.2 }}>{name}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '3px 0 0' }}>{role}</p>
                        </div>
                        <div style={{ fontSize: '1.2rem', lineHeight: 1, color: 'var(--primary)', flexShrink: 0 }}>"</div>
                      </div>
                      <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--dark)', margin: 0 }}>{text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Mobile: auto-sliding carousel */}
            <TestimonialsCarousel />

          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: 'var(--gradient-hero)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 3rem)', marginBottom: 20 }}>
              Siap Memulai Perjalanan Karir Anda?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: 40, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
              Daftar gratis sekarang dan dapatkan akses ke ribuan lowongan kerja terbaik di Indonesia.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register?role=seeker"
                style={{ background: '#fff', color: 'var(--primary)', padding: '14px 32px', borderRadius: 'var(--radius)', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)' }}
              >
                Daftar sebagai Pencari Kerja <ArrowRight size={18} />
              </Link>
              <Link to="/register?role=employer"
                style={{ background: 'transparent', color: '#fff', padding: '14px 32px', borderRadius: 'var(--radius)', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, border: '2px solid rgba(255,255,255,0.6)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)' }}
              >
                Rekrut Talenta Terbaik <Briefcase size={18} />
              </Link>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 32, flexWrap: 'wrap' }}>
              {['Gratis selamanya', 'Tanpa kartu kredit', 'Setup dalam 5 menit'].map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
                  <CheckCircle2 size={16} style={{ color: '#21CBF3' }} /> {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

export default Landing