import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, FileText, Bookmark, GraduationCap, ArrowRight, CheckCircle, Clock, XCircle, Send } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useFeaturedJobs } from '@/hooks/useJobs'
import { useMyApplications } from '@/hooks/useApplications'
import JobCard from '@/components/common/JobCard'
import { SkeletonJobCard, SkeletonStatCard } from '@/components/common/Skeleton'
import Badge from '@/components/common/Badge'
import { formatRelativeTime, APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/utils/formatters'

const STATUS_ICONS = { pending:<Send size={20}/>, reviewed:<Clock size={20}/>, shortlist:<CheckCircle size={20}/>, interview:<CheckCircle size={20}/>, offered:<CheckCircle size={20}/>, hired:<CheckCircle size={20}/>, rejected:<XCircle size={20}/>, withdrawn:<XCircle size={20}/> }
const STATUS_BG = { pending:'var(--accent-light)', reviewed:'#E3F2FD', shortlist:'var(--accent-light)', interview:'var(--warning-light)', offered:'var(--success-light)', hired:'var(--success-light)', rejected:'var(--error-light)', withdrawn:'var(--bg-alt)' }
const STATUS_COLOR = { pending:'var(--primary)', reviewed:'var(--accent)', shortlist:'var(--primary)', interview:'#F57F17', offered:'var(--success)', hired:'var(--success)', rejected:'var(--error)', withdrawn:'var(--muted)' }

const container = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } }
const item = { hidden:{opacity:0,y:16}, show:{opacity:1,y:0,transition:{duration:0.35}} }

export default function SeekerDashboard() {
  const { user } = useAuth()
  const { data:jobsData, isLoading:jobsLoading } = useFeaturedJobs()
  const { data:appsData, isLoading:appsLoading } = useMyApplications({ limit:5 })

  const jobs = jobsData?.data || []
  const apps = appsData?.data || []

  const appStats = apps.reduce((acc,a) => {
    const g = ['hired','offered'].includes(a.status) ? 'accepted' :
               a.status==='rejected'?'rejected':
               ['pending','reviewed'].includes(a.status)?'pending':'active'
    acc[g] = (acc[g]||0)+1; return acc
  },{})

  const profilePercent = user?.profileComplete || 0

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Greeting */}
      <motion.div variants={item} style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'1.75rem', fontWeight:800, marginBottom:4 }}>
          Selamat datang, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p style={{ color:'var(--muted)' }}>Temukan peluang karir terbaik untuk Anda hari ini.</p>
      </motion.div>

      {/* Profile completion */}
      {profilePercent < 80 && (
        <motion.div variants={item} style={{ background:'var(--gradient-hero)', borderRadius:'var(--radius-md)', padding:20, marginBottom:28, display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:200 }}>
            <p style={{ color:'#fff', fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:6 }}>Profil {profilePercent}% lengkap</p>
            <div style={{ height:8, background:'rgba(255,255,255,0.25)', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${profilePercent}%`, background:'#fff', borderRadius:99, transition:'width 1s ease' }}/>
            </div>
            <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.875rem', marginTop:6 }}>Lengkapi profil untuk meningkatkan peluang diterima</p>
          </div>
          <Link to="/seeker/profile" style={{ background:'#fff', color:'var(--primary)', padding:'10px 20px', borderRadius:'var(--radius)', fontFamily:'var(--font-heading)', fontWeight:700, textDecoration:'none', fontSize:'0.875rem', flexShrink:0 }}>
            Lengkapi Sekarang
          </Link>
        </motion.div>
      )}

      {/* Stats — hidden */}
      <motion.div variants={item} style={{ display:'none', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:16, marginBottom:32 }}>
        {[
          { icon:<Send size={22}/>, label:'Menunggu', val:appStats.pending||0, color:'var(--primary)', bg:'var(--accent-light)' },
          { icon:<Clock size={22}/>, label:'Diproses', val:appStats.active||0, color:'#F57F17', bg:'var(--warning-light)' },
          { icon:<CheckCircle size={22}/>, label:'Diterima', val:appStats.accepted||0, color:'var(--success)', bg:'var(--success-light)' },
          { icon:<XCircle size={22}/>, label:'Ditolak', val:appStats.rejected||0, color:'var(--error)', bg:'var(--error-light)' },
        ].map(s=>(
          <div key={s.label} className="stat-card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <p style={{ fontFamily:'var(--font-heading)', fontSize:'2rem', fontWeight:800, lineHeight:1, color:'var(--dark)' }}>{s.val}</p>
              <p style={{ fontSize:'0.8rem', color:'var(--muted)', marginTop:4 }}>{s.label}</p>
            </div>
            <div style={{ width:44, height:44, borderRadius:12, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', color:s.color }}>{s.icon}</div>
          </div>
        ))}
      </motion.div>

      <div className="seeker-grid" style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:28, alignItems:'start', width:'100%' }}>
        {/* Recommended jobs */}
        <motion.div variants={item}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.25rem' }}>Rekomendasi Lowongan</h2>
            <Link to="/jobs" style={{ fontSize:'0.875rem', color:'var(--primary)', fontWeight:600, display:'flex', alignItems:'center', gap:4, textDecoration:'none' }}>
              Lihat Semua <ArrowRight size={14}/>
            </Link>
          </div>
          {jobsLoading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>{Array(4).fill(0).map((_,i)=><SkeletonJobCard key={i}/>)}</div>
          ) : jobs.length===0 ? (
            <div className="empty-state">
              <div className="empty-state__icon"><Briefcase size={28}/></div>
              <p>Belum ada rekomendasi lowongan.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {jobs.slice(0,5).map(j=><JobCard key={j._id} job={j}/>)}
            </div>
          )}
        </motion.div>

        {/* Recent applications */}
        <motion.div variants={item}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
            <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.25rem' }}>Lamaran Terkini</h2>
            <Link to="/seeker/applications" style={{ fontSize:'0.875rem', color:'var(--primary)', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>Semua <ArrowRight size={14}/></Link>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {appsLoading ? Array(3).fill(0).map((_,i)=>(
              <div key={i} className="card card-body" style={{ padding:14 }}>
                <div className="skeleton skeleton--title" style={{ marginBottom:8, width:'70%' }}/>
                <div className="skeleton skeleton--text" style={{ width:'50%' }}/>
              </div>
            )) : apps.length===0 ? (
              <div className="empty-state" style={{ padding:'32px 16px' }}>
                <div className="empty-state__icon"><FileText size={24}/></div>
                <p style={{ fontSize:'0.875rem' }}>Belum ada lamaran.</p>
                <Link to="/jobs" className="btn btn--primary btn--sm" style={{ marginTop:12 }}>Cari Lowongan</Link>
              </div>
            ) : apps.map(app=>(
              <div key={app._id} className="card card-body" style={{ padding:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'0.9rem' }} className="truncate">{app.job?.title}</p>
                    <p style={{ fontSize:'0.8rem', color:'var(--muted)' }}>{app.job?.company?.name}</p>
                  </div>
                  <Badge variant={APPLICATION_STATUS_COLORS[app.status]||'muted'} style={{ flexShrink:0, fontSize:'0.7rem' }}>
                    {APPLICATION_STATUS_LABELS[app.status]||app.status}
                  </Badge>
                </div>
                <p style={{ fontSize:'0.75rem', color:'var(--muted)', marginTop:6 }}>{formatRelativeTime(app.createdAt)}</p>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div style={{ marginTop:20, display:'none', flexDirection:'column', gap:8 }}>
            {[
              { to:'/seeker/profile', icon:<GraduationCap size={16}/>, label:'Update CV & Profil' },
              { to:'/seeker/saved', icon:<Bookmark size={16}/>, label:'Lowongan Tersimpan' },
              { to:'/seeker/coaching', icon:<GraduationCap size={16}/>, label:'Bimbingan Karir' },
            ].map(l=>(
              <Link key={l.to} to={l.to} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderRadius:'var(--radius)', border:'1.5px solid var(--border-light)', background:'#fff', color:'var(--dark)', textDecoration:'none', fontSize:'0.875rem', fontWeight:600, transition:'all 0.15s' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.color='var(--primary)' }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border-light)'; e.currentTarget.style.color='var(--dark)' }}>
                <span style={{ color:'var(--primary)' }}>{l.icon}</span>{l.label} <ArrowRight size={14} style={{ marginLeft:'auto' }}/>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}