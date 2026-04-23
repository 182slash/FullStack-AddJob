import { useState, useEffect, useRef } from 'react'
import emailjs from '@emailjs/browser'
import jsPDF from 'jspdf'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Download, Copy, CheckCircle2 } from 'lucide-react'
import Badge from '@/components/common/Badge'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'

const EMAILJS_SERVICE_ID  = 'service_ypq7ppb'
const EMAILJS_TEMPLATE_ID = 'template_873ua62'
const EMAILJS_PUBLIC_KEY  = '8Ls_5CzgFmgwIi6dp'
const ADDJOB_EMAIL        = 'adaptasindonesia@gmail.com'

const PLANS = [
  {
    name: 'Free',
    key: 'free',
    icon: '🌱',
    price: 0,
    period: '/bulan',
    color: 'var(--muted)',
    badge: null,
    features: [
      '2 posting loker',
      '15 kandidat per loker',
      'Masa tayang 7 hari',
      'Dashboard sederhana',
      'Email support',
    ],
  },
  {
    name: 'Basic',
    key: 'basic',
    icon: '⚡',
    price: 149000,
    period: '/bulan',
    color: 'var(--primary)',
    badge: null,
    features: [
      '5 posting loker',
      '75 kandidat per loker',
      'Masa tayang 15 hari',
      'Dashboard sederhana',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    key: 'pro',
    icon: '🚀',
    price: 299000,
    period: '/bulan',
    color: 'var(--primary)',
    badge: 'Populer',
    badgeVariant: 'primary',
    features: [
      '10 posting loker',
      '300 kandidat per loker',
      'Masa tayang 30 hari',
      'Top Listing',
      'Push Notification',
      'Highlight Rekomendasi',
      'Prioritas support',
    ],
  },
  {
    name: 'Premium',
    key: 'premium',
    icon: '👑',
    price: 599000,
    period: '/bulan',
    color: '#FF9800',
    badge: 'Best Value',
    badgeVariant: 'warning',
    features: [
      '20 posting loker',
      'Unlimited kandidat',
      'Masa tayang 30 hari',
      'Top Listing',
      'Push Notification',
      'Highlight Rekomendasi',
      'Boost Algoritma',
      'Social Media Posting',
    ],
  },
]

const COMPARISON = [
  { feature: 'Posting Loker',           free: '2',      basic: '5',      pro: '10',     premium: '20'        },
  { feature: 'Daya Tampung Kandidat',   free: '15',     basic: '75',     pro: '300',    premium: 'Unlimited' },
  { feature: 'Masa Tayang',             free: '7 Hari', basic: '15 Hari',pro: '30 Hari',premium: '30 Hari'   },
  { feature: 'Top Listing',             free: false,    basic: false,    pro: true,     premium: true        },
  { feature: 'Push Notification',       free: false,    basic: false,    pro: true,     premium: true        },
  { feature: 'Hilight Rekomendasi',     free: false,    basic: false,    pro: true,     premium: true        },
  { feature: 'Boost Algoritma',         free: false,    basic: false,    pro: false,    premium: true        },
  { feature: 'Social Media Posting',    free: false,    basic: false,    pro: false,    premium: true        },
]

const BANK_INFO = {
  bankName: 'BCA',
  accountNumber: ' 0691921998',
  accountName: 'PT Adaptasi Global Indonesia',
}

const QRIS_PLACEHOLDER = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ADDJOB-PAYMENT-QRIS'

const formatCurrency = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const generateInvoiceNumber = (companyName) => {
  const initials = companyName
    .replace(/^(PT|CV|UD|PD|Firma)\s+/i, '')
    .split(/\s+/)
    .map(w => w[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 4)
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yy = String(now.getFullYear()).slice(2)
  const rand = String(Math.floor(1000 + Math.random() * 9000))
  return `${initials}${dd}${mm}${yy}${rand}`
}

const generateUniqueServiceFee = () => Math.floor(1000 + Math.random() * 9000)

const CellValue = ({ val }) => {
  if (val === true)  return <Check size={18} style={{ color: 'var(--success)', margin: '0 auto', display: 'block' }} />
  if (val === false) return <X size={18} style={{ color: '#ef4444', margin: '0 auto', display: 'block' }} />
  return <span style={{ fontSize: '0.875rem', color: 'var(--dark)' }}>{val}</span>
}

export default function Subscription() {
  const { user } = useAuth()
  const [billing, setBilling] = useState('monthly')
  const [companyName, setCompanyName] = useState('')

  // Modal state
  const [modalStep, setModalStep] = useState(null) // null | 'method' | 'payment' | 'done'
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState(null) // 'qris' | 'transfer'
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Invoice data — generated once per purchase flow
  const invoiceRef = useRef(null)

  const [currentPlan, setCurrentPlan] = useState(user?.plan || 'free')

useEffect(() => {
  api.get('/subscription/my-plan')
    .then(res => setCurrentPlan(res.data.data?.plan || 'free'))
    .catch(() => {})
}, [])

  const [companyEmail, setCompanyEmail] = useState('')

useEffect(() => {
  api.get('/companies/employer/me')
    .then(res => {
      setCompanyName(res.data.data?.name || 'Perusahaan Anda')
      setCompanyEmail(res.data.data?.email || '')
    })
    .catch(() => setCompanyName('Perusahaan Anda'))
}, [])

  const openModal = (plan) => {
    const serviceFee = generateUniqueServiceFee()
    const price = plan.price * (billing === 'yearly' ? 0.8 : 1)
    const ppn = Math.round(price * 0.11)
    const total = price + serviceFee + ppn
    const invoiceNumber = generateInvoiceNumber(companyName)

    invoiceRef.current = {
      companyName,
      companyEmail,
      plan: plan.name,
      price,
      serviceFee,
      ppn,
      total,
      invoiceNumber,
    }
    setSelectedPlan(plan)
    setPaymentMethod(null)
    setModalStep('method')
  }

  const closeModal = () => {
    setModalStep(null)
    setSelectedPlan(null)
    setPaymentMethod(null)
    setCopied(false)
    setSubmitting(false)
  }

  const handleSelectMethod = (method) => {
    setPaymentMethod(method)
    setModalStep('payment')
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSelesai = async () => {
  if (!inv) return
  setSubmitting(true)

  const orderDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  const templateParams = {
    to_email:       inv.companyEmail || ADDJOB_EMAIL,
    company_name:   inv.companyName,
    company_email:  inv.companyEmail || '-',
    plan:           inv.plan,
    payment_method: paymentMethod === 'qris' ? 'QRIS' : 'Transfer Bank (BCA)',
    price:          formatCurrency(inv.price),
    service_fee:    String(inv.serviceFee),
    ppn:            formatCurrency(inv.ppn),
    total:          formatCurrency(inv.total),
    invoice_number: inv.invoiceNumber,
    order_date:     orderDate,
  }

  try {
    console.log('=== EMAILJS DEBUG ===')
    console.log('inv:', inv)
    console.log('templateParams:', templateParams)
    console.log('companyEmail:', inv.companyEmail)
    console.log('user.email:', user?.email)

    // Always send to AddJob first as track record
    const res1 = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      ...templateParams,
      to_email: ADDJOB_EMAIL,
    }, EMAILJS_PUBLIC_KEY)
    console.log('Email to AddJob result:', res1)

    // Still call backend to update plan
    
  } catch (err) {
    console.error('=== EMAILJS ERROR ===', err)
  }

  setSubmitting(false)
  setModalStep('done')
}

  const handleDownloadInvoice = () => {
    const inv = invoiceRef.current
    if (!inv) return

    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pw = doc.internal.pageSize.getWidth()
    const margin = 48

    // ── Header background
    doc.setFillColor(26, 26, 46)
    doc.rect(0, 0, pw, 80, 'F')

    // ── Blue accent line
    doc.setFillColor(79, 195, 247)
    doc.rect(0, 80, pw, 4, 'F')

    // ── Logo text
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.setTextColor(79, 195, 247)
    doc.text('AddJob', margin, 44)

    // ── Header subtitle
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(144, 164, 174)
    doc.text('INVOICE PEMBELIAN PAKET', margin, 62)

    // ── Invoice number top right
    doc.setFontSize(9)
    doc.setTextColor(144, 164, 174)
    doc.text(`No. ${inv.invoiceNumber}`, pw - margin, 44, { align: 'right' })
    doc.text(new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }), pw - margin, 60, { align: 'right' })

    // ── Status banner
    doc.setFillColor(227, 249, 255)
    doc.roundedRect(margin, 100, pw - margin * 2, 32, 4, 4, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(2, 136, 209)
    doc.text('Pesanan dalam tahap Verifikasi', margin + 12, 121)

    // ── Section: Detail Tagihan
    let y = 168
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(79, 195, 247)
    doc.text('DETAIL TAGIHAN', margin, y)

    y += 14
    doc.setFillColor(245, 247, 250)
    doc.roundedRect(margin, y, pw - margin * 2, 160, 6, 6, 'F')

    const rows = [
      ['Nama Perusahaan', inv.companyName],
      ['Produk', inv.plan],
      ['Metode Pembayaran', paymentMethod === 'qris' ? 'QRIS' : 'Transfer Bank (BCA)'],
      ['Harga', formatCurrency(inv.price)],
      ['Biaya Layanan', String(inv.serviceFee)],
      ['PPN (11%)', formatCurrency(inv.ppn)],
    ]

    y += 20
    rows.forEach(([label, value], i) => {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(136, 136, 136)
      doc.text(label, margin + 16, y)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(26, 26, 46)
      doc.text(value, pw - margin - 16, y, { align: 'right' })
      if (i < rows.length - 1) {
        doc.setDrawColor(224, 224, 224)
        doc.setLineWidth(0.5)
        doc.line(margin + 16, y + 7, pw - margin - 16, y + 7)
      }
      y += 24
    })

    // ── Total row
    y += 4
    doc.setDrawColor(79, 195, 247)
    doc.setLineWidth(1)
    doc.setLineDash([4, 3])
    doc.line(margin + 16, y, pw - margin - 16, y)
    doc.setLineDash([])
    y += 16
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(26, 26, 46)
    doc.text('Total Bayar', margin + 16, y)
    doc.setTextColor(79, 195, 247)
    doc.setFontSize(14)
    doc.text(formatCurrency(inv.total), pw - margin - 16, y, { align: 'right' })

    // ── Section: Informasi Invoice
    y += 36
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(79, 195, 247)
    doc.text('INFORMASI INVOICE', margin, y)

    y += 14
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(224, 224, 224)
    doc.setLineWidth(1)
    doc.roundedRect(margin, y, pw - margin * 2, 100, 6, 6, 'FD')

    const metaRows = [
      ['Nomor Invoice', inv.invoiceNumber],
      ['Tanggal Order', new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })],
      ['Durasi Pembayaran', '7 Hari'],
      ['Email Perusahaan', inv.companyEmail || '-'],
    ]

    y += 20
    metaRows.forEach(([label, value], i) => {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(136, 136, 136)
      doc.text(label, margin + 16, y)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(26, 26, 46)
      doc.text(value, pw - margin - 16, y, { align: 'right' })
      if (i < metaRows.length - 1) {
        doc.setDrawColor(240, 240, 240)
        doc.setLineWidth(0.5)
        doc.line(margin + 16, y + 7, pw - margin - 16, y + 7)
      }
      y += 22
    })

    // ── Note box
    y += 16
    doc.setFillColor(255, 248, 225)
    doc.roundedRect(margin, y, pw - margin * 2, 48, 4, 4, 'F')
    doc.setFillColor(255, 193, 7)
    doc.rect(margin, y, 4, 48, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(123, 98, 0)
    const noteText = `Pastikan nominal transfer sesuai hingga 6 digit terakhir termasuk biaya layanan ${inv.serviceFee} agar transaksi dapat diverifikasi otomatis.`
    const noteLines = doc.splitTextToSize(noteText, pw - margin * 2 - 32)
    doc.text(noteLines, margin + 14, y + 16)

    // ── Footer
    const footerY = doc.internal.pageSize.getHeight() - 48
    doc.setFillColor(26, 26, 46)
    doc.rect(0, footerY, pw, 48, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(79, 195, 247)
    doc.text('AddJob — Portal Kerja #1 Indonesia', pw / 2, footerY + 18, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(96, 125, 139)
    doc.text('globaladaptasi.com · adaptasindonesia@gmail.com', pw / 2, footerY + 34, { align: 'center' })

    doc.save(`Invoice-${inv.invoiceNumber}.pdf`)
  }

  const inv = invoiceRef.current

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.75rem', marginBottom: 6 }}>Paket Langganan</h1>
        <p style={{ color: 'var(--muted)' }}>Pilih paket yang sesuai untuk mengoptimalkan proses rekrutmen Anda.</p>
      </motion.div>

      {/* Billing toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
        <div style={{ background: 'var(--bg-alt)', borderRadius: 99, padding: 4, display: 'flex', gap: 0 }}>
          {['monthly', 'yearly'].map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              style={{
                padding: '8px 22px', borderRadius: 99, border: 'none',
                fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.875rem',
                cursor: 'pointer', transition: 'all 0.2s',
                background: billing === b ? 'var(--card)' : 'transparent',
                color: billing === b ? 'var(--dark)' : 'var(--muted)',
                boxShadow: billing === b ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {b === 'monthly' ? 'Bulanan' : 'Tahunan'}
              {b === 'yearly' && (
                <span style={{ marginLeft: 6, fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700 }}>-20%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24, marginBottom: 48 }}>
        {PLANS.map((plan, i) => {
          const isCurrent = currentPlan === plan.key
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              style={{
                background: 'var(--card)',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${isCurrent ? 'var(--primary)' : plan.name === 'Pro' ? 'var(--primary)' : 'var(--border-light)'}`,
                padding: 28,
                display: 'flex', flexDirection: 'column',
                position: 'relative',
                boxShadow: plan.name === 'Pro' ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
              }}
            >
              {plan.badge && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)' }}>
                  <Badge variant={plan.badgeVariant}>{plan.badge}</Badge>
                </div>
              )}
              {isCurrent && (
                <div style={{ position: 'absolute', top: 16, right: 16 }}>
                  <Badge variant="success">Aktif</Badge>
                </div>
              )}
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{plan.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', marginBottom: 6 }}>{plan.name}</h3>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: plan.price === 0 ? '1.5rem' : '2rem', color: plan.color }}>
                  {plan.price === 0 ? 'Gratis' : formatCurrency(plan.price * (billing === 'yearly' ? 0.8 : 1))}
                </span>
                {plan.price > 0 && <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{plan.period}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 24 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.875rem', color: 'var(--dark)' }}>
                    <Check size={15} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </div>
                ))}
              </div>
              <button
                className={`btn btn--block ${plan.name === 'Pro' ? 'btn--primary' : 'btn--secondary'}`}
                disabled={isCurrent || plan.key === 'free'}
                style={{ opacity: isCurrent || plan.key === 'free' ? 0.6 : 1 }}
                onClick={() => !isCurrent && plan.key !== 'free' && openModal(plan)}
              >
                {isCurrent ? 'Paket Saat Ini' : plan.key === 'free' ? 'Gratis' : 'Pilih Paket'}
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Comparison Table */}
      <div className="card card-body" style={{ marginBottom: 48, overflowX: 'auto' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.125rem', marginBottom: 20 }}>Perbandingan Fitur</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--dark)' }}>Fitur</th>
              {['Free', 'Basic', 'Pro', 'Premium'].map((h) => (
                <th key={h} style={{ textAlign: 'center', padding: '10px 12px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--dark)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON.map((row, idx) => (
              <tr key={row.feature} style={{ borderBottom: '1px solid var(--border-light)', background: idx % 2 === 0 ? 'transparent' : 'var(--bg-alt)' }}>
                <td style={{ padding: '12px', color: 'var(--dark)' }}>{row.feature}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}><CellValue val={row.free} /></td>
                <td style={{ padding: '12px', textAlign: 'center' }}><CellValue val={row.basic} /></td>
                <td style={{ padding: '12px', textAlign: 'center' }}><CellValue val={row.pro} /></td>
                <td style={{ padding: '12px', textAlign: 'center' }}><CellValue val={row.premium} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FAQ */}
      <div className="card card-body">
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.125rem', marginBottom: 20 }}>Pertanyaan Umum</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { q: 'Bisakah saya ganti paket kapan saja?', a: 'Ya, Anda bisa upgrade atau downgrade paket kapan saja. Perubahan berlaku di awal siklus tagihan berikutnya.' },
            { q: 'Metode pembayaran apa yang tersedia?', a: 'Kami menerima transfer bank dan QRIS.' },
            { q: 'Apakah ada uji coba gratis?', a: 'Paket Pro menawarkan uji coba 14 hari tanpa kartu kredit. Anda bisa batalkan kapan saja.' },
          ].map(({ q, a }) => (
            <div key={q} style={{ paddingBottom: 16, borderBottom: '1px solid var(--border-light)' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6 }}>{q}</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Payment Modal ── */}
      <AnimatePresence>
        {modalStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(26,26,46,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 300,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 16,
            }}
            onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'var(--card)',
                borderRadius: 'var(--radius-lg)',
                padding: 32,
                width: '100%',
                maxWidth: 480,
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  background: 'var(--bg)', border: 'none',
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--muted)',
                }}
              >
                <X size={16} />
              </button>

              {/* ── Step: Method Selection ── */}
              {modalStep === 'method' && (
                <>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', marginBottom: 6 }}>
                    Metode Pembayaran
                  </h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: 24 }}>
                    Pilih metode pembayaran untuk paket <strong>{selectedPlan?.name}</strong>
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { key: 'qris', label: 'QRIS', sub: 'Scan QR Code dari aplikasi e-wallet atau mobile banking', icon: '▦' },
                      { key: 'transfer', label: 'Transfer Bank', sub: 'Transfer ke rekening BCA atas nama AddJob', icon: '🏦' },
                    ].map((m) => (
                      <button
                        key={m.key}
                        onClick={() => handleSelectMethod(m.key)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 16,
                          padding: '16px 20px',
                          background: 'var(--bg)',
                          border: '1.5px solid var(--border-light)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                          width: '100%',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--accent-light)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.background = 'var(--bg)' }}
                      >
                        <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{m.icon}</span>
                        <div>
                          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--dark)', marginBottom: 2 }}>{m.label}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0 }}>{m.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* ── Step: Payment Detail ── */}
              {modalStep === 'payment' && inv && (
                <>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.125rem', marginBottom: 20 }}>
                    {paymentMethod === 'qris' ? 'Scan QRIS' : 'Transfer Bank'}
                  </h3>

                  {/* QRIS */}
                  {paymentMethod === 'qris' && (
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                      <div style={{
                        display: 'inline-block', padding: 12,
                        border: '2px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)', background: '#fff',
                        marginBottom: 10,
                      }}>
                        <img
                          src={QRIS_PLACEHOLDER}
                          alt="QRIS Code"
                          style={{ width: 180, height: 180, display: 'block' }}
                        />
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                        Scan menggunakan GoPay, OVO, DANA, ShopeePay, atau Mobile Banking
                      </p>
                    </div>
                  )}

                  {/* Bank Transfer */}
                  {paymentMethod === 'transfer' && (
                    <div style={{
                      background: 'var(--bg)',
                      border: '1.5px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px 20px',
                      marginBottom: 24,
                    }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 4 }}>Bank Tujuan</p>
                      <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--dark)', marginBottom: 12 }}>
                        {BANK_INFO.bankName}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 4 }}>Nomor Rekening</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.375rem', color: 'var(--dark)', letterSpacing: '0.05em', margin: 0 }}>
                          {BANK_INFO.accountNumber}
                        </p>
                        <button
                          onClick={() => handleCopy(BANK_INFO.accountNumber)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                            background: copied ? 'var(--success-light)' : 'var(--accent-light)',
                            border: 'none', cursor: 'pointer',
                            fontSize: '0.8rem', fontWeight: 600,
                            color: copied ? 'var(--success)' : 'var(--primary)',
                            transition: 'all 0.2s',
                          }}
                        >
                          {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                          {copied ? 'Tersalin' : 'Salin'}
                        </button>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 10, marginBottom: 2 }}>Atas Nama</p>
                      <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--dark)', margin: 0 }}>
                        {BANK_INFO.accountName}
                      </p>
                    </div>
                  )}

                  {/* Invoice breakdown */}
                  <div style={{
                    background: 'var(--bg)',
                    border: '1.5px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 20px',
                    marginBottom: 20,
                  }}>
                    <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.875rem', marginBottom: 14, color: 'var(--dark)' }}>
                      Detail Tagihan
                    </p>
                    {[
                      { label: 'Nama Perusahaan', value: inv.companyName },
                      { label: 'Produk', value: inv.plan },
                      { label: 'Harga', value: formatCurrency(inv.price) },
                      { label: 'Biaya Layanan', value: String(inv.serviceFee) },
                      { label: 'PPN (11%)', value: formatCurrency(inv.ppn) },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.875rem' }}>
                        <span style={{ color: 'var(--muted)' }}>{label}</span>
                        <span style={{ color: 'var(--dark)', fontWeight: 500 }}>{value}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1.5px dashed var(--border)', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--dark)' }}>Total Bayar</span>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.0625rem', color: 'var(--primary)' }}>
                        {formatCurrency(inv.total)}
                      </span>
                    </div>
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-light)' }}>
                       {[
                        { label: 'No. Invoice', value: inv.invoiceNumber },
                        { label: 'Durasi Pembayaran', value: '7 Hari' },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8125rem' }}>
                          <span style={{ color: 'var(--muted)' }}>{label}</span>
                          <span style={{ color: 'var(--dark)', fontWeight: 600 }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="btn btn--primary"
                      style={{ flex: 1 }}
                      disabled={submitting}
                      onClick={handleSelesai}
                    >
                      {submitting ? 'Memproses...' : 'Selesai'}
                    </button>
                  </div>
                </>
              )}

              {/* ── Step: Done ── */}
              {modalStep === 'done' && (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'var(--warning-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '2rem',
                  }}>
                    🕐
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', marginBottom: 10 }}>
                    Pesanan dalam tahap Verifikasi
                  </h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 8 }}>
                    Tim AddJob akan menghubungi Anda dalam <strong>3 hari kerja</strong> untuk konfirmasi pembayaran.
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 28 }}>
                    No. Invoice: <strong style={{ color: 'var(--dark)' }}>{inv?.invoiceNumber}</strong>
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={handleDownloadInvoice}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px 16px', borderRadius: 'var(--radius)',
                        border: '1.5px solid var(--border)', background: 'var(--bg)',
                        fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.875rem',
                        color: 'var(--dark)', cursor: 'pointer',
                      }}
                    >
                      <Download size={15} /> Unduh Invoice
                    </button>
                    <button className="btn btn--primary" style={{ flex: 1 }} onClick={closeModal}>
                      Tutup
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}