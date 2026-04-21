import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Clock, BookOpen } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import Badge from '@/components/common/Badge'

const CATEGORIES = ['Semua','Tips Karir','Interview','Resume','Gaji & Negosiasi','Berita']
const CAT_COLORS = { 'Tips Karir':'primary', 'Interview':'warning', 'Resume':'success', 'Gaji & Negosiasi':'muted', 'Berita':'error' }

const MOCK_ARTICLES = [
  { _id:'1', slug:'tips-lolos-interview', title:'10 Tips Ampuh Lolos Interview Kerja di Perusahaan Top', excerpt:'Persiapkan diri Anda dengan strategi terbukti yang digunakan kandidat sukses.', category:'Interview', readTime:5, createdAt:new Date('2024-12-10'), cover:'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80', featured:true },
  { _id:'2', slug:'gaji-negosiasi', title:'Cara Negosiasi Gaji yang Efektif dan Percaya Diri', excerpt:'Jangan mau dibayar di bawah standar. Pelajari teknik negosiasi yang tepat.', category:'Gaji & Negosiasi', readTime:7, createdAt:new Date('2024-12-08'), cover:'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80' },
  { _id:'3', slug:'cv-ats-friendly', title:'Cara Membuat CV yang Lolos ATS dan Menarik Perhatian HRD', excerpt:'ATS (Applicant Tracking System) adalah gatekeeper pertama CV Anda.', category:'Resume', readTime:6, createdAt:new Date('2024-12-05'), cover:'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80' },
  { _id:'4', slug:'pindah-karir-tech', title:'Panduan Lengkap Pindah Karir ke Industri Teknologi 2024', excerpt:'Industri tech menawarkan gaji tinggi dan peluang besar. Ini caranya.', category:'Tips Karir', readTime:10, createdAt:new Date('2024-12-01'), cover:'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80' },
  { _id:'5', slug:'linkedin-profile', title:'Optimalkan Profil LinkedIn Anda Agar Ditemukan Recruiter', excerpt:'93% recruiter menggunakan LinkedIn. Pastikan profil Anda menonjol.', category:'Tips Karir', readTime:4, createdAt:new Date('2024-11-28'), cover:'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=600&q=80' },
  { _id:'6', slug:'fresh-graduate-tips', title:'Panduan Memulai Karir untuk Fresh Graduate', excerpt:'Baru lulus? Jangan panik. Ini langkah konkret untuk memulai karir Anda.', category:'Tips Karir', readTime:8, createdAt:new Date('2024-11-25'), cover:'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80' },
]

const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })

export default function Articles() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Semua')

  const filtered = MOCK_ARTICLES.filter(a => {
    const matchCat = activeCategory==='Semua' || a.category===activeCategory
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const featured = MOCK_ARTICLES.find(a=>a.featured)

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', paddingBottom:60 }}>
      {/* Header */}
      <div style={{ background:'var(--gradient-hero)', padding:'48px 0 36px' }}>
        <div className="container" style={{ textAlign:'center' }}>
          <h1 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'clamp(1.75rem,4vw,2.5rem)', color:'#fff', marginBottom:12 }}>
            Artikel & Tips Karir
          </h1>
          <p style={{ color:'rgba(255,255,255,0.85)', fontSize:'1.0625rem', marginBottom:28, maxWidth:540, margin:'0 auto 28px' }}>
            Panduan, tips, dan insight terkini untuk membantu perjalanan karir Anda.
          </p>
          <div style={{ background:'#fff', borderRadius:'var(--radius-lg)', display:'flex', alignItems:'center', gap:10, padding:'10px 16px', maxWidth:480, margin:'0 auto', boxShadow:'var(--shadow-md)' }}>
            <Search size={18} style={{ color:'var(--muted)', flexShrink:0 }}/>
            <input style={{ border:'none', outline:'none', width:'100%', fontSize:'0.9375rem' }} placeholder="Cari artikel..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding:'36px var(--space-6)', maxWidth:1100 }}>
        {/* Categories */}
        <div style={{ display:'flex', gap:10, overflowX:'auto', marginBottom:32, paddingBottom:4, scrollbarWidth:'none' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={()=>setActiveCategory(c)}
              style={{ padding:'8px 18px', borderRadius:99, border:`1.5px solid ${activeCategory===c?'var(--primary)':'var(--border)'}`, background:activeCategory===c?'var(--primary)':'#fff', color:activeCategory===c?'#fff':'var(--dark)', fontWeight:600, fontSize:'0.875rem', cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s', flexShrink:0 }}>
              {c}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        {featured && activeCategory==='Semua' && !search && (
          <Link to={`/articles/${featured.slug}`} style={{ textDecoration:'none', display:'block', marginBottom:36 }}>
            <motion.div whileHover={{ y:-3 }} style={{ borderRadius:'var(--radius-lg)', overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 1fr', background:'var(--card)', boxShadow:'var(--shadow-md)' }}>
              <img src={featured.cover} alt="" style={{ width:'100%', height:280, objectFit:'cover' }}/>
              <div style={{ padding:'32px 36px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
                <Badge variant="primary" style={{ width:'fit-content', marginBottom:14 }}>✨ Artikel Pilihan</Badge>
                <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.5rem', color:'var(--dark)', lineHeight:1.4, marginBottom:12 }}>{featured.title}</h2>
                <p style={{ color:'var(--muted)', lineHeight:1.7, marginBottom:16 }}>{featured.excerpt}</p>
                <div style={{ display:'flex', gap:14, fontSize:'0.8125rem', color:'var(--muted-light)' }}>
                  <span><Clock size={12} style={{ verticalAlign:'middle' }}/> {featured.readTime} menit baca</span>
                  <span>{formatDate(featured.createdAt)}</span>
                </div>
              </div>
            </motion.div>
          </Link>
        )}

        {/* Article grid */}
        {filtered.length===0 ? (
          <div className="empty-state">
            <div className="empty-state__icon"><BookOpen size={28}/></div>
            <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:8 }}>Artikel tidak ditemukan</h3>
            <p>Coba kata kunci atau kategori lain.</p>
          </div>
        ) : (
          <motion.div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:24 }}
            initial="h" animate="s" variants={{h:{},s:{transition:{staggerChildren:0.06}}}}>
            {filtered.map(article=>(
              <motion.div key={article._id} variants={{h:{opacity:0,y:16},s:{opacity:1,y:0}}} whileHover={{ y:-4 }}>
                <Link to={`/articles/${article.slug}`} style={{ textDecoration:'none', display:'flex', flexDirection:'column', height:'100%', borderRadius:'var(--radius-md)', overflow:'hidden', background:'var(--card)', border:'1px solid var(--border-light)', boxShadow:'var(--shadow-sm)', transition:'box-shadow 0.2s' }}>
                  <img src={article.cover} alt="" style={{ width:'100%', height:180, objectFit:'cover' }}/>
                  <div style={{ padding:'20px', flex:1, display:'flex', flexDirection:'column' }}>
                    <Badge variant={CAT_COLORS[article.category]||'muted'} style={{ width:'fit-content', marginBottom:10 }}>{article.category}</Badge>
                    <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1rem', color:'var(--dark)', lineHeight:1.5, marginBottom:10, flex:1 }}>{article.title}</h3>
                    <p style={{ fontSize:'0.8125rem', color:'var(--muted)', lineHeight:1.6, marginBottom:14 }}>{article.excerpt.slice(0,100)}...</p>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--muted-light)' }}>
                      <span><Clock size={11} style={{ verticalAlign:'middle' }}/> {article.readTime} mnt</span>
                      <span>{formatDate(article.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
