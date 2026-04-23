import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, Briefcase, ArrowUpDown, X, Filter, SlidersHorizontal } from 'lucide-react'
import { useJobs, useCategories, useSaveJob } from '@/hooks/useJobs'
import { useAuth } from '@/context/AuthContext'
import JobCard from '@/components/common/JobCard'
import { SkeletonJobCard } from '@/components/common/Skeleton'

const JOB_TYPES = [
  { value: 'fulltime', label: 'Full-time' },
  { value: 'parttime', label: 'Part-time' },
  { value: 'remote', label: 'Remote' },
  { value: 'contract', label: 'Kontrak' },
  { value: 'internship', label: 'Magang' },
  { value: 'freelance', label: 'Freelance' },
]
const EXPERIENCE = [
  { value: 'fresh', label: 'Fresh Graduate' },
  { value: '1-2', label: '1 – 2 Tahun' },
  { value: '3-5', label: '3 – 5 Tahun' },
  { value: '5+', label: '5+ Tahun' },
]
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Terbaru' },
  { value: '-views', label: 'Terpopuler' },
  { value: '-salaryMax', label: 'Gaji Tertinggi' },
]

function FilterSidebar({ filters, onChange, onReset, categories }) {
  const set = (k, v) => onChange({ ...filters, [k]: v })
  const toggleArr = (k, v) => {
    const arr = filters[k] || []
    set(k, arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v])
  }
  return (
    <div className="filter-sidebar">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1rem' }}>Filter</h3>
        <button onClick={onReset} style={{ fontSize:'0.8125rem', color:'var(--primary)', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>Reset</button>
      </div>
      <div className="filter-group">
        <span className="filter-label">Kategori</span>
        <select className="form-input" value={filters.category || ''} onChange={e => set('category', e.target.value)}>
          <option value="">Semua Kategori</option>
          {(categories || []).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>
      <div className="filter-group">
        <span className="filter-label">Tipe Pekerjaan</span>
        {JOB_TYPES.map(({ value, label }) => (
          <label key={value} className="filter-checkbox">
            <input type="checkbox" checked={(filters.types||[]).includes(value)} onChange={() => toggleArr('types', value)} />
            {label}
          </label>
        ))}
      </div>
      <div className="filter-group">
        <span className="filter-label">Pengalaman</span>
        {EXPERIENCE.map(({ value, label }) => (
          <label key={value} className="filter-checkbox">
            <input type="checkbox" checked={(filters.experience||[]).includes(value)} onChange={() => toggleArr('experience', value)} />
            {label}
          </label>
        ))}
      </div>
      <div className="filter-group">
        <span className="filter-label">Gaji Minimum</span>
        <input type="range" min={0} max={50} step={1} value={filters.salaryMin ? filters.salaryMin / 1_000_000 : 0}
          onChange={e => set('salaryMin', e.target.value * 1_000_000)} style={{ width:'100%' }} />
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8125rem', color:'var(--muted)', marginTop:4 }}>
          <span>Rp 0</span>
          <span style={{ fontWeight:600, color:'var(--primary)' }}>{filters.salaryMin > 0 ? `Rp ${(filters.salaryMin/1_000_000).toFixed(0)}jt` : 'Semua'}</span>
          <span>Rp 50jt+</span>
        </div>
      </div>
      <div className="filter-group">
        <label className="filter-checkbox">
          <input type="checkbox" checked={!!filters.remote} onChange={e => set('remote', e.target.checked)} />
          Remote / WFH
        </label>
      </div>
    </div>
  )
}

export default function JobList() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { mutate: saveJob } = useSaveJob()
  const [keyword, setKeyword] = useState(searchParams.get('q') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [sort, setSort] = useState('-createdAt')
  const [page, setPage] = useState(1)
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    types: [], experience: [], salaryMin: 0, remote: false,
  })

  const { data: catData } = useCategories()
  const categories = catData?.data || []

  const queryParams = {
    q: keyword || undefined,
    location: location || undefined,
    category: filters.category || undefined,
    type: filters.types?.length === 1 ? filters.types[0] : undefined,
    salaryMin: filters.salaryMin > 0 ? filters.salaryMin : undefined,
    remote: filters.remote ? 'true' : undefined,
    sort, page, limit: 12,
  }
  const { data, isLoading } = useJobs(queryParams)
  const jobs = data?.data || []
  const pagination = data?.pagination || {}

  const activeFilters = [
    keyword && { key: 'kw', label: `"${keyword}"`, clear: () => setKeyword('') },
    location && { key: 'loc', label: location, clear: () => setLocation('') },
    filters.category && { key: 'cat', label: filters.category, clear: () => setFilters(f => ({ ...f, category: '' })) },
    ...(filters.types||[]).map(t => ({ key:`t-${t}`, label: JOB_TYPES.find(x=>x.value===t)?.label, clear: () => setFilters(f => ({ ...f, types: f.types.filter(x=>x!==t) })) })),
    ...(filters.experience||[]).map(e => ({ key:`e-${e}`, label: EXPERIENCE.find(x=>x.value===e)?.label, clear: () => setFilters(f => ({ ...f, experience: f.experience.filter(x=>x!==e) })) })),
    filters.remote && { key: 'rem', label: 'Remote', clear: () => setFilters(f => ({ ...f, remote: false })) },
  ].filter(Boolean)

  const resetFilters = () => { setFilters({ category:'', types:[], experience:[], salaryMin:0, remote:false }); setKeyword(''); setLocation(''); setPage(1) }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      {/* Search header */}
      <div style={{ background:'var(--gradient-hero)', padding:'40px 0 28px' }}>
        <div className="container">
          <h1 style={{ color:'#fff', fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'clamp(1.5rem,3vw,2.25rem)', marginBottom:20, textAlign:'center' }}>
            Cari Lowongan Kerja
          </h1>
          <form onSubmit={e => { e.preventDefault(); setPage(1) }} className="search-bar" style={{ maxWidth:760 }}>
            <Search size={20} style={{ color:'var(--primary)', flexShrink:0, marginLeft:4 }} />
            <input className="search-bar__input" placeholder="Posisi, skill, perusahaan..." value={keyword} onChange={e => setKeyword(e.target.value)} />
            <div className="search-bar__divider" />
            <MapPin size={18} style={{ color:'var(--muted)', flexShrink:0 }} />
            <input className="search-bar__input" placeholder="Kota atau remote..." value={location} onChange={e => setLocation(e.target.value)} style={{ maxWidth:180 }} />
            <button type="submit" className="btn btn--primary" style={{ flexShrink:0 }}>Cari</button>
          </form>
        </div>
      </div>

      <div className="container" style={{ padding:'28px var(--space-6)' }}>
        {/* Top bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <p style={{ color:'var(--muted)', fontSize:'0.9375rem' }}>
            {isLoading ? 'Mencari...' : <><strong style={{ color:'var(--dark)' }}>{pagination.total || 0}</strong> lowongan ditemukan</>}
          </p>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <button className="btn btn--secondary btn--sm" style={{ display:'flex' }} onClick={() => setShowMobileFilter(true)}>
              <SlidersHorizontal size={15} /> Filter
            </button>
            <select className="form-input" style={{ fontSize:'0.875rem', padding:'8px 32px 8px 12px' }} value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Active chips */}
        {activeFilters.length > 0 && (
          <div className="filter-chips">
            {activeFilters.map(({ key, label, clear }) => (
              <span key={key} className="filter-chip">{label}<button onClick={clear}><X size={12} /></button></span>
            ))}
            <button onClick={resetFilters} style={{ fontSize:'0.8125rem', color:'var(--error)', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>Hapus semua</button>
          </div>
        )}

        <div style={{ display:'flex', gap:24, alignItems:'flex-start' }}>
          {/* Desktop sidebar */}
          <div style={{ flexShrink:0, display:'block' }} className="desktop-filter">
            <FilterSidebar filters={filters} onChange={setFilters} onReset={resetFilters} categories={categories} />
          </div>

          {/* Job grid */}
          <div style={{ flex:1, minWidth:0 }}>
            {isLoading ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
                {Array(8).fill(0).map((_,i) => <SkeletonJobCard key={i} />)}
              </div>
            ) : jobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon"><Briefcase size={32} /></div>
                <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:8 }}>Tidak ada lowongan</h3>
                <p>Coba ubah kata kunci atau hapus beberapa filter.</p>
                <button className="btn btn--primary" style={{ marginTop:20 }} onClick={resetFilters}>Reset Filter</button>
              </div>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
                  {jobs.map((job, i) => (
                    <motion.div key={job._id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04, duration:0.3 }}>
                      <JobCard job={job} onSave={j => saveJob({ jobId:j._id, saved: (user?.savedJobs||[]).map(String).includes(String(j._id)) })} isSaved={(user?.savedJobs||[]).map(String).includes(String(job._id))} />
                    </motion.div>
                  ))}
                </div>
                {pagination.pages > 1 && (
                  <div className="pagination" style={{ marginTop:32 }}>
                    <button className="pagination__btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>←</button>
                    {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i+1).map(p => (
                      <button key={p} className={`pagination__btn ${page===p?'active':''}`} onClick={() => setPage(p)}>{p}</button>
                    ))}
                    <button className="pagination__btn" disabled={page===pagination.pages} onClick={() => setPage(p=>p+1)}>→</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter overlay */}
      {showMobileFilter && (
        <div className="modal-overlay" onClick={() => setShowMobileFilter(false)}>
          <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'var(--card)', borderRadius:'var(--radius-lg) var(--radius-lg) 0 0', padding:'var(--space-6)', maxHeight:'85vh', overflowY:'auto', zIndex:300 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700 }}>Filter Lowongan</h3>
              <button onClick={() => setShowMobileFilter(false)} style={{ background:'var(--bg-alt)', border:'none', borderRadius:99, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={16} /></button>
            </div>
            <FilterSidebar filters={filters} onChange={setFilters} onReset={resetFilters} categories={categories} />
            <button className="btn btn--primary btn--block" style={{ marginTop:20 }} onClick={() => setShowMobileFilter(false)}>Terapkan Filter</button>
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:768px){.desktop-filter{display:none!important;}}
      `}</style>
    </div>
  )
}
