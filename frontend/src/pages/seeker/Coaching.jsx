import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, MessageSquare, TrendingUp, Star, Clock, CheckCircle2, Calendar, ArrowRight } from 'lucide-react'
import Badge from '@/components/common/Badge'
import Modal from '@/components/common/Modal'

const SERVICES = [
  {
    icon:'📄', color:'#2196F3', bg:'#E3F2FD',
    title:'Review CV', desc:'CV Anda dianalisis dan diperbaiki oleh HR profesional berpengalaman 5+ tahun. Dapatkan feedback mendalam dan CV siap bersaing.',
    duration:'2-3 hari kerja', price:'Rp 99.000', badge:'Populer', badgeVariant:'warning',
    features:['Analisis ATS compatibility','Feedback tertulis lengkap','1x revisi gratis','Template CV premium'],
  },
  {
    icon:'🎤', color:'#4CAF50', bg:'#E8F5E9',
    title:'Mock Interview', desc:'Latih wawancara 1-on-1 dengan recruiter profesional dari perusahaan top Indonesia. Dapatkan feedback real-time.',
    duration:'60 menit', price:'Rp 149.000', badge:'Best Value', badgeVariant:'success',
    features:['Simulasi interview realistis','Feedback langsung','Tips metode STAR','Recording sesi'],
  },
  {
    icon:'🎯', color:'#9C27B0', bg:'#F3E5F5',
    title:'Konsultasi Karir', desc:'Diskusi personal tentang arah karir, pilihan industri, dan strategi pengembangan diri bersama career coach bersertifikat.',
    duration:'90 menit', price:'Rp 199.000', badge:'Premium', badgeVariant:'primary',
    features:['Career mapping personal','Industry insights','Action plan 3 bulan','Follow-up session'],
  },
  {
    icon:'💼', color:'#FF9800', bg:'#FFF8E1',
    title:'Optimasi LinkedIn', desc:'Tingkatkan visibilitas profil LinkedIn Anda agar mudah ditemukan recruiter dan buka lebih banyak peluang karir.',
    duration:'1-2 hari kerja', price:'Rp 79.000', badge:'', badgeVariant:'',
    features:['Optimasi headline & summary','Keyword research','Rekomendasi jaringan','Profile score 90+'],
  },
]

const TESTIMONIALS = [
  { name:'Andi Firmansyah', role:'Backend Dev @ Gojek', text:'Setelah review CV dan mock interview, saya berhasil diterima di Gojek dalam 3 minggu! Sangat worth it.', rating:5, avatar:'https://i.pravatar.cc/80?img=3' },
  { name:'Dewi Santika', role:'Marketing Mgr @ Tokopedia', text:'Konsultasi karir membantu saya pindah industri dari perbankan ke tech. Coach-nya sangat insightful!', rating:5, avatar:'https://i.pravatar.cc/80?img=5' },
  { name:'Reza Pratama', role:'Product Manager @ Shopee', text:'Review CV dari AddJob beda banget. Detail, actionable, dan hasilnya langsung terasa di tahap seleksi.', rating:5, avatar:'https://i.pravatar.cc/80?img=8' },
]

const container = { hidden:{}, show:{ transition:{ staggerChildren:0.1 } } }
const item = { hidden:{opacity:0,y:20}, show:{opacity:1,y:0} }

export default function Coaching() {
  const [selectedService, setSelectedService] = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const handleBook = () => {
    // Simulate booking
    setTimeout(() => { setBookingSuccess(true) }, 1000)
  }

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:36 }}>
        <h1 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.75rem', marginBottom:8 }}>Bimbingan Karir</h1>
        <p style={{ color:'var(--muted)', maxWidth:560, lineHeight:1.7 }}>
          Tingkatkan peluang kerja Anda dengan bimbingan dari para profesional berpengalaman di industri terkemuka.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:40, background:'var(--gradient-hero)', borderRadius:'var(--radius-lg)', padding:'24px 28px' }}>
        {[{val:'2,500+', label:'Klien Terlayani'},{val:'98%', label:'Tingkat Kepuasan'},{val:'4.9/5', label:'Rating Rata-rata'},{val:'72 Jam', label:'Respon Pertama'}].map(s=>(
          <div key={s.label} style={{ textAlign:'center' }}>
            <p style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.75rem', color:'#fff' }}>{s.val}</p>
            <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.8125rem' }}>{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Services */}
      <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1.25rem', marginBottom:20 }}>Pilih Layanan</h2>
      <motion.div variants={container} initial="hidden" animate="show"
        style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20, marginBottom:48 }}>
        {SERVICES.map(service => (
          <motion.div key={service.title} variants={item} whileHover={{ y:-4 }} className="coach-card"
            style={{ cursor:'pointer', position:'relative' }}
            onClick={()=>setSelectedService(service)}>
            {service.badge && (
              <div style={{ position:'absolute', top:16, right:16 }}>
                <Badge variant={service.badgeVariant}>{service.badge}</Badge>
              </div>
            )}
            <div className="coach-card__icon" style={{ background:service.bg, color:service.color, fontSize:'1.75rem' }}>
              {service.icon}
            </div>
            <div>
              <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1.125rem', marginBottom:8 }}>{service.title}</h3>
              <p style={{ color:'var(--muted)', fontSize:'0.875rem', lineHeight:1.7, marginBottom:16 }}>{service.desc}</p>
            </div>
            <div style={{ display:'flex', gap:14, fontSize:'0.8125rem', color:'var(--muted)', marginBottom:16 }}>
              <span><Clock size={13} style={{ verticalAlign:'middle' }}/> {service.duration}</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20 }}>
              {service.features.map(f=>(
                <div key={f} style={{ display:'flex', gap:8, alignItems:'center', fontSize:'0.875rem', color:'var(--dark)' }}>
                  <CheckCircle2 size={14} style={{ color:'var(--success)', flexShrink:0 }}/>{f}
                </div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'auto' }}>
              <p style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.25rem', color:'var(--primary)' }}>{service.price}</p>
              <button className="btn btn--primary btn--sm" onClick={(e)=>{e.stopPropagation(); setSelectedService(service)}}>
                Daftar Sekarang <ArrowRight size={13}/>
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Testimonials */}
      <div style={{ marginBottom:48 }}>
        <h2 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1.25rem', marginBottom:20 }}>Kata Mereka</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {TESTIMONIALS.map(t=>(
            <motion.div key={t.name} className="card card-body" whileHover={{ y:-2 }}>
              <div style={{ display:'flex', gap:2, marginBottom:12 }}>
                {Array(t.rating).fill('⭐').map((s,i)=><span key={i} style={{ fontSize:'0.9rem' }}>{s}</span>)}
              </div>
              <p style={{ color:'var(--dark)', fontSize:'0.9rem', lineHeight:1.7, marginBottom:16, fontStyle:'italic' }}>"{t.text}"</p>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <img src={t.avatar} alt="" style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover' }}/>
                <div>
                  <p style={{ fontWeight:700, fontSize:'0.875rem' }}>{t.name}</p>
                  <p style={{ fontSize:'0.75rem', color:'var(--muted)' }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background:'var(--gradient-dark)', borderRadius:'var(--radius-lg)', padding:'32px 36px', textAlign:'center' }}>
        <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.5rem', color:'#fff', marginBottom:10 }}>
          Masih Bingung Harus Mulai dari Mana?
        </h3>
        <p style={{ color:'rgba(255,255,255,0.8)', marginBottom:24 }}>
          Konsultasi gratis 15 menit dengan career advisor kami untuk menentukan layanan yang paling sesuai.
        </p>
        <button className="btn btn--secondary" onClick={()=>setSelectedService(SERVICES[2])}>
          Jadwalkan Konsultasi Gratis
        </button>
      </div>

      {/* Booking Modal */}
      <Modal isOpen={!!selectedService} onClose={()=>{setSelectedService(null);setBookingSuccess(false)}} title={bookingSuccess?undefined:`Daftar: ${selectedService?.title}`} size="md">
        {selectedService && !bookingSuccess && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ background:'var(--bg)', borderRadius:'var(--radius)', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ fontFamily:'var(--font-heading)', fontWeight:700 }}>{selectedService.title}</p>
                <p style={{ fontSize:'0.8125rem', color:'var(--muted)' }}><Clock size={12} style={{ verticalAlign:'middle' }}/> {selectedService.duration}</p>
              </div>
              <p style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.25rem', color:'var(--primary)' }}>{selectedService.price}</p>
            </div>

            <div className="form-group" style={{ margin:0 }}>
              <label className="form-label">Pilih Jadwal</label>
              <input type="datetime-local" className="form-input" min={new Date().toISOString().slice(0,16)}/>
            </div>

            <div className="form-group" style={{ margin:0 }}>
              <label className="form-label">Ceritakan Tujuan Anda</label>
              <textarea className="rich-textarea" rows={4} placeholder="Apa yang ingin Anda capai dari sesi ini?..."/>
            </div>

            <div className="alert alert--info">
              <p style={{ fontSize:'0.875rem' }}>Pembayaran akan dikonfirmasi melalui WhatsApp. Anda akan menerima link meeting 1 jam sebelum sesi.</p>
            </div>

            <button className="btn btn--primary btn--block btn--lg" onClick={handleBook}>
              Konfirmasi Pemesanan
            </button>
          </div>
        )}
        {bookingSuccess && (
          <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ width:72, height:72, background:'var(--success-light)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'var(--success)' }}>
              <CheckCircle2 size={36}/>
            </div>
            <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:800, marginBottom:10 }}>Pemesanan Berhasil!</h3>
            <p style={{ color:'var(--muted)', lineHeight:1.7, marginBottom:24 }}>
              Tim kami akan menghubungi Anda via WhatsApp dalam 1×24 jam untuk konfirmasi jadwal dan instruksi pembayaran.
            </p>
            <button className="btn btn--primary" onClick={()=>{setSelectedService(null);setBookingSuccess(false)}}>
              Selesai
            </button>
          </motion.div>
        )}
      </Modal>
    </div>
  )
}
