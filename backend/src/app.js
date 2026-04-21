const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const rateLimit  = require('express-rate-limit')
const path       = require('path')

const authRoutes        = require('./routes/auth.routes')
const jobRoutes         = require('./routes/job.routes')
const applicationRoutes = require('./routes/application.routes')
const companyRoutes     = require('./routes/company.routes')
const articleRoutes     = require('./routes/article.routes')
const profileRoutes          = require('./routes/profile.routes')
const subscriptionRoutes     = require('./routes/subscription.routes')
const salesRoutes            = require('./routes/sales.routes')
const errorHandler           = require('./middleware/errorHandler')

const app = express()

// ── Trust proxy (for DigitalOcean / Nginx) ────────────────
app.set('trust proxy', 1)

// ── Security Headers ─────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}))

// ── CORS ─────────────────────────────────────────────────
const ALLOWED = [
  process.env.CLIENT_URL   || 'http://localhost:5173',
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'https://www.globaladaptasi.com',
]
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin '${origin}' not allowed`))
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}))

// ── General Rate Limit ────────────────────────────────────
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak permintaan. Coba lagi nanti.' },
}))

// ── Auth Rate Limit ────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
})

// ── Body Parsing ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Logging ───────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

// ── Static Uploads ────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// ── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({
  success: true,
  service: 'AddJob API',
  version: '1.0.0',
  env: process.env.NODE_ENV,
  timestamp: new Date().toISOString(),
}))

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',         authLimiter, authRoutes)
app.use('/api/jobs',         jobRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/companies',    companyRoutes)
app.use('/api/articles',     articleRoutes)
app.use('/api/profile',      profileRoutes)
app.use('/api/subscription', subscriptionRoutes)
app.use('/api/sales',        salesRoutes)
// ── 404 ───────────────────────────────────────────────────
app.use('*', (req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} tidak ditemukan.` })
)

// ── Error Handler ─────────────────────────────────────────
app.use(errorHandler)

module.exports = app
