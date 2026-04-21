import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield } from 'lucide-react'

// Updated elegant color palette with #4FC3F7 as the dominant color
const accent = '#4FC3F7' 
const accentDark = '#0288D1' // Professional deep blue for gradients
const accentLight = '#E1F5FE' // Soft, elegant tint for backgrounds
const textDark = '#0F172A' // Sharper dark slate for professional contrast
const textMuted = '#475569' // Refined gray for readable body text

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] } }),
}

const Li = ({ children }) => (
  <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0, marginTop: 9, boxShadow: `0 0 8px ${accent}` }} />
    <span style={{ lineHeight: 1.6 }}>{children}</span>
  </li>
)

const styledList = { paddingLeft: 0, listStyle: 'none', marginTop: 12 }

const Section = ({ number, title, children, index }) => (
  <motion.div
    custom={index}
    initial="hidden"
    animate="visible"
    variants={sectionVariants}
    style={{
      marginBottom: 24,
      padding: '32px 36px',
      borderRadius: 16,
      background: '#ffffff',
      border: '1px solid rgba(226, 232, 240, 0.6)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div style={{
      position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
      background: `linear-gradient(180deg, ${accent}, ${accentDark})`,
      borderRadius: '4px 0 0 4px',
    }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: accentLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 600, fontSize: '0.85rem', color: accentDark,
        fontFamily: '"Inter", sans-serif', flexShrink: 0,
      }}>
        {number}
      </div>
      <h2 style={{
        fontFamily: '"Inter", sans-serif',
        fontWeight: 600, fontSize: '1.15rem', color: textDark,
        letterSpacing: '-0.01em', margin: 0,
      }}>
        {title}
      </h2>
    </div>
    <div style={{ color: textMuted, fontSize: '0.95rem', lineHeight: 1.75, paddingLeft: 50 }}>
      {children}
    </div>
  </motion.div>
)

export default function Terms() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC', 
      padding: '56px 24px 80px',
      fontFamily: '"Inter", sans-serif',
      color: textDark
    }}>
      {/* Professional, clean sans-serif font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');`}</style>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{ maxWidth: 800, margin: '0 auto' }}>

        <Link to="/register" target="_blank" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          color: textMuted, fontWeight: 500, fontSize: '0.875rem',
          textDecoration: 'none', marginBottom: 36,
          transition: 'color 0.2s',
        }}>
          <ArrowLeft size={16} /> Kembali ke Registrasi
        </Link>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}
          style={{
            background: `linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%)`,
            borderRadius: 24, padding: '56px 48px', marginBottom: 40,
            position: 'relative', overflow: 'hidden',
            boxShadow: `0 12px 40px rgba(79, 195, 247, 0.25)`,
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          {/* Elegant Glow Textures */}
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)`, filter: 'blur(30px)' }} />
          <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)`, filter: 'blur(20px)' }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Shield size={24} style={{ color: '#fff', strokeWidth: 1.5 }} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}>
                AddJob Legal
              </span>
            </div>
            <h1 style={{ fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: '#fff', marginBottom: 12, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
              Syarat dan Ketentuan
              <span style={{ display: 'block', color: accentLight, fontWeight: 400, marginTop: 4 }}>
                Layanan AddJob
              </span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 300 }}>
              Terakhir diperbarui: 13 April 2026
            </p>
          </div>
        </motion.div>

        {/* Intro callout */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{
          padding: '24px 32px', borderRadius: 16,
          background: '#ffffff', borderLeft: `4px solid ${accent}`,
          marginBottom: 40, color: textDark, fontSize: '0.95rem',
          lineHeight: 1.7, fontWeight: 400,
          boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
        }}>
          Dengan mengakses dan/atau menggunakan platform AddJob, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat secara hukum oleh Syarat dan Ketentuan ini. Apabila Anda tidak menyetujui sebagian atau seluruh isi Syarat ini, Anda wajib untuk tidak menggunakan Layanan.
        </motion.div>

        <Section number="1" title="DEFINISI" index={0}>
          <p>Kecuali ditentukan lain, istilah berikut memiliki arti sebagai berikut:</p>
          <ul style={styledList}>
            <Li><strong>"AddJob"</strong>: platform digital yang menyediakan layanan rekrutmen, job portal, dan kemitraan bisnis.</Li>
            <Li><strong>"Pengguna"</strong>: setiap individu atau badan hukum yang mengakses atau menggunakan Layanan.</Li>
            <Li><strong>"Akun"</strong>: akun yang dibuat oleh Pengguna untuk mengakses Layanan.</Li>
            <Li><strong>"Konten"</strong>: seluruh data, informasi, teks, gambar, dokumen, termasuk data kandidat atau lowongan kerja yang diunggah ke dalam platform.</Li>
            <Li><strong>"Mitra"</strong>: pihak yang bekerja sama dengan AddJob dalam bentuk kemitraan, termasuk namun tidak terbatas pada sales mitra.</Li>
          </ul>
        </Section>

        <Section number="2" title="RUANG LINGKUP LAYANAN" index={1}>
          <p>AddJob menyediakan layanan termasuk namun tidak terbatas pada:</p>
          <ul style={styledList}>
            <Li>Publikasi lowongan kerja</Li>
            <Li>Akses dan pengelolaan database kandidat</Li>
            <Li>Layanan rekrutmen dan talent sourcing</Li>
            <Li>Program kemitraan berbasis komisi</Li>
          </ul>
          <p style={{ marginTop: 16 }}>AddJob berhak untuk menambah, mengubah, atau menghentikan sebagian atau seluruh Layanan sewaktu-waktu tanpa pemberitahuan terlebih dahulu.</p>
        </Section>

        <Section number="3" title="PERSYARATAN PENGGUNA" index={2}>
          <ul style={styledList}>
            <Li>Pengguna wajib berusia minimal 18 (delapan belas) tahun atau telah memiliki kapasitas hukum.</Li>
            <Li>Pengguna wajib memberikan data yang benar, akurat, dan terkini.</Li>
            <Li>Dalam hal Pengguna bertindak untuk dan atas nama badan usaha, Pengguna menjamin memiliki kewenangan yang sah.</Li>
          </ul>
        </Section>

        <Section number="4" title="AKUN DAN KEAMANAN" index={3}>
          <ul style={styledList}>
            <Li>Pengguna bertanggung jawab penuh atas keamanan Akun, termasuk username dan password.</Li>
            <Li>Pengguna dilarang membagikan akses Akun kepada pihak lain atau menggunakan Akun pihak lain tanpa izin.</Li>
            <Li>Segala aktivitas yang terjadi dalam Akun menjadi tanggung jawab Pengguna sepenuhnya.</Li>
            <Li>AddJob berhak menangguhkan atau menghapus Akun tanpa pemberitahuan apabila ditemukan pelanggaran terhadap Syarat ini.</Li>
          </ul>
        </Section>

        <Section number="5" title="PENGGUNAAN LAYANAN" index={4}>
          <p>Pengguna wajib menggunakan Layanan secara sah dan tidak melanggar peraturan perundang-undangan yang berlaku di Indonesia. Pengguna dilarang:</p>
          <ul style={styledList}>
            <Li>Menggunakan Layanan untuk kegiatan ilegal, penipuan, atau manipulasi data</Li>
            <Li>Mengakses, mengambil, atau menyalin data tanpa izin (scraping, crawling, dll)</Li>
            <Li>Mengembangkan layanan sejenis atau kompetitor dengan memanfaatkan platform AddJob</Li>
            <Li>Menyebarkan spam, malware, atau aktivitas yang mengganggu sistem</Li>
          </ul>
        </Section>

        <Section number="6" title="KONTEN DAN DATA" index={5}>
          <ul style={styledList}>
            <Li>Pengguna bertanggung jawab penuh atas seluruh Konten yang diunggah.</Li>
            <Li>Pengguna menjamin bahwa Konten tidak melanggar hukum, tidak melanggar hak pihak ketiga, dan tidak mengandung unsur penipuan atau informasi palsu.</Li>
            <Li>Dengan mengunggah Konten, Pengguna memberikan hak non-eksklusif kepada AddJob untuk menyimpan, mengolah, menampilkan, dan menggunakan Konten untuk keperluan operasional Layanan.</Li>
            <Li>AddJob tidak bertanggung jawab atas keakuratan, kelengkapan, maupun legalitas Konten yang diunggah oleh Pengguna.</Li>
          </ul>
        </Section>

        <Section number="7" title="HUBUNGAN KETENAGAKERJAAN" index={6}>
          <p>AddJob hanya bertindak sebagai platform perantara. AddJob tidak menjadi pihak dalam hubungan kerja antara perusahaan dan kandidat. Segala bentuk hubungan kerja, kontrak, maupun sengketa menjadi tanggung jawab masing-masing pihak terkait.</p>
        </Section>

        <Section number="8" title="KEMITRAAN (SALES MITRA)" index={7}>
          <ul style={styledList}>
            <Li>Ketentuan komisi, target, dan skema kerja sama akan diatur dalam perjanjian terpisah.</Li>
            <Li>Mitra dilarang memberikan informasi yang tidak benar kepada klien atau melakukan tindakan yang merugikan reputasi AddJob.</Li>
            <Li>AddJob berhak menghentikan kemitraan secara sepihak apabila terjadi pelanggaran.</Li>
          </ul>
        </Section>

        <Section number="9" title="BIAYA DAN PEMBAYARAN" index={8}>
          <ul style={styledList}>
            <Li>Pengguna wajib membayar biaya layanan sesuai ketentuan yang berlaku.</Li>
            <Li>Seluruh pembayaran bersifat final dan tidak dapat dikembalikan (non-refundable), kecuali ditentukan lain secara tertulis.</Li>
            <Li>AddJob berhak mengubah struktur biaya sewaktu-waktu.</Li>
          </ul>
        </Section>

        <Section number="10" title="HAK KEKAYAAN INTELEKTUAL" index={9}>
          <p>Seluruh hak kekayaan intelektual atas sistem, teknologi, desain, logo dan merek AddJob merupakan milik AddJob dan dilindungi oleh hukum. Pengguna dilarang menggunakan tanpa izin tertulis.</p>
        </Section>

        <Section number="11" title="BATASAN TANGGUNG JAWAB" index={10}>
          <ul style={styledList}>
            <Li>Layanan disediakan "sebagaimana adanya" (as is).</Li>
            <Li>AddJob tidak menjamin ketersediaan layanan tanpa gangguan, keakuratan data kandidat, atau keberhasilan proses rekrutmen.</Li>
            <Li>AddJob tidak bertanggung jawab atas kerugian bisnis, kehilangan data, kesalahan keputusan rekrutmen, atau kerugian tidak langsung maupun konsekuensial.</Li>
          </ul>
        </Section>

        <Section number="12" title="GANTI RUGI (INDEMNITY)" index={11}>
          <p>Pengguna setuju untuk membebaskan AddJob dari segala tuntutan, kerugian, atau biaya hukum yang timbul akibat pelanggaran Syarat ini, penggunaan Layanan secara tidak sah, atau pelanggaran terhadap hak pihak ketiga.</p>
        </Section>

        <Section number="13" title="PERUBAHAN SYARAT" index={12}>
          <p>AddJob berhak mengubah Syarat ini sewaktu-waktu. Perubahan akan berlaku sejak dipublikasikan. Penggunaan Layanan setelah perubahan dianggap sebagai persetujuan.</p>
        </Section>

        <Section number="14" title="PENGHENTIAN LAYANAN" index={13}>
          <ul style={styledList}>
            <Li>Pengguna dapat menghentikan penggunaan kapan saja.</Li>
            <Li>AddJob berhak menangguhkan, membatasi, atau mengakhiri akses Pengguna tanpa pemberitahuan apabila terjadi pelanggaran.</Li>
            <Li>AddJob berhak menghapus data setelah penghentian akun.</Li>
          </ul>
        </Section>

        <Section number="15" title="HUKUM YANG BERLAKU" index={14}>
          <p>Syarat ini tunduk pada hukum Republik Indonesia. Segala sengketa akan diselesaikan terlebih dahulu secara musyawarah. Apabila tidak tercapai kesepakatan, sengketa akan diselesaikan melalui Pengadilan Negeri sesuai domisili hukum AddJob.</p>
        </Section>

        <Section number="16" title="KETENTUAN PENUTUP" index={15}>
          <p>Apabila terdapat ketentuan dalam Syarat ini yang dianggap tidak sah atau tidak dapat diberlakukan, maka ketentuan lainnya tetap berlaku sepenuhnya.</p>
        </Section>

        {/* Footer agreement */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
          style={{
            background: `linear-gradient(135deg, ${textDark}, #1e293b)`,
            borderRadius: 20, padding: '40px', marginTop: 16,
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`, opacity: 0.15, filter: 'blur(30px)' }} />
          <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: '1.25rem', color: '#fff', margin: '0 0 12px 0' }}>
            Persetujuan
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
            Dengan menggunakan Layanan AddJob, Pengguna menyatakan telah membaca, memahami, dan menyetujui seluruh isi Syarat dan Ketentuan ini.
          </p>
          <div style={{ marginTop: 24, display: 'inline-block', padding: '8px 20px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em' }}>
            globaladaptasi.com · AddJob
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}