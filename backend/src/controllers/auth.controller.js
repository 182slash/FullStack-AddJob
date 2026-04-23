const jwt     = require('jsonwebtoken')
const crypto  = require('crypto')
const { OAuth2Client } = require('google-auth-library')
const User    = require('../models/User')
const Company = require('../models/Company')
const email   = require('../config/email')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// ── Token helpers ──────────────────────────────────────────
const JWT_SECRET         = () => process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET
const JWT_REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET
const ACCESS_EXPIRE      = () => process.env.JWT_ACCESS_EXPIRE  || '15m'
const REFRESH_EXPIRE     = () => process.env.JWT_REFRESH_EXPIRE || '30d'

const signAccess  = (id) => jwt.sign({ id }, JWT_SECRET(),         { expiresIn: ACCESS_EXPIRE()  })
const signRefresh = (id) => jwt.sign({ id }, JWT_REFRESH_SECRET(), { expiresIn: REFRESH_EXPIRE() })
const hashToken   = (t)  => crypto.createHash('sha256').update(t).digest('hex')

const sendTokenResponse = async (user, res, statusCode = 200, extra = {}) => {
  const accessToken  = signAccess(user._id)
  const refreshToken = signRefresh(user._id)

  // Store hashed refresh token (keep max 5 devices)
  const hashed = hashToken(refreshToken)
  await User.findByIdAndUpdate(user._id, {
    $push: { refreshTokens: { $each: [hashed], $slice: -5 } },
    lastLogin: new Date(),
  })

  const userData = user.toObject()
  delete userData.password
  delete userData.refreshTokens

  res.status(statusCode).json({
    success:      true,
    accessToken,
    refreshToken,
    user:         userData,
    ...extra,
  })
}

// ── POST /api/auth/register ────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email: emailAddr, password, phone, role = 'seeker', companyName, referralCode } = req.body

    if (await User.findOne({ email: emailAddr })) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' })
    }

    const user = await User.create({ name, email: emailAddr, password, phone, role })

    // Create company for employers
    let company
    if (role === 'employer') {
      company = await Company.create({
        name:  companyName || `${name}'s Company`,
        owner: user._id,
        referredBy: referralCode ? referralCode.toUpperCase() : undefined,
      })
      user.company = company._id
      await user.save({ validateBeforeSave: false })
    }

    // Send verification email (fire-and-forget — non-blocking)
    try {
      const token = user.createVerifyToken()
      await user.save({ validateBeforeSave: false })
      email.sendVerificationEmail(user, token).catch(e => console.warn('Verification email failed:', e.message))
    } catch (e) { console.warn('Verification token save failed:', e.message) }

    await user.populate('company', 'name logo slug')
    await sendTokenResponse(user, res, 201)
  } catch (err) { next(err) }
}

// ── POST /api/auth/pre-register ───────────────────────────
exports.preRegister = async (req, res, next) => {
  try {
    const { name, email: emailAddr, password, phone, major } = req.body

    if (await User.findOne({ email: emailAddr })) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' })
    }

    await User.create({
      name,
      email: emailAddr,
      password,
      phone,
      major,
      role: 'seeker',
      preRegistered: true,
      isVerified: true,
    })

    res.status(201).json({ success: true, message: 'Pre-registrasi berhasil.' })
  } catch (err) { next(err) }
}

// ── POST /api/auth/login ───────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email: emailAddr, password } = req.body
    if (!emailAddr || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' })
    }

    const user = await User.findOne({ email: emailAddr }).select('+password +refreshTokens').populate('company', 'name logo slug')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' })
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Akun Anda telah dinonaktifkan. Hubungi support.' })
    }

    await sendTokenResponse(user, res)
  } catch (err) { next(err) }
}

exports.googleAuth = async (req, res, next) => {
  try {
    const { credential, role = 'seeker' } = req.body
    if (!credential) return res.status(400).json({ success: false, message: 'Google credential diperlukan.' })

    let googleId, emailAddr, name, picture

    if (credential.startsWith('ya29.')) {
      // access_token flow
      const gRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${credential}` }
      })
      const payload = await gRes.json()
      googleId  = payload.sub
      emailAddr = payload.email
      name      = payload.name
      picture   = payload.picture
    } else {
      // id_token flow
      const ticket  = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID })
      const payload = ticket.getPayload()
      googleId  = payload.sub
      emailAddr = payload.email
      name      = payload.name
      picture   = payload.picture
    }

    let user = await User.findOne({ $or: [{ googleId }, { email: emailAddr }] }).select('+refreshTokens').populate('company', 'name logo slug')

    if (!user) {
      user = await User.create({ name, email: emailAddr, googleId, avatar: picture, role, isVerified: true, password: crypto.randomBytes(20).toString('hex') })
      if (role === 'employer') {
        const company = await Company.create({ name: `${name}'s Company`, owner: user._id })
        user.company = company._id
        await user.save({ validateBeforeSave: false })
        await user.populate('company', 'name logo slug')
      }
    } else if (!user.googleId) {
      user.googleId = googleId
      if (!user.avatar) user.avatar = picture
      await user.save({ validateBeforeSave: false })
    }

    await sendTokenResponse(user, res)
  } catch (err) { next(err) }
}

// ── POST /api/auth/refresh ─────────────────────────────────
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token diperlukan.' })

    let decoded
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET())
    } catch {
      return res.status(401).json({ success: false, message: 'Refresh token tidak valid atau kedaluwarsa.' })
    }

    const hashed = hashToken(refreshToken)
    const user   = await User.findOne({ _id: decoded.id, refreshTokens: hashed }).select('+refreshTokens').populate('company', 'name logo slug')
    if (!user) return res.status(401).json({ success: false, message: 'Refresh token tidak valid.' })

    // Rotate: remove old, issue new
    user.refreshTokens = user.refreshTokens.filter(t => t !== hashed)
    await user.save({ validateBeforeSave: false })
    await sendTokenResponse(user, res)
  } catch (err) { next(err) }
}

// ── POST /api/auth/logout ──────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (refreshToken) {
      const hashed = hashToken(refreshToken)
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: hashed },
      })
    }
    res.json({ success: true, message: 'Berhasil logout.' })
  } catch (err) { next(err) }
}

// ── GET /api/auth/me ───────────────────────────────────────
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('company', 'name logo slug industry location isVerified')
  res.json({ success: true, data: user })
}

// ── PUT /api/auth/me ───────────────────────────────────────
exports.updateMe = async (req, res, next) => {
  try {
    const forbidden = ['password', 'email', 'role', 'isVerified', 'googleId', 'refreshTokens']
    forbidden.forEach(f => delete req.body[f])

    const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true }).populate('company', 'name logo slug')
    res.json({ success: true, data: user })
  } catch (err) { next(err) }
}

// ── PUT /api/auth/change-password ─────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi.' })
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 8 karakter.' })
    }

    const user = await User.findById(req.user._id).select('+password')
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Password lama salah.' })
    }

    user.password = newPassword
    user.refreshTokens = []
    await user.save()
    res.json({ success: true, message: 'Password berhasil diubah. Silakan login kembali.' })
  } catch (err) { next(err) }
}

// ── POST /api/auth/forgot-password ───────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email: emailAddr } = req.body
    const user = await User.findOne({ email: emailAddr })
    // Always return 200 to prevent email enumeration
    if (!user) return res.json({ success: true, message: 'Jika email terdaftar, link reset akan dikirim.' })

    const token = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false })

    try {
      await email.sendPasswordResetEmail(user, token)
    } catch (e) {
      user.resetToken = undefined; user.resetExpires = undefined
      await user.save({ validateBeforeSave: false })
      return next(new Error('Gagal mengirim email. Coba lagi nanti.'))
    }

    res.json({ success: true, message: 'Link reset password telah dikirim ke email Anda.' })
  } catch (err) { next(err) }
}

// ── POST /api/auth/reset-password ────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token dan password baru wajib diisi.' })
    }

    const hashed = hashToken(token)
    const user   = await User.findOne({ resetToken: hashed, resetExpires: { $gt: Date.now() } }).select('+refreshTokens')
    if (!user) return res.status(400).json({ success: false, message: 'Token tidak valid atau sudah kedaluwarsa.' })

    user.password     = newPassword
    user.resetToken   = undefined
    user.resetExpires = undefined
    user.refreshTokens = []
    await user.save()

    res.json({ success: true, message: 'Password berhasil direset. Silakan login.' })
  } catch (err) { next(err) }
}

// ── GET /api/auth/verify-email/:token ────────────────────
exports.verifyEmail = async (req, res, next) => {
  try {
    const hashed = hashToken(req.params.token)
    const user   = await User.findOne({ verifyToken: hashed, verifyExpires: { $gt: Date.now() } })
    if (!user) return res.status(400).json({ success: false, message: 'Link verifikasi tidak valid atau sudah kedaluwarsa.' })

    user.isVerified    = true
    user.verifyToken   = undefined
    user.verifyExpires = undefined
    await user.save({ validateBeforeSave: false })

    res.json({ success: true, message: 'Email berhasil diverifikasi!' })
  } catch (err) { next(err) }
}

// ── POST /api/auth/avatar ────────────────────────────────
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'File tidak ditemukan.' })
    const { deleteFile } = require('../config/cloudinary')
    const prev = req.user.avatarPublicId
    const user = await User.findByIdAndUpdate(req.user._id, {
      avatar: req.file.path,  
      avatarPublicId: req.file.filename,      
    }, { new: true })
    if (prev) await deleteFile(prev)
    res.json({ success: true, data: { avatar: user.avatar } })
  } catch (err) { next(err) }
}
