import { useState, useEffect, Fragment } from 'react'
import { motion } from 'framer-motion'
import { Users, Award, TrendingUp, Plus, RefreshCw,
         ChevronDown, ChevronUp, X, CheckCircle, XCircle } from 'lucide-react'
import api from '@/services/api'

const PLAN_COLORS = {
  free:    'var(--muted)',
  basic:   '#3b82f6',
  pro:     '#8b5cf6',
  premium: '#f59e0b',
}

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

const AddSalesModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/register', { name, email, password, role: 'sales' })
      setName(''); setEmail(''); setPass('')
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambah akun sales.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="card"
        style={{ maxWidth: 440, width: '100%' }}
      >
        <div className="card-body" style={{ borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.125rem' }}>Tambah Akun Sales</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div className="card-body">
          {error && (
            <div style={{ padding: 12, borderRadius: 8, background: '#fee', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <XCircle size={18} style={{ color: 'var(--error)', flexShrink: 0 }} />
              <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { label: 'Nama Lengkap', value: name,     setter: setName,  type: 'text',     placeholder: 'John Doe' },
              { label: 'Email',        value: email,    setter: setEmail, type: 'email',    placeholder: 'sales@email.com' },
              { label: 'Password',     value: password, setter: setPass,  type: 'password', placeholder: 'Min. 8 karakter' },
            ].map(({ label, value, setter, type, placeholder }) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6 }}>{label}</label>
                <input
                  type={type}
                  value={value}
                  onChange={e => setter(e.target.value)}
                  required
                  placeholder={placeholder}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.9375rem' }}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px 20px', borderRadius: 8, background: loading ? 'var(--muted)' : 'var(--primary)', color: '#fff', border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9375rem', marginTop: 8 }}
            >
              {loading ? 'Menyimpan...' : 'Tambah Sales'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

const SuperAdminSales = () => {
  const [allSales, setAllSales]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [expandedRow, setExpanded]  = useState(null)
  const [showAddModal, setShowAdd]  = useState(false)
  const [txLoading, setTxLoading]   = useState({})
  const [txData, setTxData]         = useState({})

  const fetchAllSales = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/sales/admin/all')
      setAllSales(data.data)
    } catch {
      setError('Gagal memuat data tim sales.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAllSales() }, [])

  const toggleRow = async (salesId) => {
    if (expandedRow === salesId) {
      setExpanded(null)
      return
    }
    setExpanded(salesId)

    // Fetch transactions for this sales if not cached yet
    if (!txData[salesId]) {
      setTxLoading(prev => ({ ...prev, [salesId]: true }))
      try {
        const { data } = await api.get(`/sales/admin/transactions/${salesId}`)
        setTxData(prev => ({ ...prev, [salesId]: data.data }))
      } catch {
        setTxData(prev => ({ ...prev, [salesId]: [] }))
      } finally {
        setTxLoading(prev => ({ ...prev, [salesId]: false }))
      }
    }
  }

  const totalPoints = allSales.reduce((sum, s) => sum + s.points, 0)

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.625rem', fontWeight: 800, marginBottom: 4 }}>
            Tim Sales
          </h1>
          <p style={{ color: 'var(--muted)' }}>Kelola seluruh akun sales</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.9375rem' }}
        >
          <Plus size={18} />
          Tambah Sales
        </button>
      </div>

      {error && (
        <div className="alert alert--error" style={{ marginBottom: 20 }}>
          <p style={{ color: 'var(--error)' }}>{error}</p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon={Users}      label="Total Sales"        value={loading ? '—' : allSales.length} color="var(--primary)" />
        <StatCard icon={Award}      label="Total Poin"         value={loading ? '—' : totalPoints}     color="#8b5cf6" />
        <StatCard icon={TrendingUp} label="Rata-rata Poin"     value={loading ? '—' : allSales.length ? Math.round(totalPoints / allSales.length) : 0} color="#f59e0b" />
      </div>

      {/* Sales Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-body" style={{ borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.0625rem' }}>
            Daftar Sales
          </h2>
          <button
            onClick={fetchAllSales}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--muted)' }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {loading ? (
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
                  {['', 'Sales', 'Kode Referral', 'Total Poin', 'Bergabung'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allSales.map((s, i) => (
                  <Fragment key={s._id}>
                    <motion.tr
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ borderTop: '1px solid var(--border-light)', cursor: 'pointer' }}
                      onClick={() => toggleRow(s._id)}
                    >
                      <td style={{ padding: '14px 16px', width: 32 }}>
                        {expandedRow === s._id
                          ? <ChevronUp size={15} style={{ color: 'var(--muted)' }} />
                          : <ChevronDown size={15} style={{ color: 'var(--muted)' }} />
                        }
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
                      <td style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                        {new Date(s.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </motion.tr>

                    {expandedRow === s._id && (
                      <tr style={{ background: 'var(--bg)' }}>
                        <td colSpan={5} style={{ padding: '0 16px 16px 48px' }}>
                          {txLoading[s._id] ? (
                            <div style={{ padding: '16px 0', display: 'flex', justifyContent: 'center' }}>
                              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid var(--accent-light)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
                            </div>
                          ) : !txData[s._id]?.length ? (
                            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', padding: '12px 0' }}>
                              Belum ada transaksi.
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
                                {txData[s._id].map(t => (
                                  <tr key={t._id}>
                                    <td style={{ padding: '8px 12px', fontWeight: 500 }}>{t.companyId?.name || '—'}</td>
                                    <td style={{ padding: '8px 12px' }}>
                                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, background: `${PLAN_COLORS[t.plan]}18`, color: PLAN_COLORS[t.plan], textTransform: 'capitalize' }}>
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

      <AddSalesModal
        isOpen={showAddModal}
        onClose={() => setShowAdd(false)}
        onSuccess={fetchAllSales}
      />
    </div>
  )
}

export default SuperAdminSales