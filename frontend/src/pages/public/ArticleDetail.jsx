import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Share2, BookOpen, Twitter, Linkedin } from 'lucide-react'
import Badge from '@/components/common/Badge'

const MOCK = {
  'tips-lolos-interview': {
    title:'10 Tips Ampuh Lolos Interview Kerja di Perusahaan Top',
    category:'Interview',
    readTime:5,
    createdAt:'2024-12-10',
    cover:'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=85',
    author:{ name:'Rizki Ramadhan', role:'Career Coach · 10 tahun pengalaman', avatar:'https://i.pravatar.cc/100?img=12' },
    content:`Interview kerja bisa menjadi momen yang menegangkan, namun dengan persiapan yang tepat, Anda bisa tampil percaya diri dan meninggalkan kesan positif.

**1. Riset Perusahaan Secara Mendalam**

Sebelum interview, luangkan waktu untuk memahami bisnis, nilai-nilai, produk, dan budaya perusahaan yang Anda lamar. Kunjungi website mereka, baca berita terkini, dan pelajari profil LinkedIn perusahaan tersebut.

**2. Gunakan Metode STAR untuk Menjawab Pertanyaan Behavioral**

Ketika ditanya "Ceritakan pengalaman saat Anda menghadapi konflik di tempat kerja", gunakan format STAR:
- **Situation**: Jelaskan konteks/situasi
- **Task**: Apa tugas atau tanggung jawab Anda?
- **Action**: Apa tindakan konkret yang Anda ambil?
- **Result**: Apa hasilnya?

**3. Persiapkan Pertanyaan untuk Interviewer**

Interview adalah proses dua arah. Siapkan 3-5 pertanyaan yang menunjukkan ketertarikan Anda, seperti:
- "Bagaimana tim ini mengukur kesuksesan?"
- "Apa tantangan terbesar yang dihadapi tim saat ini?"

**4. Perhatikan Bahasa Tubuh**

Jabat tangan yang kuat, kontak mata yang natural, dan postur tegap menunjukkan kepercayaan diri. Hindari menyilangkan lengan atau memainkan rambut.

**5. Tiba Lebih Awal**

Datanglah 10-15 menit sebelum jadwal interview. Ini memberi Anda waktu untuk menenangkan diri dan menunjukkan profesionalisme.

**6. Berpakaian Profesional**

Dress code "business casual" adalah standar aman. Lebih baik overdressed daripada underdressed. Pastikan pakaian bersih, rapi, dan nyaman.

**7. Latih Jawaban untuk Pertanyaan Umum**

Praktikkan jawaban untuk pertanyaan seperti:
- "Ceritakan tentang diri Anda"
- "Apa kelebihan dan kekurangan Anda?"
- "Mengapa Anda ingin bergabung dengan perusahaan ini?"

**8. Bawa Dokumen Lengkap**

Siapkan beberapa salinan CV, portofolio (jika ada), sertifikat relevan, dan dokumen lain yang mungkin diminta.

**9. Follow-up Setelah Interview**

Kirim email ucapan terima kasih dalam 24 jam setelah interview. Ini jarang dilakukan dan bisa membedakan Anda dari kandidat lain.

**10. Kelola Kegelisahan dengan Teknik Pernapasan**

Tarik napas dalam-dalam sebelum masuk ruang interview. Ingat: interviewer ingin Anda berhasil — mereka tidak mencari alasan untuk menolak Anda.

---

Persiapan yang matang adalah kunci utama. Dengan mengikuti tips di atas, Anda akan jauh lebih siap menghadapi interview apapun.`,
  }
}

const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })

function renderContent(content) {
  return content.split('\n\n').map((para, i) => {
    if (para.startsWith('**') && para.endsWith('**')) {
      return <h3 key={i} style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1.1rem', marginTop:28, marginBottom:10 }}>{para.replace(/\*\*/g,'')}</h3>
    }
    if (para.startsWith('---')) {
      return <hr key={i} style={{ border:'none', borderTop:'2px solid var(--border-light)', margin:'28px 0' }}/>
    }
    if (para.includes('\n-')) {
      const [title, ...items] = para.split('\n')
      return (
        <div key={i}>
          {title && <p style={{ color:'var(--dark)', lineHeight:1.85, marginBottom:8 }}>{title.replace(/\*\*/g,'')}</p>}
          <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:6, paddingLeft:8 }}>
            {items.map((item,j)=>(
              <li key={j} style={{ display:'flex', gap:8, color:'var(--dark)', lineHeight:1.7, fontSize:'0.9375rem' }}>
                <span style={{ color:'var(--primary)', flexShrink:0 }}>•</span>
                <span dangerouslySetInnerHTML={{ __html:item.replace(/^- /,'').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>') }}/>
              </li>
            ))}
          </ul>
        </div>
      )
    }
    return <p key={i} style={{ color:'var(--dark)', lineHeight:1.85, marginBottom:4, fontSize:'0.9375rem' }} dangerouslySetInnerHTML={{ __html:para.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>') }}/>
  })
}

const RELATED = [
  { slug:'gaji-negosiasi', title:'Cara Negosiasi Gaji yang Efektif', category:'Gaji & Negosiasi', readTime:7 },
  { slug:'cv-ats-friendly', title:'Cara Membuat CV yang Lolos ATS', category:'Resume', readTime:6 },
  { slug:'linkedin-profile', title:'Optimalkan Profil LinkedIn Anda', category:'Tips Karir', readTime:4 },
]

export default function ArticleDetail() {
  const { slug } = useParams()
  const article = MOCK[slug] || MOCK['tips-lolos-interview']

  const share = (platform) => {
    const url = window.location.href
    if (platform==='twitter') window.open(`https://twitter.com/intent/tweet?url=${url}&text=${article.title}`)
    else if (platform==='linkedin') window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`)
    else navigator.clipboard.writeText(url)
  }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', paddingBottom:60 }}>
      <div className="container" style={{ padding:'28px var(--space-6)', maxWidth:900 }}>
        <Link to="/articles" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--muted)', textDecoration:'none', fontSize:'0.875rem', marginBottom:20 }}>
          <ArrowLeft size={14}/> Kembali ke Artikel
        </Link>

        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
          {/* Header */}
<div style={{ marginBottom:24 }}>
  <Badge variant="primary" style={{ marginBottom:14 }}>{article.category}</Badge>
  <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'clamp(1.5rem,3vw,2.25rem)', fontWeight:800, lineHeight:1.3, marginBottom:16 }}>
    {article.title}
  </h1>
  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      {article.author.avatar && <img src={article.author.avatar} alt="" style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover' }}/>}
      <div>
        <p style={{ fontWeight:700, fontSize:'0.875rem' }}>{article.author.name}</p>
        <p style={{ fontSize:'0.75rem', color:'var(--muted)' }}>{article.author.role}</p>
      </div>
    </div>
   <div style={{ display:'flex', alignItems:'center', gap:14, fontSize:'0.8125rem', color:'var(--muted-light)' }}>
  <span style={{ display:'flex', alignItems:'center', gap:4 }}>
    <Clock size={12}/> {article.readTime} menit baca
  </span>
  <span>·</span>
  <span>{formatDate(article.createdAt)}</span>
</div>
  </div>
</div>

          {/* Cover Image */}
          <img src={article.cover} alt={article.title} style={{ width:'100%', borderRadius:'var(--radius-lg)', maxHeight:420, objectFit:'cover', marginBottom:36 }}/>

          {/* Content */}
          <div className="article-content-grid">
  <article>
    {renderContent(article.content)}
  </article>

            {/* Sticky sidebar */}
              <div className="article-sidebar" style={{ position:'sticky', top:88 }}>
              <div className="card card-body" style={{ marginBottom:16 }}>
                <p style={{ fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:12, fontSize:'0.9375rem' }}>Bagikan Artikel</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <button onClick={()=>share('twitter')} style={{ display:'flex', gap:10, alignItems:'center', padding:'9px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', background:'none', cursor:'pointer', fontSize:'0.875rem', fontWeight:600, color:'#1DA1F2' }}>
                    <Twitter size={16}/> Twitter
                  </button>
                  <button onClick={()=>share('linkedin')} style={{ display:'flex', gap:10, alignItems:'center', padding:'9px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', background:'none', cursor:'pointer', fontSize:'0.875rem', fontWeight:600, color:'#0A66C2' }}>
                    <Linkedin size={16}/> LinkedIn
                  </button>
                  <button onClick={()=>share('copy')} style={{ display:'flex', gap:10, alignItems:'center', padding:'9px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', background:'none', cursor:'pointer', fontSize:'0.875rem', fontWeight:600, color:'var(--muted)' }}>
                    <Share2 size={16}/> Salin Link
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          <div style={{ marginTop:48 }}>
            <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1.25rem', marginBottom:20 }}>Artikel Terkait</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:20 }}>
              {RELATED.map(a=>(
                <Link key={a.slug} to={`/articles/${a.slug}`} style={{ textDecoration:'none' }}>
                  <motion.div whileHover={{ y:-3 }} className="card card-body">
                    <Badge variant="primary" style={{ marginBottom:10, width:'fit-content' }}>{a.category}</Badge>
                    <p style={{ fontFamily:'var(--font-heading)', fontWeight:700, color:'var(--dark)', lineHeight:1.5, marginBottom:8 }}>{a.title}</p>
                    <p style={{ fontSize:'0.8125rem', color:'var(--muted)' }}><Clock size={11} style={{ verticalAlign:'middle' }}/> {a.readTime} menit baca</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
