import { useState, useEffect, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Award, TrendingUp, Download, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, CheckCircle, XCircle, X } from 'lucide-react'
import api from '@/services/api'

const PLAN_COLORS = {
  free:    'var(--muted)',
  basic:   '#3b82f6',
  pro:     '#8b5cf6',
  premium: '#f59e0b',
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={22} style={{ color }} />
    </div>
    <div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: 2 }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--dark)' }}>{value}</p>
    </div>
  </div>
)

const ActivatePlanModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('')
  const [plan, setPlan] = useState('pro')
  const [duration, setDuration] = useState(30)
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const { data } = await api.post('/subscription/admin/activate', {
        email,
        plan,
        durationDays: duration,
        referralCode: referralCode.trim() || undefined,
      })

      setResult(data.data)
      setEmail('')
      setPlan('pro')
      setDuration(30)
      setReferralCode('')

      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengaktifkan paket.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="card"
          style={{ maxWidth: 480, width: '100%', maxHeight: '90vh', overflow: 'auto' }}
        >
          <div className="card-body" style={{ borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.125rem' }}>
              Aktivasi Paket Langganan
            </h2>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="card-body">
            {result ? (
              <div>
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: 16 }} />
                  <h3 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 8 }}>
                    Paket Berhasil Diaktifkan!
                  </h3>
                  <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
                    {result.name} — {result.email}
                  </p>

                  <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                    <div style={{ display: 'grid', gap: 12, textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Paket:</span>
                        <span style={{ fontWeight: 600, textTransform: 'capitalize', color: PLAN_COLORS[result.plan] }}>
                          {result.plan}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Berlaku hingga:</span>
                        <span style={{ fontWeight: 600 }}>
                          {result.planExpiresAt
                            ? new Date(result.planExpiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'
                          }
                        </span>
                      </div>
                      {result.referralPoints && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
                          <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Poin diberikan:</span>
                          <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                            +{result.referralPoints.awarded} poin → {result.referralPoints.to}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setResult(null)
                      onClose()
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 20px',
                      borderRadius: 8,
                      background: 'var(--primary)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ padding: 12, borderRadius: 8, background: '#fee', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <XCircle size={18} style={{ color: 'var(--error)', flexShrink: 0 }} />
                    <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{error}</p>
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6 }}>
                    Email Perusahaan
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="company@email.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      fontSize: '0.9375rem',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6 }}>
                    Paket
                  </label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      fontSize: '0.9375rem',
                      background: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="basic">Basic (1 poin)</option>
                    <option value="pro">Pro (2 poin)</option>
                    <option value="premium">Premium (3 poin)</option>
                  </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6 }}>
                    Durasi (hari)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    required
                    min="1"
                    max="365"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      fontSize: '0.9375rem',
                    }}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>
                    Berlaku hingga: {new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6 }}>
                    Kode Referral <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="contoh: JIMM-S0R6"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      fontSize: '0.9375rem',
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                    }}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>
                    Isi jika perusahaan lupa memasukkan kode saat registrasi
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: 8,
                    background: loading ? 'var(--muted)' : 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '0.9375rem',
                  }}
                >
                  {loading ? 'Memproses...' : 'Aktivasi Paket'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const SuperAdminDashboard = () => {
  const now = new Date()
  const [month, setMonth]          = useState(now.getMonth() + 1)
  const [year, setYear]            = useState(now.getFullYear())
  const [report, setReport]        = useState(null)
  const [allSales, setAllSales]    = useState([])
  const [loadingReport, setLR]     = useState(true)
  const [loadingAll, setLA]        = useState(true)
  const [error, setError]          = useState('')
  const [expandedRow, setExpanded] = useState(null)
  const [showActivateModal, setShowActivateModal] = useState(false)

  const fetchReport = async (m, y) => {
    setLR(true)
    try {
      const { data } = await api.get(`/sales/admin/monthly?month=${m}&year=${y}`)
      setReport(data.data)
    } catch {
      setError('Gagal memuat laporan bulanan.')
    } finally {
      setLR(false)
    }
  }

  const fetchAllSales = async () => {
    setLA(true)
    try {
      const { data } = await api.get('/sales/admin/all')
      setAllSales(data.data)
    } catch {
      setError('Gagal memuat data sales.')
    } finally {
      setLA(false)
    }
  }

  useEffect(() => {
    fetchAllSales()
  }, [])

  useEffect(() => {
    fetchReport(month, year)
  }, [month, year])

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear()
    if (isCurrentMonth) return
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const exportCSV = () => {
    if (!report?.report?.length) return

    const rows = []
    rows.push(['Nama Sales', 'Email', 'Kode Referral', 'Total Poin Bulan Ini', 'Perusahaan', 'Paket', 'Poin', 'Tanggal'])

    report.report.forEach(({ salesUser, totalPoints, transactions }) => {
      if (transactions.length === 0) {
        rows.push([salesUser.name, salesUser.email, salesUser.referralCode || '-', totalPoints, '-', '-', '-', '-'])
      } else {
        transactions.forEach((t, i) => {
          rows.push([
            i === 0 ? salesUser.name        : '',
            i === 0 ? salesUser.email       : '',
            i === 0 ? (salesUser.referralCode || '-') : '',
            i === 0 ? totalPoints           : '',
            t.companyId?.name || '-',
            t.plan,
            t.pointsAwarded,
            new Date(t.createdAt).toLocaleDateString('id-ID'),
          ])
        })
      }
    })

    const csvContent = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = `sales-report-${MONTH_NAMES[month - 1]}-${year}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleActivateSuccess = () => {
    fetchReport(month, year)
    fetchAllSales()
  }

  const isCurrentMonth        = month === now.getMonth() + 1 && year === now.getFullYear()
  const totalPointsThisMonth  = report?.report?.reduce((sum, r) => sum + r.totalPoints, 0) || 0
  const totalSales             = allSales.length
  const totalPointsAllTime     = allSales.reduce((sum, s) => sum + s.points, 0)

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.625rem', fontWeight: 800, marginBottom: 4 }}>
            Dashboard Super Admin
          </h1>
          <p style={{ color: 'var(--muted)' }}>Monitor performa seluruh tim sales</p>
        </div>

        <button
          onClick={() => setShowActivateModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 8,
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9375rem',
          }}
        >
          <CheckCircle size={18} />
          Aktivasi Paket
        </button>
      </div>

      {error && (
        <div className="alert alert--error" style={{ marginBottom: 20 }}>
          <p style={{ color: 'var(--error)' }}>{error}</p>
        </div>
      )}

      {/* All-time stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon={Users}      label="Total Sales"                       value={totalSales}           color="var(--primary)" />
        <StatCard icon={Award}      label="Total Poin (Semua Waktu)"          value={totalPointsAllTime}   color="#8b5cf6" />
        <StatCard icon={TrendingUp} label={`Poin ${MONTH_NAMES[month - 1]}`} value={totalPointsThisMonth} color="#f59e0b" />
      </div>

      {/* Monthly Report Section */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: 32 }}>
        <div className="card-body" style={{ borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.0625rem' }}>
              Laporan Bulanan
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', borderRadius: 8, padding: '4px 8px', border: '1px solid var(--border)' }}>
              <button
                onClick={prevMonth}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--dark)', padding: 2 }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontWeight: 600, fontSize: '0.9375rem', minWidth: 140, textAlign: 'center' }}>
                {MONTH_NAMES[month - 1]} {year}
              </span>
              <button
                onClick={nextMonth}
                disabled={isCurrentMonth}
                style={{ background: 'none', border: 'none', cursor: isCurrentMonth ? 'not-allowed' : 'pointer', display: 'flex', color: isCurrentMonth ? 'var(--muted)' : 'var(--dark)', padding: 2 }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <button
            onClick={exportCSV}
            disabled={!report?.report?.length}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8,
              background: report?.report?.length ? 'var(--primary)' : 'var(--border)',
              color: report?.report?.length ? '#fff' : 'var(--muted)',
              border: 'none', cursor: report?.report?.length ? 'pointer' : 'not-allowed',
              fontWeight: 600, fontSize: '0.875rem',
            }}
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>

        {loadingReport ? (
          <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--accent-light)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : !report?.report?.length ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <TrendingUp size={36} style={{ color: 'var(--muted)', marginBottom: 12 }} />
            <p style={{ color: 'var(--muted)' }}>
              Tidak ada transaksi di bulan {MONTH_NAMES[month - 1]} {year}.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  {['', 'Sales', 'Kode Referral', 'Transaksi', 'Poin Bulan Ini'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.report.map((row, i) => (
                  <Fragment key={row.salesUser._id}>
                    <motion.tr
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ borderTop: '1px solid var(--border-light)', cursor: 'pointer' }}
                      onClick={() => setExpanded(expandedRow === row.salesUser._id ? null : row.salesUser._id)}
                    >
                      <td style={{ padding: '14px 16px', width: 32 }}>
                        {expandedRow === row.salesUser._id
                          ? <ChevronUp size={15} style={{ color: 'var(--muted)' }} />
                          : <ChevronDown size={15} style={{ color: 'var(--muted)' }} />
                        }
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: 2 }}>{row.salesUser.name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{row.salesUser.email}</p>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                          {row.salesUser.referralCode || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: '0.9rem' }}>
                        {row.transactions.length} transaksi
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: row.totalPoints > 0 ? 'var(--success)' : 'var(--muted)' }}>
                          {row.totalPoints} poin
                        </span>
                      </td>
                    </motion.tr>

                    {expandedRow === row.salesUser._id && (
                      <tr style={{ background: 'var(--bg)' }}>
                        <td colSpan={5} style={{ padding: '0 16px 16px 48px' }}>
                          {row.transactions.length === 0 ? (
                            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', padding: '12px 0' }}>
                              Tidak ada transaksi.
                            </p>
                          ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                              <thead>
                                <tr>
                                  {['Perusahaan', 'Paket', 'Poin', 'Tanggal'].map(h => (
                                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {row.transactions.map(t => (
                                  <tr key={t._id}>
                                    <td style={{ padding: '8px 12px', fontWeight: 500 }}>{t.companyId?.name || '—'}</td>
                                    <td style={{ padding: '8px 12px' }}>
                                      <span style={{
                                        display: 'inline-block', padding: '2px 8px', borderRadius: 20,
                                        fontSize: '0.8rem', fontWeight: 600,
                                        background: `${PLAN_COLORS[t.plan]}18`,
                                        color: PLAN_COLORS[t.plan],
                                        textTransform: 'capitalize',
                                      }}>
                                        {t.plan}
                                      </span>
                                    </td>
                                    <td style={{ padding: '8px 12px', fontWeight: 700, color: t.pointsAwarded > 0 ? 'var(--success)' : 'var(--muted)' }}>
                                      {t.pointsAwarded > 0 ? `+${t.pointsAwarded}` : '0'} poin
                                    </td>
                                    <td style={{ padding: '8px 12px', color: 'var(--muted)' }}>
                                      {new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* All Sales — All-time Leaderboard */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-body" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.0625rem' }}>
            Leaderboard Semua Waktu
          </h2>
        </div>

        {loadingAll ? (
          <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--accent-light)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : allSales.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Users size={36} style={{ color: 'var(--muted)', marginBottom: 12 }} />
            <p style={{ color: 'var(--muted)' }}>Belum ada akun sales terdaftar.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  {['#', 'Sales', 'Kode Referral', 'Total Poin', 'Bergabung'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allSales.map((s, i) => (
                  <motion.tr
                    key={s._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderTop: '1px solid var(--border-light)' }}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 800, fontSize: '1rem', color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--muted)' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: 2 }}>{s.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{s.email}</p>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                        {s.referralCode || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: s.points > 0 ? 'var(--success)' : 'var(--muted)' }}>
                        {s.points} poin
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: '0.875rem' }}>
                      {new Date(s.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activate Plan Modal */}
      <ActivatePlanModal
        isOpen={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        onSuccess={handleActivateSuccess}
      />
    </div>
  )
}

export default SuperAdminDashboard