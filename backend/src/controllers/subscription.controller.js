const User                 = require('../models/User')
const Company              = require('../models/Company')
const ReferralTransaction  = require('../models/ReferralTransaction')

const PLAN_POINTS = { free: 0, basic: 1, pro: 2, premium: 3 }

// ── POST /api/subscription/purchase ───────────────────────
exports.purchasePlan = async (req, res, next) => {
  try {
    const { plan } = req.body
    if (!['free', 'basic', 'pro', 'premium'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Plan tidak valid.' })
    }

    // Update employer's plan
    const employer = await User.findByIdAndUpdate(
      req.user._id,
      { plan, planExpiresAt: plan === 'free' ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { new: true }
    )

    // Award referral points if company was referred
    const company = await Company.findOne({ owner: req.user._id })
    if (company?.referredBy) {
      const points = PLAN_POINTS[plan]
      if (points > 0) {
        const salesUser = await User.findOne({ referralCode: company.referredBy, role: 'sales' })
        if (salesUser) {
          await User.findByIdAndUpdate(salesUser._id, { $inc: { points } })
          await ReferralTransaction.create({
            salesUserId:   salesUser._id,
            companyId:     company._id,
            plan,
            pointsAwarded: points,
          })
        }
      }
    }

    res.json({ success: true, message: `Paket ${plan} berhasil diaktifkan.`, data: { plan: employer.plan, planExpiresAt: employer.planExpiresAt } })
  } catch (err) { next(err) }
}

// ── GET /api/subscription/my-plan ─────────────────────────
exports.getMyPlan = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('plan planExpiresAt')
    res.json({ success: true, data: { plan: user.plan, planExpiresAt: user.planExpiresAt } })
  } catch (err) { next(err) }
}

// ── GET /api/subscription/validate-referral/:code ─────────
exports.validateReferralCode = async (req, res, next) => {
  try {
    const salesUser = await User.findOne({ referralCode: req.params.code.toUpperCase(), role: 'sales' })
    if (!salesUser) {
      return res.status(404).json({ success: false, message: 'Kode referral tidak ditemukan.' })
    }
    res.json({ success: true, message: 'Kode referral valid.', data: { name: salesUser.name } })
  } catch (err) { next(err) }
}

// ── POST /api/subscription/admin/activate ─────────────────
exports.adminActivatePlan = async (req, res, next) => {
  try {
    const { email, plan, durationDays, referralCode } = req.body
    // Validate input
    if (!email || !plan) {
      return res.status(400).json({ success: false, message: 'Email dan plan wajib diisi.' })
    }

    if (!['free', 'basic', 'pro', 'premium'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Plan tidak valid.' })
    }

    // Find employer
    const employer = await User.findOne({ email, role: 'employer' })
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer tidak ditemukan.' })
    }

    // Calculate expiry date
    let planExpiresAt = undefined
    if (plan !== 'free' && durationDays) {
      planExpiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
    }

    // Update user plan
    const updateData = { plan }
    if (planExpiresAt) {
      updateData.planExpiresAt = planExpiresAt
    } else {
      updateData.$unset = { planExpiresAt: '' }
    }
    
    await User.findByIdAndUpdate(employer._id, updateData)

    // Award referral points if applicable
    let pointsAwarded = false
    let salesUserName = null
    const points = PLAN_POINTS[plan]

    if (points > 0) {
      const company = await Company.findOne({ owner: employer._id })
      // If referralCode provided and company has no referredBy, set it now
if (referralCode && company && !company.referredBy) {
  await Company.findByIdAndUpdate(company._id, { referredBy: referralCode.toUpperCase() })
  company.referredBy = referralCode.toUpperCase()
}
      if (company?.referredBy) {
        const salesUser = await User.findOne({ 
          referralCode: company.referredBy, 
          role: 'sales' 
        })

        if (salesUser) {
          // Check for duplicate transaction to prevent double-awarding
          const existingTransaction = await ReferralTransaction.findOne({
            companyId: company._id,
            plan: plan
          })

          if (!existingTransaction) {
            // Award points
            await User.findByIdAndUpdate(salesUser._id, { $inc: { points } })

            // Create transaction record
            await ReferralTransaction.create({
              salesUserId: salesUser._id,
              companyId: company._id,
              plan,
              pointsAwarded: points,
            })

            pointsAwarded = true
            salesUserName = salesUser.name
          }
        }
      }
    }

    res.json({
      success: true,
      message: 'Plan berhasil diaktifkan.',
      data: {
        email: employer.email,
        name: employer.name,
        plan,
        planExpiresAt,
        referralPoints: pointsAwarded ? {
          awarded: points,
          to: salesUserName
        } : null
      }
    })

  } catch (err) { 
    next(err) 
  }
}
