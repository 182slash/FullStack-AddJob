import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Tag, Copy, Check, RefreshCw, TrendingUp, Award, Clock } from 'lucide-react'
import api from '@/services/api'

const PLAN_COLORS = {
  free:    'var(--muted)',
  basic:   '#3b82f6',
  pro:     '#8b5cf6',
  premium: '#f59e0b',
}

const PLAN_POINTS = { free: 0, basic: 1, pro: 2, premium: 3 }

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

const SalesDashboard = () => {
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [copied, setCopied]     = useState(false)
  const [generating, setGen]    = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data: res } = await api.get('/sales/me')
      setData(res.data)
    } catch {
      setError('Gagal memuat data. Coba refresh halaman.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const copyCode = () => {
    if (!data?.referralCode) return
    navigator.clipboard.writeText(data.referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateCode = async () => {
    setGen(true)
    try {
      const { data: res } = await api.post('/sales/generate-code')
      setData(prev => ({ ...prev, referralCode: res.data.referralCode }))
    } catch {
      alert('Gagal generate kode.')
    } finally {
      setGen(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--accent-light)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (error) return (
    <div className="alert alert--error" style={{ margin: 24 }}>
      <p style={{ color: 'var(--error)' }}>{error}</p>
    </div>
  )

  const totalCompanies = data.transactions.length
  const thisMonth = data.transactions.filter(t => {
    const d = new Date(t.createdAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.625rem', fontWeight: 800, marginBottom: 4 }}>
          Dashboard Sales
        </h1>
        <p style={{ color: 'var(--muted)' }}>Pantau referral dan poin Anda</p>
      </div>

      {/* Referral Code Card */}
      <div className="card card-body" style={{ marginBottom: 24, background: 'var(--gradient-hero)', color: '#fff', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ fontSize: '0.8125rem', opacity: 0.85, marginBottom: 8, fontWeight: 500 }}>
          Kode Referral Anda
        </p>
        {data.referralCode ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, letterSpacing: '0.08em' }}>
              {data.referralCode}
            </span>
            <button
              onClick={copyCode}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '8px 14px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600 }}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Disalin!' : 'Salin'}
            </button>
          </div>
        ) : (
          <div>
            <p style={{ opacity: 0.85, marginBottom: 12 }}>Anda belum memiliki kode referral.</p>
            <button
              onClick={generateCode}
              disabled={generating}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
            >
              <RefreshCw size={15} style={{ animation: generating ? 'spin 0.8s linear infinite' : 'none' }} />
              {generating ? 'Membuat...' : 'Buat Kode'}
            </button>
          </div>
        )}
        <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: 10 }}>
          Bagikan kode ini ke perusahaan saat mendaftar untuk mendapatkan poin.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon={Award}      label="Total Poin"        value={data.points}      color="var(--primary)" />
        <StatCard icon={TrendingUp} label="Total Perusahaan"  value={totalCompanies}   color="#8b5cf6" />
        <StatCard icon={Clock}      label="Bulan Ini"         value={thisMonth}        color="#f59e0b" />
      </div>

      {/* Transaction History */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-body" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.0625rem' }}>
            Riwayat Transaksi
          </h2>
        </div>

        {data.transactions.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Tag size={36} style={{ color: 'var(--muted)', marginBottom: 12 }} />
            <p style={{ color: 'var(--muted)' }}>Belum ada transaksi. Mulai bagikan kode referral Anda!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  {['Perusahaan', 'Paket', 'Poin', 'Tanggal'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((t, i) => (
                  <motion.tr
                    key={t._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderTop: '1px solid var(--border-light)' }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                        {t.companyId?.name || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: `${PLAN_COLORS[t.plan]}18`,
                        color: PLAN_COLORS[t.plan],
                        textTransform: 'capitalize',
                      }}>
                        {t.plan}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 700, color: t.pointsAwarded > 0 ? 'var(--success)' : 'var(--muted)' }}>
                        {t.pointsAwarded > 0 ? `+${t.pointsAwarded}` : '0'} poin
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                      {new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesDashboard