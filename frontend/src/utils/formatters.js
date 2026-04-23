// ─── Currency ─────────────────────────────────────────────
export const formatCurrency = (amount, currency = 'IDR') => {
  if (amount == null) return 'Gaji tidak dicantumkan'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatSalaryRange = (min, max, currency = 'IDR') => {
  if (!min && !max) return 'Gaji tidak dicantumkan'
  if (!min) return `s/d ${formatCurrency(max, currency)}`
  if (!max) return `${formatCurrency(min, currency)}+`
  return `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}`
}

// ─── Date / Time ──────────────────────────────────────────
export const formatDate = (date, options = {}) => {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  })
}

export const formatDateShort = (date) => {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const formatRelativeTime = (date) => {
  if (!date) return '-'
  const now = new Date()
  const d   = typeof date === 'string' ? new Date(date) : date
  const diff = now - d // ms

  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  const weeks = Math.floor(days / 7)

  if (mins < 1)   return 'Baru saja'
  if (mins < 60)  return `${mins} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  if (days < 7)   return `${days} hari lalu`
  if (weeks < 4)  return `${weeks} minggu lalu`
  return formatDateShort(d)
}

// ─── String ───────────────────────────────────────────────
export const truncate = (str, maxLen = 100) => {
  if (!str) return ''
  return str.length > maxLen ? str.slice(0, maxLen).trimEnd() + '...' : str
}

export const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

export const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')

// ─── Number ───────────────────────────────────────────────
export const formatNumber = (num) => {
  if (num == null) return '0'
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}jt`
  if (num >= 1_000)     return `${(num / 1_000).toFixed(1)}rb`
  return num.toString()
}

// ─── Job Specific ─────────────────────────────────────────
export const JOB_TYPE_LABELS = {
  fulltime:   'Full-time',
  parttime:   'Part-time',
  contract:   'Kontrak',
  freelance:  'Freelance',
  internship: 'Magang',
  remote:     'Remote',
}

export const EXPERIENCE_LABELS = {
  fresh: 'Fresh Graduate',
  '1-2': '1 – 2 Tahun',
  '3-5': '3 – 5 Tahun',
  '5+':  '5+ Tahun',
}

export const APPLICATION_STATUS_LABELS = {
  pending:   'Menunggu',
  reviewed:  'Dilihat',
  shortlist: 'Shortlist',
  interview: 'Interview',
  offered:   'Ditawarkan',
  rejected:  'Ditolak',
  withdrawn: 'Ditarik',
  hired:     'Diterima',
}

export const APPLICATION_STATUS_COLORS = {
  pending:   'muted',
  reviewed:  'info',
  shortlist: 'primary',
  interview: 'warning',
  offered:   'success',
  rejected:  'error',
  withdrawn: 'muted',
  hired:     'success',
}

// --- Cloudinary Image Optimization ---
export const cloudinaryUrl = (url, options = {}) => {
  if (!url || !url.includes('res.cloudinary.com')) return url
  const { width = '', height = '', quality = 'auto', format = 'auto' } = options
  const transformation = [
    format !== 'auto' ? `f_${format}` : 'f_auto',
    `q_${quality}`,
    width ? `w_${width}` : '',
    height ? `h_${height}` : '',
  ].filter(Boolean).join(',')
  return url.replace('/upload/', `/upload/${transformation}/`)
}

