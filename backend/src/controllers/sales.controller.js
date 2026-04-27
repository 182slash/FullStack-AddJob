const User = require('../models/User')
const ReferralTransaction = require('../models/ReferralTransaction')

// ── GET /api/sales/me ────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('name email referralCode points role')
    if (user.role !== 'sales') {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' })
    }

    const transactions = await ReferralTransaction.find({ salesUserId: user._id })
      .populate('companyId', 'name logo')
      .sort({ createdAt: -1 })
      .limit(50)

    res.json({
      success: true,
      data: {
        name:         user.name,
        email:        user.email,
        referralCode: user.referralCode,
        points:       user.points,
        transactions,
      },
    })
  } catch (err) { next(err) }
}

// ── POST /api/sales/generate-code ───────────────────────
exports.generateCode = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (user.role !== 'sales') {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' })
    }

    const prefix = user.name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase()
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    user.referralCode = `${prefix}-${suffix}`
    await user.save({ validateBeforeSave: false })

    res.json({ success: true, data: { referralCode: user.referralCode } })
  } catch (err) { next(err) }
}

// ── GET /api/sales/admin/all ─────────────────────────────
// Super admin: all sales users with points + full transaction history
exports.getAllSales = async (req, res, next) => {
  try {
    const salesUsers = await User.find({ role: 'sales' })
      .select('name email referralCode points createdAt')
      .sort({ points: -1 })

    const data = await Promise.all(salesUsers.map(async (s) => {
      const transactions = await ReferralTransaction.find({ salesUserId: s._id })
        .populate('companyId', 'name')
        .sort({ createdAt: -1 })

      return {
        _id:          s._id,
        name:         s.name,
        email:        s.email,
        referralCode: s.referralCode,
        points:       s.points,
        createdAt:    s.createdAt,
        transactions,
      }
    }))

    res.json({ success: true, data })
  } catch (err) { next(err) }
}

// ── GET /api/sales/admin/monthly?month=3&year=2026 ───────
// Super admin: monthly breakdown grouped by sales user
exports.getMonthlyReport = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1
    const year  = parseInt(req.query.year)  || new Date().getFullYear()

    const startDate = new Date(year, month - 1, 1)
    const endDate   = new Date(year, month, 1)

    const transactions = await ReferralTransaction.find({
      createdAt: { $gte: startDate, $lt: endDate },
    })
      .populate('salesUserId', 'name email referralCode')
      .populate('companyId',   'name')
      .sort({ createdAt: -1 })

    // Group by sales user
    const grouped = {}
    transactions.forEach((t) => {
      const sid = t.salesUserId?._id?.toString()
      if (!sid) return
      if (!grouped[sid]) {
        grouped[sid] = {
          salesUser:    t.salesUserId,
          totalPoints:  0,
          transactions: [],
        }
      }
      grouped[sid].totalPoints += t.pointsAwarded
      grouped[sid].transactions.push(t)
    })

    const report = Object.values(grouped).sort((a, b) => b.totalPoints - a.totalPoints)

    res.json({ success: true, data: { month, year, report } })
  } catch (err) { next(err) }
}

// ── POST /api/sales/admin/create ─────────────────────────
exports.createSales = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi.' })
    }

    if (await User.findOne({ email })) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' })
    }

    const user = await User.create({ name, email, password, role: 'sales' })
    res.status(201).json({
      success: true,
      data: {
        _id:       user._id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        createdAt: user.createdAt,
      },
    })
  } catch (err) { next(err) }
}