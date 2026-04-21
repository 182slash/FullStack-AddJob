import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Briefcase, Users, Eye, TrendingUp, PlusCircle,
  ChevronRight, ArrowUpRight, Clock, CheckCircle2,
  ChevronLeft,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { useJobStats, useEmployerJobs } from '@/hooks/useJobs'
import { useJobApplicants } from '@/hooks/useApplications'
import { useAuth } from '@/context/AuthContext'
import Badge from '@/components/common/Badge'
import { SkeletonStatCard } from '@/components/common/Skeleton'
import { formatRelativeTime, APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/utils/formatters'
import api from '@/services/api'

const MOCK_CHART = [
  { name:'Sen', views:42, applicants:8 },
  { name:'Sel', views:58, applicants:14 },
  { name:'Rab', views:35, applicants:6 },
  { name:'Kam', views:80, applicants:22 },
  { name:'Jum', views:62, applicants:17 },
  { name:'Sab', views:28, applicants:5 },
  { name:'Min', views:45, applicants:9 },
]

// ─── Ads Banner Config ────────────────────────────────────────────────────────
const ADS_BANNERS = [
  { image: '/banner/banner1.png', url: 'https://globaladaptasi.com', alt: 'Banner 1' },
  { image: '/banner/banner2.png', url: 'https://globaladaptasi.com', alt: 'Banner 2' },
  { image: '/banner/banner3.png', url: 'https://globaladaptasi.com', alt: 'Banner 3' },
]
const SLIDE_INTERVAL_MS = 4000
// ─────────────────────────────────────────────────────────────────────────────

// ─── Profile completeness fields ─────────────────────────────────────────────
const PROFILE_FIELDS = [
  { key: 'name',        label: 'Nama Perusahaan' },
  { key: 'industry',    label: 'Industri' },
  { key: 'size',        label: 'Ukuran' },
  { key: 'type',        label: 'Tipe' },
  { key: 'location',    label: 'Lokasi' },
  { key: 'website',     label: 'Website' },
  { key: 'description', label: 'Deskripsi' },
  { key: 'logo',        label: 'Logo' },
  { key: 'nib',         label: 'NIB' },
  { key: 'npwp',        label: 'NPWP' },
  { key: 'email',       label: 'Email' },
  { key: 'phone',       label: 'Telepon' },
]

const calcCompleteness = (company) => {
  if (!company || !Object.keys(company).length) return { pct: 0, missing: PROFILE_FIELDS.map(f => f.label) }
  const missing = PROFILE_FIELDS.filter(f => !company[f.key] || company[f.key] === '').map(f => f.label)
  const filled = PROFILE_FIELDS.length - missing.length
  const pct = Math.round((filled / PROFILE_FIELDS.length) * 100)
  return { pct, missing }
}
// ─────────────────────────────────────────────────────────────────────────────

const container = { hidden:{}, show:{ transition:{ staggerChildren:0.08 } } }
const item = { hidden:{opacity:0,y:16}, show:{opacity:1,y:0,transition:{duration:0.35}} }

function AdsBannerCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused,  setPaused]  = useState(false)
  const timerRef = useRef(null)
  const total = ADS_BANNERS.length

  const goTo = (idx) => setCurrent((idx + total) % total)

  useEffect(() => {
    if (paused) return
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % total), SLIDE_INTERVAL_MS)
    return () => clearInterval(timerRef.current)
  }, [paused, total])

  return (
    <div
      style={{ marginTop: 24, borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', background: 'var(--bg-alt)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={{
        position: 'absolute', top: 10, left: 12, zIndex: 10,
        background: 'rgba(0,0,0,0.45)', color: '#fff',
        fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em',
        padding: '2px 8px', borderRadius: 99, backdropFilter: 'blur(4px)',
        textTransform: 'uppercase',
      }}>
        Iklan
      </div>

      <div style={{ position: 'relative', width: '100%', aspectRatio: '2 / 1', overflow: 'hidden' }}>
        {ADS_BANNERS.map((banner, idx) => (
          <a
            key={idx}
            href={banner.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'absolute', inset: 0,
              opacity: idx === current ? 1 : 0,
              transition: 'opacity 0.6s ease',
              pointerEvents: idx === current ? 'auto' : 'none',
              display: 'block',
            }}
            tabIndex={idx === current ? 0 : -1}
          >
            <img
              src={banner.image}
              alt={banner.alt}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              draggable={false}
            />
          </a>
        ))}

        {total > 1 && (
          <>
            <button onClick={(e) => { e.preventDefault(); goTo(current - 1) }} style={arrowStyle('left')} aria-label="Previous banner">
              <ChevronLeft size={18}/>
            </button>
            <button onClick={(e) => { e.preventDefault(); goTo(current + 1) }} style={arrowStyle('right')} aria-label="Next banner">
              <ChevronRight size={18}/>
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '8px 0 10px' }}>
          {ADS_BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              style={{
                width: idx === current ? 20 : 7, height: 7,
                borderRadius: 99, border: 'none', cursor: 'pointer', padding: 0,
                background: idx === current ? 'var(--primary)' : 'var(--border)',
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
              aria-label={`Go to banner ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const arrowStyle = (side) => ({
  position: 'absolute', top: '50%', [side]: 10,
  transform: 'translateY(-50%)', zIndex: 10,
  width: 32, height: 32, borderRadius: '50%',
  border: 'none', cursor: 'pointer',
  background: 'rgba(0,0,0,0.35)', color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  backdropFilter: 'blur(4px)', transition: 'background 0.2s',
})

export default function EmployerDashboard() {
  const { user } = useAuth()
  const { data:statsData,   isLoading:statsLoading } = useJobStats()
  const { data:jobsData,    isLoading:jobsLoading  } = useEmployerJobs({ limit:5, status:'active' })
  const { data:companyRaw } = useQuery({
    queryKey: ['myCompany'],
    queryFn:  () => api.get('/companies/employer/me').then(r => r.data),
    staleTime: 0,
  })

  const stats   = statsData?.data  || {}
  const jobs    = jobsData?.data   || []
  const company = companyRaw?.data || companyRaw || {}

  const { pct, missing } = calcCompleteness(company)

  const progressColor = pct === 100
    ? 'var(--success)'
    : pct >= 60
      ? 'var(--gradient-hero)'
      : 'var(--warning)'

  const STATS = [
    { icon:<Briefcase size={22}/>,    label:'Lowongan Aktif',  val:stats.activeJobs||0,       color:'var(--primary)', bg:'var(--accent-light)', to:'/employer/jobs' },
    { icon:<Users size={22}/>,        label:'Total Pelamar',   val:stats.totalApplications||0, color:'#7C3AED',        bg:'#EDE7F6',             to:'/employer/applicants' },
    { icon:<Eye size={22}/>,          label:'Total Dilihat',   val:stats.totalViews||0,        color:'var(--warning)', bg:'var(--warning-light)', to:null },
    { icon:<CheckCircle2 size={22}/>, label:'Total Diterima',  val:stats.totalHired||0,        color:'var(--success)', bg:'var(--success-light)', to:null },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Greeting */}
      <motion.div variants={item} style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.75rem', marginBottom:4 }}>
          Dashboard Employer
        </h1>
        <p style={{ color:'var(--muted)' }}>
          Halo, <strong>{user?.company?.name || user?.name}</strong>! Kelola lowongan dan pantau pelamar Anda.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:32 }}>
        {statsLoading ? Array(4).fill(0).map((_,i)=><SkeletonStatCard key={i}/>) :
          STATS.map(s => (
            <motion.div key={s.label} whileHover={{ y:-3 }} style={{ display:'block' }}>
              {s.to
                ? <Link to={s.to} style={{ textDecoration:'none' }}><StatCard {...s}/></Link>
                : <StatCard {...s}/>
              }
            </motion.div>
          ))
        }
      </motion.div>

      <div className="employer-grid" style={{ display:'grid', gap:24, alignItems:'start' }}>
        {/* Left column */}
        <motion.div variants={item}>
          {/* Chart */}
          <div className="card card-body" style={{ marginBottom:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1.0625rem' }}>Performa Lowongan (7 Hari)</h2>
              <span style={{ fontSize:'0.8125rem', color:'var(--muted)' }}>Tampilan vs Pelamar</span>
            </div>
            <div style={{ height:220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_CHART} barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false}/>
                  <XAxis dataKey="name" tick={{ fontSize:12, fill:'var(--muted)' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:12, fill:'var(--muted)' }} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{ borderRadius:8, border:'1px solid var(--border-light)', boxShadow:'var(--shadow)' }}/>
                  <Legend iconType="circle" iconSize={8}/>
                  <Bar dataKey="views" name="Dilihat" fill="var(--primary)" radius={[4,4,0,0]}/>
                  <Bar dataKey="applicants" name="Pelamar" fill="var(--accent)" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Jobs */}
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid var(--border-light)' }}>
              <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1.0625rem' }}>Lowongan Aktif</h2>
              <Link to="/employer/jobs" style={{ fontSize:'0.8125rem', color:'var(--primary)', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>
                Lihat Semua <ChevronRight size={14}/>
              </Link>
            </div>
            {jobsLoading ? (
              <div style={{ padding:20, display:'flex', flexDirection:'column', gap:12 }}>
                {Array(3).fill(0).map((_,i)=>(
                  <div key={i} style={{ display:'flex', gap:12 }}>
                    <div className="skeleton" style={{ width:44, height:44, borderRadius:8, flexShrink:0 }}/>
                    <div style={{ flex:1 }}>
                      <div className="skeleton skeleton--title" style={{ width:'60%', marginBottom:8 }}/>
                      <div className="skeleton skeleton--text" style={{ width:'40%' }}/>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length===0 ? (
              <div className="empty-state" style={{ padding:'32px 20px' }}>
                <div className="empty-state__icon"><Briefcase size={24}/></div>
                <p>Belum ada lowongan aktif.</p>
                <Link to="/employer/post-job" className="btn btn--primary btn--sm" style={{ marginTop:12 }}>Pasang Lowongan</Link>
              </div>
            ) : (
              <div>
                {jobs.map(job => (
                  <div key={job._id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 20px', borderBottom:'1px solid var(--border-light)' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <Link to={`/employer/applicants/${job._id}`} style={{ fontFamily:'var(--font-heading)', fontWeight:600, fontSize:'0.9375rem', color:'var(--dark)', textDecoration:'none' }} className="truncate">
                        {job.title}
                      </Link>
                      <p style={{ fontSize:'0.8125rem', color:'var(--muted)', marginTop:2 }}>
                        {job.applicantCount||0} pelamar · {formatRelativeTime(job.createdAt)}
                      </p>
                    </div>
                    <Link to={`/employer/applicants/${job._id}`} className="btn btn--secondary btn--sm">
                      Lihat <ChevronRight size={12}/>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ads Banner Carousel */}
          <AdsBannerCarousel />
        </motion.div>

{/* Right sidebar */}
        <motion.div variants={item} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Company profile completeness — dynamic */}
          <div className="card card-body">
            <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'0.9375rem', marginBottom:12 }}>Profil Perusahaan</h3>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <span style={{ fontSize:'0.8125rem', color:'var(--muted)' }}>Kelengkapan profil</span>
              <span style={{ fontSize:'0.875rem', fontWeight:700, color: pct === 100 ? 'var(--success)' : 'var(--dark)' }}>{pct}%</span>
            </div>
            <div style={{ height:6, background:'var(--bg-alt)', borderRadius:99, marginBottom:10, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background: progressColor, borderRadius:99, transition:'width 0.6s ease' }}/>
            </div>
            {pct === 100 ? (
              <p style={{ fontSize:'0.8125rem', color:'var(--success)', marginBottom:12, display:'flex', alignItems:'center', gap:4 }}>
                <CheckCircle2 size={13}/> Profil sudah lengkap!
              </p>
            ) : (
              <p style={{ fontSize:'0.8125rem', color:'var(--muted)', marginBottom:12, lineHeight:1.5 }}>
                Belum diisi: <span style={{ color:'var(--dark)', fontWeight:500 }}>{missing.slice(0,3).join(', ')}{missing.length > 3 ? ` +${missing.length - 3} lainnya` : ''}</span>
              </p>
            )}
            <Link to="/employer/company" className="btn btn--secondary btn--sm btn--block">Lengkapi Profil</Link>
          </div>

          {/* Quick actions */}
          <div className="card card-body">
            <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1rem', marginBottom:16 }}>Aksi Cepat</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <Link to="/employer/post-job" className="btn btn--accent btn--block">
                <PlusCircle size={16}/> Pasang Lowongan Baru
              </Link>
              <Link to="/employer/jobs" className="btn btn--secondary btn--block">
                <Briefcase size={16}/> Kelola Lowongan
              </Link>
              <Link to="/employer/company" className="btn btn--ghost btn--block">
                <ArrowUpRight size={16}/> Edit Profil Perusahaan
              </Link>
            </div>
          </div>

          {/* Tips */}
          <div className="card card-body" style={{ background:'linear-gradient(135deg,#f0f7ff,#e8f4fd)' }}>
            <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'0.9375rem', marginBottom:12 }}>💡 Tips Rekrutmen</h3>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:10 }}>
              {[
                'Tambahkan deskripsi yang detail untuk menarik kandidat berkualitas',
                'Cantumkan range gaji untuk meningkatkan jumlah pelamar 40%',
                'Respons pelamar dalam 48 jam untuk kesan profesional',
              ].map((tip,i) => (
                <li key={i} style={{ display:'flex', gap:8, fontSize:'0.8125rem', color:'var(--dark)', lineHeight:1.6 }}>
                  <span style={{ color:'var(--primary)', flexShrink:0, marginTop:2 }}>✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      <style>{`@media(max-width:1024px){.employer-grid{grid-template-columns:1fr!important;}}`}</style>
    </motion.div>
  )
}

function StatCard({ icon, label, val, color, bg }) {
  return (
    <div className="stat-card">
      <div>
        <p style={{ fontFamily:'var(--font-heading)', fontSize:'2rem', fontWeight:800, lineHeight:1 }}>{val}</p>
        <p style={{ fontSize:'0.8125rem', color:'var(--muted)', marginTop:4 }}>{label}</p>
      </div>
      <div style={{ width:44, height:44, borderRadius:12, background:bg, display:'flex', alignItems:'center', justifyContent:'center', color }}>{icon}</div>
    </div>
  )
}