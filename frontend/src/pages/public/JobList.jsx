import { useState, useCallback } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, SlidersHorizontal, X, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { jobService } from '@/services/jobService'
import JobCard from '@/components/common/JobCard'
import Badge from '@/components/common/Badge'
import { SkeletonJobCard } from '@/components/common/Skeleton'
import { useSaveJob } from '@/hooks/useJobs'
import { useAuth } from '@/context/AuthContext'

const JOB_TYPES = ['fulltime','parttime','contract','freelance','internship','remote']
const JOB_TYPE_LABELS = { fulltime:'Full-time', parttime:'Part-time', contract:'Kontrak', freelance:'Freelance', internship:'Magang', remote:'Remote' }
const EXPERIENCE_OPTS = [['fresh','Fresh Graduate'],['1-2','1–2 Thn'],['3-5','3–5 Thn'],['5+','5+ Thn']]
const SORT_OPTS = [['createdAt_desc','Terbaru'],['salary_desc','Gaji Tertinggi']]
const CATEGORIES = ['Teknologi','Desain','Marketing','Keuangan','Pendidikan','Kesehatan','Hukum','Logistik','HR','Sales']

const ITEMS_PER_PAGE = 12

export default function PublicJobList() {
  const [params, setParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const { mutate: saveJob } = useSaveJob()
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const [searchQ, setSearchQ] = useState(params.get('q') || '')
  const [searchLoc, setSearchLoc] = useState(params.get('location') || '')

  const f = {
    q: params.get('q') || '',
    location: params.get('location') || '',
    category: params.get('category') || '',
    type: params.getAll('type'),
    experience: params.getAll('experience'),
    salaryMin: params.get('salaryMin') || '',
    sort: params.get('sort') || 'createdAt_desc',
    page: Number(params.get('page')) || 1,
  }

  const qp = {
    q: f.q, location: f.location, category: f.category,
    type: f.type.join(','), experience: f.experience.join(','),
    salaryMin: f.salaryMin, page: f.page, limit: ITEMS_PER_PAGE,
    sort: f.sort === 'salary_desc' ? '-salaryMax' : '-createdAt',
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['jobs', 'list', qp],
    queryFn: () => jobService.getJobs(qp).then(r => r.data),
    placeholderData: prev => prev,
  })

  const jobs = data?.data || []
  const pg = data?.pagination || {}

  const setP = useCallback((key, val) => setParams(prev => {
    const n = new URLSearchParams(prev)
    if (!val) n.delete(key); else n.set(key, val)
    n.delete('page'); return n
  }), [setParams])

  const toggleArr = useCallback((key, val) => setParams(prev => {
    const n = new URLSearchParams(prev)
    const cur = prev.getAll(key)
    n.delete(key)
    ;(cur.includes(val) ? cur.filter(v=>v!==val) : [...cur, val]).forEach(v => n.append(key, v))
    n.delete('page'); return n
  }), [setParams])

  const clearAll = () => { setSearchQ(''); setSearchLoc(''); setParams({}) }

  const handleSearch = e => {
    e.preventDefault()
    setParams(prev => {
      const n = new URLSearchParams(prev)
      searchQ ? n.set('q', searchQ) : n.delete('q')
      searchLoc ? n.set('location', searchLoc) : n.delete('location')
      n.delete('page'); return n
    })
  }

  const activeChips = [
    f.category && { label:f.category, rm:()=>setP('category','') },
    ...f.type.map(t=>({ label:JOB_TYPE_LABELS[t], rm:()=>toggleArr('type',t) })),
    ...f.experience.map(e=>({ label:EXPERIENCE_OPTS.find(o=>o[0]===e)?.[1]||e, rm:()=>toggleArr('experience',e) })),
    f.salaryMin && { label:`Min Rp${Number(f.salaryMin).toLocaleString('id-ID')}`, rm:()=>setP('salaryMin','') },
  ].filter(Boolean)

  const FilterSection = ({ title, children }) => (
    <div style={{ marginBottom:20 }}>
      <p style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--muted)', marginBottom:10 }}>{title}</p>
      {children}
    </div>
  )

  const Filters = () => (
    <>
      <FilterSection title="Kategori">
        {CATEGORIES.map(c => (
          <label key={c} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', padding:'4px 0', fontSize:'0.875rem', color:f.category===c?'var(--primary)':'var(--dark)', fontWeight:f.category===c?600:400 }}>
            <input type="radio" name="cat" checked={f.category===c} onChange={()=>setP('category', f.category===c?'':c)} style={{accentColor:'var(--primary)'}}/>
            {c}
          </label>
        ))}
      </FilterSection>
      <hr className="divider"/>
      <FilterSection title="Tipe Pekerjaan">
        {JOB_TYPES.map(t => (
          <label key={t} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', padding:'4px 0', fontSize:'0.875rem' }}>
            <input type="checkbox" checked={f.type.includes(t)} onChange={()=>toggleArr('type',t)} style={{accentColor:'var(--primary)'}}/>
            {JOB_TYPE_LABELS[t]}
          </label>
        ))}
      </FilterSection>
      <hr className="divider"/>
      <FilterSection title="Pengalaman">
        {EXPERIENCE_OPTS.map(([v,l]) => (
          <label key={v} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', padding:'4px 0', fontSize:'0.875rem' }}>
            <input type="checkbox" checked={f.experience.includes(v)} onChange={()=>toggleArr('experience',v)} style={{accentColor:'var(--primary)'}}/>
            {l}
          </label>
        ))}
      </FilterSection>
      <hr className="divider"/>
      <FilterSection title="Gaji Minimum (IDR)">
        <input type="number" placeholder="Contoh: 5000000" className="form-input" style={{ fontSize:'0.875rem' }}
          value={f.salaryMin} onChange={e=>setP('salaryMin',e.target.value)}/>
      </FilterSection>
      {activeChips.length > 0 && (
        <button className="btn btn--ghost btn--sm" style={{ color:'var(--error)', width:'100%', marginTop:8 }} onClick={clearAll}>
          <X size={14}/> Reset Filter
        </button>
      )}
    </>
  )

  return (
    <div className="container" style={{ padding:'32px 0 64px' }}>
      {/* Search */}
      <form onSubmit={handleSearch} className="card" style={{ padding:16, display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', marginBottom:24, boxShadow:'var(--shadow)' }}>
        <div style={{ flex:2, minWidth:180, display:'flex', alignItems:'center', gap:8, paddingRight:12, borderRight:'1px solid var(--border)' }}>
          <Search size={18} style={{ color:'var(--primary)', flexShrink:0 }}/>
          <input className="form-input" style={{ border:'none', padding:'4px 0', boxShadow:'none' }} placeholder="Posisi, keahlian, perusahaan..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}/>
        </div>
        <div style={{ flex:1, minWidth:130, display:'flex', alignItems:'center', gap:8 }}>
          <MapPin size={16} style={{ color:'var(--muted)', flexShrink:0 }}/>
          <input className="form-input" style={{ border:'none', padding:'4px 0', boxShadow:'none' }} placeholder="Kota / Remote" value={searchLoc} onChange={e=>setSearchLoc(e.target.value)}/>
        </div>
        <button type="submit" className="btn btn--primary" style={{ flexShrink:0 }}>Cari</button>
      </form>

      <div style={{ display:'flex', gap:28, alignItems:'flex-start' }}>
        {/* Desktop sidebar */}
        <aside style={{ width:232, flexShrink:0, display:'none' }} id="filter-sidebar" className="lg-show">
          <div className="card card-body" style={{ position:'sticky', top:88 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1rem' }}>Filter</h3>
              {activeChips.length>0 && <button style={{ fontSize:'0.8rem', color:'var(--error)', background:'none', border:'none', cursor:'pointer', fontWeight:600 }} onClick={clearAll}>Reset</button>}
            </div>
            <Filters/>
          </div>
        </aside>

        <div style={{ flex:1, minWidth:0 }}>
          {/* Topbar */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:10 }}>
            <p style={{ fontWeight:600, color:'var(--dark)', fontSize:'0.9375rem' }}>
              {isFetching ? 'Memuat...' : <>{pg.total||0} lowongan{f.q && <span style={{fontWeight:400,color:'var(--muted)'}}> untuk "{f.q}"</span>}</>}
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn--secondary btn--sm" onClick={()=>setShowFilters(v=>!v)}>
                <SlidersHorizontal size={14}/> Filter
                {activeChips.length>0 && <Badge variant="primary" style={{ marginLeft:4, padding:'1px 6px', fontSize:'0.7rem' }}>{activeChips.length}</Badge>}
              </button>
              <select className="form-input" style={{ width:'auto', padding:'8px 32px 8px 10px', fontSize:'0.875rem' }}
                value={f.sort} onChange={e=>setP('sort',e.target.value)}>
                {SORT_OPTS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Active chips */}
          {activeChips.length>0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
              {activeChips.map((c,i) => (
                <span key={i} className="badge badge--primary" style={{ cursor:'pointer', gap:5 }} onClick={c.rm}>
                  {c.label} <X size={11}/>
                </span>
              ))}
            </div>
          )}

          {/* Mobile filter */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} style={{overflow:'hidden',marginBottom:20}}>
                <div className="card card-body">
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                    <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:800 }}>Filter</h3>
                    <button onClick={()=>setShowFilters(false)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={18}/></button>
                  </div>
                  <Filters/>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid */}
          {isLoading ? (
            <div className="grid-2" style={{ gap:16 }}>{Array(8).fill(0).map((_,i)=><SkeletonJobCard key={i}/>)}</div>
          ) : jobs.length===0 ? (
            <div className="empty-state">
              <div className="empty-state__icon"><Briefcase size={32}/></div>
              <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:800, marginBottom:8 }}>Lowongan tidak ditemukan</h3>
              <p>Coba ubah kata kunci atau hapus filter.</p>
              <button className="btn btn--primary" style={{ marginTop:20 }} onClick={clearAll}>Hapus Filter</button>
            </div>
          ) : (
            <motion.div className="grid-2" style={{ gap:16 }}
              initial="h" animate="s" variants={{h:{},s:{transition:{staggerChildren:0.04}}}}>
              {jobs.map(job=>(
                <motion.div key={job._id} variants={{h:{opacity:0,y:12},s:{opacity:1,y:0}}}>
                  <JobCard job={job} onSave={isAuthenticated?(j)=>saveJob({jobId:j._id,saved:false}):()=>navigate('/login')}/>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {(pg.pages||0) > 1 && (
            <div className="pagination" style={{ marginTop:32 }}>
              <button className="pagination__btn" disabled={f.page<=1} onClick={()=>setP('page',f.page-1)}><ChevronLeft size={16}/></button>
              {Array.from({length:Math.min(pg.pages,7)},(_,i)=>{
                const p = pg.pages<=7 ? i+1 : f.page<=4 ? i+1 : f.page>=pg.pages-3 ? pg.pages-6+i : f.page-3+i
                return <button key={p} className={`pagination__btn ${p===f.page?'active':''}`} onClick={()=>setP('page',p)}>{p}</button>
              })}
              <button className="pagination__btn" disabled={f.page>=(pg.pages||1)} onClick={()=>setP('page',f.page+1)}><ChevronRight size={16}/></button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
