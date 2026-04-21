const Job     = require('../models/Job')
const Company = require('../models/Company')
const Application = require('../models/Application')

// ── GET /api/jobs ─────────────────────────────────────────
exports.getJobs = async (req, res, next) => {
  try {
    const {
      q, category, type, location, experience,
      salaryMin, salaryMax, remote, isFeatured,
      sort = '-createdAt', page = 1, limit = 12,
    } = req.query

    const filter = { isActive: true }
    if (q)         filter.$text = { $search: q }
    if (category)  filter.category  = category
    if (type)      filter.type       = type
    if (location)  filter.location   = new RegExp(location, 'i')
    if (experience)filter.experience = experience
    if (remote === 'true') filter.remote = true
    if (isFeatured === 'true') filter.isFeatured = true
    if (salaryMin) filter.salaryMax = { $gte: Number(salaryMin) }
    if (salaryMax) filter.salaryMin = { ...(filter.salaryMin || {}), $lte: Number(salaryMax) }

    const total = await Job.countDocuments(filter)
    const jobs  = await Job.find(filter)
      .populate('company', 'name logo location isVerified slug')
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean({ virtuals: true })

    res.json({
      success: true,
      data: jobs,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) },
    })
  } catch (err) { next(err) }
}

// ── GET /api/jobs/featured ────────────────────────────────
exports.getFeaturedJobs = async (req, res, next) => {
  try {
    let jobs = await Job.find({ isActive: true, isFeatured: true })
      .populate('company', 'name logo location isVerified slug')
      .sort('-createdAt')
      .limit(9)
      .lean({ virtuals: true })

    // Fallback to latest if not enough featured
    if (jobs.length < 3) {
      jobs = await Job.find({ isActive: true })
        .populate('company', 'name logo location isVerified slug')
        .sort('-createdAt')
        .limit(9)
        .lean({ virtuals: true })
    }

    res.json({ success: true, data: jobs })
  } catch (err) { next(err) }
}

// ── GET /api/jobs/categories ──────────────────────────────
exports.getCategories = async (req, res, next) => {
  try {
    const cats = await Job.aggregate([
      { $match: { isActive: true, category: { $exists: true, $ne: '' } } },
      { $group: { _id: '$category', jobCount: { $sum: 1 } } },
      { $sort: { jobCount: -1 } },
      { $project: { _id: 0, name: '$_id', jobCount: 1 } },
    ])
    res.json({ success: true, data: cats })
  } catch (err) { next(err) }
}
exports.getSkills = async (req, res, next) => {
  try {
    const result = await Job.aggregate([
      { $match: { isActive: true, skills: { $exists: true, $ne: [] } } },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, name: '$_id', count: 1 } },
    ])
    res.json({ success: true, data: result.map(s => s.name) })
  } catch (err) { next(err) }
}
// ── GET /api/jobs/:id ─────────────────────────────────────
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name logo location website description industry size isVerified slug socialMedia')
      .populate('postedBy', 'name avatar')
      .lean({ virtuals: true })

    if (!job) return res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan.' })

    // Increment view async
    Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec()

    res.json({ success: true, data: job })
  } catch (err) { next(err) }
}

// ── POST /api/jobs ────────────────────────────────────────
const PLAN_LIMITS = {
  free:    { jobs: 2,  candidates: 15,  days: 7  },
  basic:   { jobs: 5,  candidates: 75,  days: 15 },
  pro:     { jobs: 10, candidates: 300, days: 30 },
  premium: { jobs: 20, candidates: null, days: 30 },
}

exports.createJob = async (req, res, next) => {
  try {
    const company = await Company.findOne({ owner: req.user._id })
    if (!company) return res.status(400).json({ success: false, message: 'Buat profil perusahaan terlebih dahulu.' })

    const plan   = req.user.plan || 'free'
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free

    const activeJobCount = await Job.countDocuments({ postedBy: req.user._id, isActive: true })
    if (activeJobCount >= limits.jobs) {
      return res.status(403).json({
        success: false,
        message: `Paket ${plan} hanya dapat memposting ${limits.jobs} lowongan aktif. Upgrade paket untuk menambah lebih banyak lowongan.`,
        limitReached: true,
        limit: limits.jobs,
        current: activeJobCount,
      })
    }

    const expiresAt = new Date(Date.now() + limits.days * 24 * 60 * 60 * 1000)
    const job = await Job.create({ ...req.body, company: company._id, postedBy: req.user._id, deadline: req.body.deadline || expiresAt })

    await Company.findByIdAndUpdate(company._id, {
      $inc: { 'stats.totalJobs': 1, 'stats.activeJobs': 1 },
    })

    await job.populate('company', 'name logo location isVerified')
    res.status(201).json({ success: true, data: job })
  } catch (err) { next(err) }
}

// ── PUT /api/jobs/:id ─────────────────────────────────────
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id })
    if (!job) return res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan atau Anda tidak memiliki akses.' })

    const wasActive = job.isActive
    Object.assign(job, req.body)
    await job.save()

    // Update company stats when isActive changes
    if (req.body.isActive !== undefined && req.body.isActive !== wasActive) {
      await Company.findByIdAndUpdate(job.company, {
        $inc: { 'stats.activeJobs': req.body.isActive ? 1 : -1 },
      })
    }

    await job.populate('company', 'name logo location isVerified')
    res.json({ success: true, data: job })
  } catch (err) { next(err) }
}

// ── DELETE /api/jobs/:id ──────────────────────────────────
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id })
    if (!job) return res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan.' })

    await job.deleteOne()
    await Company.findByIdAndUpdate(job.company, {
      $inc: { 'stats.totalJobs': -1, ...(job.isActive ? { 'stats.activeJobs': -1 } : {}) },
    })

    res.json({ success: true, message: 'Lowongan berhasil dihapus.' })
  } catch (err) { next(err) }
}

// ── GET /api/jobs/employer/my-jobs ────────────────────────
exports.getEmployerJobs = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = { postedBy: req.user._id }
    if (status === 'active')   filter.isActive = true
    if (status === 'inactive') filter.isActive = false

    const total = await Job.countDocuments(filter)
    const jobs  = await Job.find(filter)
      .sort('-createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean({ virtuals: true })

    res.json({ success: true, data: jobs, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } })
  } catch (err) { next(err) }
}

// ── GET /api/jobs/employer/stats ──────────────────────────
exports.getJobStats = async (req, res, next) => {
  try {
    const company = await Company.findOne({ owner: req.user._id })
    if (!company) return res.json({ success: true, data: { activeJobs: 0, totalJobs: 0, totalViews: 0, totalApplications: 0, totalHired: 0 } })

    const [viewAgg] = await Job.aggregate([
      { $match: { postedBy: req.user._id } },
      { $group: { _id: null, totalViews: { $sum: '$views' }, totalJobs: { $sum: 1 }, activeJobs: { $sum: { $cond: ['$isActive', 1, 0] } } } },
    ])

    res.json({ success: true, data: {
      activeJobs:        viewAgg?.activeJobs        || company.stats.activeJobs,
      totalJobs:         viewAgg?.totalJobs         || company.stats.totalJobs,
      totalViews:        viewAgg?.totalViews        || 0,
      totalApplications: company.stats.totalApplications,
      totalHired:        company.stats.totalHired,
    }})
  } catch (err) { next(err) }
}

// ── POST /api/jobs/:id/save ───────────────────────────────
exports.saveJob = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user
    if (user.savedJobs?.includes(id)) {
      return res.status(409).json({ success: false, message: 'Lowongan sudah tersimpan.' })
    }
    const { protect } = require('../middleware/auth')
    const User = require('../models/User')
    await User.findByIdAndUpdate(user._id, { $addToSet: { savedJobs: id } })
    res.json({ success: true, message: 'Lowongan disimpan.' })
  } catch (err) { next(err) }
}

// ── DELETE /api/jobs/:id/save ─────────────────────────────
exports.unsaveJob = async (req, res, next) => {
  try {
    const User = require('../models/User')
    await User.findByIdAndUpdate(req.user._id, { $pull: { savedJobs: req.params.id } })
    res.json({ success: true, message: 'Lowongan dihapus dari simpanan.' })
  } catch (err) { next(err) }
}

// ── GET /api/jobs/saved ───────────────────────────────────
exports.getSavedJobs = async (req, res, next) => {
  try {
    const User = require('../models/User')
    const user = await User.findById(req.user._id).populate({
      path: 'savedJobs',
      populate: { path: 'company', select: 'name logo location isVerified' },
    })
    res.json({ success: true, data: user.savedJobs || [] })
  } catch (err) { next(err) }
}

// ── GET /api/jobs/recommended ─────────────────────────────
// Returns jobs matching seeker's skills/location (falls back to featured)
exports.getRecommendedJobs = async (req, res, next) => {
  try {
    let filter = { isActive: true }
    // If authenticated seeker, personalize
    if (req.user && req.user.role === 'seeker') {
      const conditions = []
      if (req.user.skills?.length)   conditions.push({ skills: { $in: req.user.skills } })
      if (req.user.location)         conditions.push({ location: new RegExp(req.user.location.split(',')[0], 'i') })
      if (conditions.length) filter.$or = conditions
    }
    let jobs = await Job.find(filter)
      .populate('company', 'name logo location isVerified slug')
      .sort('-createdAt')
      .limit(6)
      .lean({ virtuals: true })

    // Fallback to latest if personalization yields nothing
    if (jobs.length < 3) {
      jobs = await Job.find({ isActive: true })
        .populate('company', 'name logo location isVerified slug')
        .sort('-isFeatured -createdAt')
        .limit(6)
        .lean({ virtuals: true })
    }
    res.json({ success: true, data: jobs })
  } catch (err) { next(err) }
}

// ── PATCH /api/jobs/:id/toggle ────────────────────────────
exports.toggleJobActive = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id })
    if (!job) return res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan.' })
    job.isActive = !job.isActive
    await job.save()
    await Company.findByIdAndUpdate(job.company, {
      $inc: { 'stats.activeJobs': job.isActive ? 1 : -1 },
    })
    res.json({ success: true, data: { isActive: job.isActive } })
  } catch (err) { next(err) }
}
