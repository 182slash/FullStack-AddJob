/**
 * Usage: router.post('/', protect, requireRole('employer'), handler)
 *        router.post('/', protect, requireRole('seeker', 'admin'), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Autentikasi diperlukan.' })
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Akses ditolak. Diperlukan role: ${roles.join(' atau ')}.`,
    })
  }
  next()
}

module.exports = requireRole
