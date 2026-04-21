import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock } from 'lucide-react'

// Consistent elegant color palette
const accent = '#4FC3F7' 
const accentDark = '#0288D1' 
const accentLight = '#E1F5FE' 
const textDark = '#0F172A' 
const textMuted = '#475569' 

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

export default function Privacy() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      padding: '56px 24px 80px',
      fontFamily: '"Inter", sans-serif',
      color: textDark
    }}>
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

        {/* Hero */}
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
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)`, filter: 'blur(30px)' }} />
          <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)`, filter: 'blur(20px)' }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Lock size={24} style={{ color: '#fff', strokeWidth: 1.5 }} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}>
                AddJob Legal
              </span>
            </div>
            <h1 style={{ fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: '#fff', marginBottom: 12, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
              Kebijakan Privasi
              <span style={{ display: 'block', color: accentLight, fontWeight: 400, marginTop: 4 }}>
                Layanan AddJob
              </span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 300 }}>
              Terakhir diperbarui: 25 April 2026
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
          PT. Global Adaptasi Mandiri berkomitmen untuk melindungi privasi pengguna situs <strong>https://globaladaptasi.com</strong>. Dengan menggunakan situs ini, Anda dianggap telah membaca dan menyetujui Kebijakan Privasi ini.
        </motion.div>

        <Section number="1" title="Komitmen Kami terhadap Privasi Anda" index={0}>
          <p>PT. Global Adaptasi Mandiri berkomitmen untuk melindungi privasi pengguna. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi pengguna situs <strong>https://globaladaptasi.com</strong>.</p>
        </Section>

        <Section number="2" title="Informasi yang Kami Kumpulkan" index={1}>
          <p>Kami dapat mengumpulkan informasi berikut:</p>
          <ul style={styledList}>
            <Li>Nama lengkap</Li>
            <Li>Alamat email</Li>
            <Li>Nomor telepon</Li>
            <Li>Nama perusahaan</Li>
            <Li>Informasi akun login (jika ada)</Li>
            <Li>Data penggunaan website (IP address, browser, device)</Li>
            <Li>Informasi lain yang Anda kirimkan melalui form</Li>
          </ul>
        </Section>

        <Section number="3" title="Cara Kami Menggunakan Informasi" index={2}>
          <p>Informasi yang kami kumpulkan digunakan untuk:</p>
          <ul style={styledList}>
            <Li>Menyediakan layanan website</Li>
            <Li>Menghubungi pengguna terkait layanan</Li>
            <Li>Mengirim informasi produk atau layanan</Li>
            <Li>Meningkatkan kualitas website</Li>
            <Li>Keperluan analisis dan pengembangan</Li>
            <Li>Kepatuhan hukum</Li>
          </ul>
        </Section>

        <Section number="4" title="Penggunaan Cookies" index={3}>
          <p>Website ini dapat menggunakan cookies untuk:</p>
          <ul style={styledList}>
            <Li>Menyimpan preferensi pengguna</Li>
            <Li>Menyimpan preferensi partner / mitra perusahaan</Li>
            <Li>Meningkatkan pengalaman pengguna</Li>
          </ul>
          <p style={{ marginTop: 16 }}>Anda dapat menonaktifkan cookies melalui pengaturan browser.</p>
        </Section>

        <Section number="5" title="Berbagi Informasi kepada Pihak Ketiga" index={4}>
          <p>Kami tidak menjual data pribadi pengguna. Kami dapat membagikan informasi kepada:</p>
          <ul style={styledList}>
            <Li>Penyedia layanan hosting</Li>
            <Li>Mitra layanan yang diperlukan</Li>
            <Li>Otoritas hukum jika diwajibkan</Li>
          </ul>
        </Section>

        <Section number="6" title="Keamanan Data" index={5}>
          <p>Kami menggunakan langkah-langkah teknis dan organisasi untuk melindungi data pengguna dari akses tidak sah, kehilangan, atau penyalahgunaan.</p>
        </Section>

        <Section number="7" title="Penyimpanan Data" index={6}>
          <p>Kami menyimpan data hanya selama diperlukan untuk:</p>
          <ul style={styledList}>
            <Li>Menyediakan layanan</Li>
            <Li>Memenuhi kewajiban hukum</Li>
            <Li>Keperluan bisnis internal</Li>
          </ul>
        </Section>

        <Section number="8" title="Hak Pengguna" index={7}>
          <p>Anda memiliki hak untuk:</p>
          <ul style={styledList}>
            <Li>Mengakses data pribadi</Li>
            <Li>Memperbarui data</Li>
            <Li>Menghapus data</Li>
            <Li>Menarik persetujuan</Li>
            <Li>Menolak komunikasi pemasaran</Li>
          </ul>
        </Section>

        <Section number="9" title="Tautan ke Situs Pihak Ketiga" index={8}>
          <p>Website kami dapat berisi tautan ke situs lain. Kami tidak bertanggung jawab atas kebijakan privasi situs tersebut.</p>
        </Section>

        <Section number="10" title="Perubahan Kebijakan Privasi" index={9}>
          <p>Kami dapat memperbarui kebijakan ini sewaktu-waktu. Perubahan akan ditampilkan di halaman ini.</p>
        </Section>

        <Section number="11" title="Hubungi Kami" index={10}>
          <p>Jika ada pertanyaan mengenai Kebijakan Privasi ini, silakan hubungi:</p>
          <ul style={styledList}>
            <Li>Email: <a href="mailto:info@globaladaptasi.com" style={{ color: accentDark, fontWeight: 500, textDecoration: 'none' }}>info@globaladaptasi.com</a></Li>
            <Li>Website: <a href="https://globaladaptasi.com" target="_blank" rel="noreferrer" style={{ color: accentDark, fontWeight: 500, textDecoration: 'none' }}>https://globaladaptasi.com</a></Li>
          </ul>
        </Section>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          style={{
            background: `linear-gradient(135deg, ${textDark}, #1e293b)`,
            borderRadius: 20, padding: '40px', marginTop: 16,
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`, opacity: 0.15, filter: 'blur(30px)' }} />
          <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: '1.25rem', color: '#fff', margin: '0 0 12px 0' }}>
            PT. Global Adaptasi Mandiri
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
            Kebijakan ini berlaku untuk seluruh pengguna platform AddJob. Dengan terus menggunakan layanan kami, Anda menyetujui ketentuan yang berlaku.
          </p>
          <div style={{ marginTop: 24, display: 'inline-block', padding: '8px 20px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em' }}>
            globaladaptasi.com · AddJob
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}