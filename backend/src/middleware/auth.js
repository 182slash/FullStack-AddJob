const jwt  = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    let token
    const auth = req.headers.authorization
    if (auth && auth.startsWith('Bearer ')) {
      token = auth.split(' ')[1]
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET)
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token kedaluwarsa.', code: 'TOKEN_EXPIRED' })
      }
      return res.status(401).json({ success: false, message: 'Token tidak valid.', code: 'TOKEN_INVALID' })
    }

    const user = await User.findById(decoded.id).select('-password -refreshTokens').populate('company', 'name logo slug')
    if (!user) {
      return res.status(401).json({ success: false, message: 'Pengguna tidak ditemukan.' })
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Akun Anda telah dinonaktifkan.' })
    }

    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

// Optional auth (does not fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization
    if (!auth || !auth.startsWith('Bearer ')) return next()
    const token = auth.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET)
    req.user = await User.findById(decoded.id).select('-password -refreshTokens')
    next()
  } catch {
    next()
  }
}

module.exports = { protect, optionalAuth }
