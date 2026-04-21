import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Globe, Users, Building2, BadgeCheck, Briefcase, ExternalLink, Linkedin, Twitter, Instagram, ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { useJobs } from '@/hooks/useJobs'
import JobCard from '@/components/common/JobCard'
import Badge from '@/components/common/Badge'
import { SkeletonJobCard } from '@/components/common/Skeleton'

const fetchCompany = (id) => api.get(`/companies/${id}`).then(r=>r.data)

export default function CompanyPublicProfile() {
  const { id } = useParams()
  const { data, isLoading } = useQuery({ queryKey:['company', id], queryFn:()=>fetchCompany(id), enabled:!!id })
  const company = data?.data || data

  const { data: jobsData, isLoading: jobsLoading } = useJobs({ company:id, limit:6 })
  const jobs = jobsData?.data || []

  if (isLoading) return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <div className="skeleton" style={{ height:220, borderRadius:0 }}/>
      <div className="container" style={{ padding:'28px var(--space-6)', maxWidth:1000 }}>
        <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:28 }}>
          <div className="skeleton" style={{ height:280, borderRadius:12 }}/>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {Array(4).fill(0).map((_,i)=><div key={i} className="skeleton" style={{ height:80, borderRadius:12 }}/>)}
          </div>
        </div>
      </div>
    </div>
  )

  if (!company) return (
    <div className="container empty-state" style={{ minHeight:'60vh' }}>
      <div className="empty-state__icon"><Building2 size={32}/></div>
      <h3>Perusahaan tidak ditemukan</h3>
    </div>
  )

  const { name, logo, industry, size, type, location, website, description, culture, benefits=[], isVerified, stats={}, socialMedia={} } = company

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', paddingBottom:60 }}>
      {/* Cover */}
      <div style={{ height:180, background:'var(--gradient-dark)', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.3, backgroundImage:'radial-gradient(circle at 20% 50%, #1B6FC8 0%, transparent 50%), radial-gradient(circle at 80% 20%, #21CBF3 0%, transparent 50%)' }}/>
      </div>

      <div className="container" style={{ padding:'0 var(--space-6)', maxWidth:1000, position:'relative' }}>
        {/* Logo */}
        <div style={{ position:'relative', marginTop:-52, marginBottom:24 }}>
          <div style={{ width:100, height:100, borderRadius:'var(--radius-md)', border:'4px solid #fff', background:'#fff', boxShadow:'var(--shadow-md)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
            {logo
              ? <img src={logo} alt={name} style={{ width:'100%', height:'100%', objectFit:'contain', padding:6 }}/>
              : <Building2 size={44} style={{ color:'var(--muted-light)' }}/>
            }
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:32, alignItems:'flex-start' }}>
          {/* Main */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <div style={{ marginBottom:28 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:6 }}>
                <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:800 }}>{name}</h1>
                {isVerified && (
                  <span style={{ display:'flex', alignItems:'center', gap:4, color:'var(--success)', fontSize:'0.875rem', fontWeight:600 }}>
                    <BadgeCheck size={18}/> Terverifikasi
                  </span>
                )}
              </div>
              <div style={{ display:'flex', gap:14, flexWrap:'wrap', color:'var(--muted)', fontSize:'0.875rem' }}>
                {industry && <span>{industry}</span>}
                {size && <><span>·</span><span><Users size={13} style={{ verticalAlign:'middle' }}/> {size} karyawan</span></>}
                {location && <><span>·</span><span><MapPin size={13} style={{ verticalAlign:'middle' }}/> {location}</span></>}
              </div>
            </div>

            {description && (
              <div className="profile-section">
                <div className="profile-section__header"><p className="profile-section__title">Tentang Perusahaan</p></div>
                <div className="profile-section__body">
                  <p style={{ color:'var(--dark)', lineHeight:1.85, fontSize:'0.9375rem', whiteSpace:'pre-wrap' }}>{description}</p>
                </div>
              </div>
            )}

            {culture && (
              <div className="profile-section">
                <div className="profile-section__header"><p className="profile-section__title">Budaya Kerja</p></div>
                <div className="profile-section__body">
                  <p style={{ color:'var(--dark)', lineHeight:1.8, fontSize:'0.9375rem' }}>{culture}</p>
                </div>
              </div>
            )}

            {/* Open Jobs */}
            <div style={{ marginTop:8 }}>
              <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1.125rem', marginBottom:16 }}>
                Lowongan Tersedia ({stats.activeJobs||jobs.length})
              </h2>
              {jobsLoading ? (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {Array(3).fill(0).map((_,i)=><SkeletonJobCard key={i}/>)}
                </div>
              ) : jobs.length===0 ? (
                <div className="empty-state" style={{ padding:'28px 16px' }}>
                  <p>Belum ada lowongan tersedia saat ini.</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {jobs.map(j=><JobCard key={j._id} job={j}/>)}
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }}>
            <div className="card card-body" style={{ marginBottom:16 }}>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  { icon:<Briefcase size={15}/>, label:'Tipe', value:type },
                  { icon:<Users size={15}/>, label:'Ukuran', value:size ? `${size} karyawan` : null },
                  { icon:<MapPin size={15}/>, label:'Lokasi', value:location },
                  { icon:<Building2 size={15}/>, label:'Lowongan Aktif', value:stats.activeJobs||0 },
                ].filter(x=>x.value).map(({icon,label,value})=>(
                  <div key={label} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <span style={{ color:'var(--primary)', flexShrink:0, marginTop:2 }}>{icon}</span>
                    <div>
                      <p style={{ fontSize:'0.75rem', color:'var(--muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</p>
                      <p style={{ fontWeight:600, fontSize:'0.9rem' }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {website && (
                <a href={website} target="_blank" rel="noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:6, marginTop:16, color:'var(--primary)', fontWeight:600, fontSize:'0.875rem', textDecoration:'none', padding:'10px 14px', border:'1.5px solid var(--primary)', borderRadius:'var(--radius)', justifyContent:'center' }}>
                  <Globe size={14}/> Kunjungi Website <ExternalLink size={12}/>
                </a>
              )}
            </div>

            {(socialMedia.linkedin || socialMedia.twitter || socialMedia.instagram) && (
              <div className="card card-body">
                <p style={{ fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:14, fontSize:'0.9375rem' }}>Media Sosial</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {socialMedia.linkedin && <a href={socialMedia.linkedin} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:10, color:'#0A66C2', textDecoration:'none', fontSize:'0.875rem', fontWeight:600 }}><Linkedin size={16}/> LinkedIn</a>}
                  {socialMedia.twitter && <a href={socialMedia.twitter} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:10, color:'#1DA1F2', textDecoration:'none', fontSize:'0.875rem', fontWeight:600 }}><Twitter size={16}/> Twitter</a>}
                  {socialMedia.instagram && <a href={socialMedia.instagram} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:10, color:'#E4405F', textDecoration:'none', fontSize:'0.875rem', fontWeight:600 }}><Instagram size={16}/> Instagram</a>}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
