const Application = require('../models/Application')
const Job         = require('../models/Job')
const Company     = require('../models/Company')
const User        = require('../models/User')
const email       = require('../config/email')
const { deleteFile } = require('../config/cloudinary')

// ── POST /api/applications/jobs/:id/apply ────────────────
exports.applyToJob = async (req, res, next) => {
  try {
    const jobId = req.params.id

    const job = await Job.findById(jobId).populate('company')
    if (!job) return res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan.' })
    if (!job.isActive) return res.status(400).json({ success: false, message: 'Lowongan ini sudah ditutup.' })
    if (job.deadline && new Date() > new Date(job.deadline)) {
      return res.status(400).json({ success: false, message: 'Batas waktu lamaran sudah lewat.' })
    }

    const existing = await Application.findOne({ job: jobId, applicant: req.user._id })
    if (existing) return res.status(409).json({ success: false, message: 'Anda sudah melamar lowongan ini.' })

    const resumeUrl       = req.file?.path      || req.user.resumeUrl
    const resumePublicId  = req.file?.filename  || req.user.resumePublicId

    if (!resumeUrl) return res.status(400).json({ success: false, message: 'CV wajib dilampirkan.' })

    const app = await Application.create({
      job:       jobId,
      applicant: req.user._id,
      company:   job.company._id,
      coverLetter:   req.body.coverLetter,
      portfolioUrl:  req.body.portfolioUrl,
      resumeUrl,
      resumePublicId,
      statusHistory: [{ status: 'pending', changedBy: req.user._id, changedAt: new Date() }],
    })

    // Update counts
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } })
    await Company.findByIdAndUpdate(job.company._id, { $inc: { 'stats.totalApplications': 1 } })

    // Emails (fire-and-forget)
    const employer = await User.findById(job.company.owner)
    Promise.all([
      email.sendApplicationConfirmation(req.user, job, job.company).catch(console.warn),
      employer ? email.sendNewApplicationNotification(employer, req.user, job).catch(console.warn) : null,
    ])

    await app.populate([
      { path: 'job', select: 'title location company' },
      { path: 'applicant', select: 'name email avatar' },
    ])

    res.status(201).json({ success: true, data: app, message: 'Lamaran berhasil dikirim!' })
  } catch (err) { next(err) }
}

// ── GET /api/applications/employer/all ───────────────────
exports.getAllApplicants = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const company = await Company.findOne({ owner: req.user._id })
    if (!company) return res.json({ success: true, data: [], pagination: { total: 0 } })

    const filter = { company: company._id }
    if (status && status !== 'all') filter.status = status

    const total = await Application.countDocuments(filter)
    const apps  = await Application.find(filter)
      .populate('applicant', 'name email avatar headline phone location skills resumeUrl')
      .populate('job', 'title location')
      .sort('-createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))

    res.json({ success: true, data: apps, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } })
  } catch (err) { next(err) }
}

// ── GET /api/applications/my ──────────────────────────────
exports.getMyApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = { applicant: req.user._id }
    if (status && status !== 'all') filter.status = status

    const total = await Application.countDocuments(filter)
    const apps  = await Application.find(filter)
      .populate({ path: 'job', populate: { path: 'company', select: 'name logo location' } })
      .sort('-createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))

    res.json({ success: true, data: apps, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } })
  } catch (err) { next(err) }
}

// ── GET /api/applications/:id ─────────────────────────────
exports.getApplicationById = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate('job')
      .populate('applicant', '-password -refreshTokens')
      .populate('company', 'name logo')

    if (!app) return res.status(404).json({ success: false, message: 'Lamaran tidak ditemukan.' })

    const isApplicant = app.applicant._id.toString() === req.user._id.toString()
    const isEmployer  = req.user.company && app.company._id.toString() === req.user.company.toString()
    if (!isApplicant && !isEmployer && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' })
    }

    res.json({ success: true, data: app })
  } catch (err) { next(err) }
}

// ── DELETE /api/applications/:id/withdraw ────────────────
exports.withdrawApplication = async (req, res, next) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, applicant: req.user._id })
    if (!app) return res.status(404).json({ success: false, message: 'Lamaran tidak ditemukan.' })

    const noWithdraw = ['hired', 'rejected', 'withdrawn']
    if (noWithdraw.includes(app.status)) {
      return res.status(400).json({ success: false, message: `Lamaran dengan status "${app.status}" tidak dapat ditarik.` })
    }

    app.status = 'withdrawn'
    app.statusHistory.push({ status: 'withdrawn', changedBy: req.user._id })
    await app.save()

    await Job.findByIdAndUpdate(app.job, { $inc: { applicantCount: -1 } })

    res.json({ success: true, message: 'Lamaran berhasil ditarik.' })
  } catch (err) { next(err) }
}

// ── GET /api/applications/jobs/:jobId/applicants ──────────
exports.getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params
    const { status, page = 1, limit = 20 } = req.query

    const job = await Job.findOne({ _id: jobId, postedBy: req.user._id })
    if (!job) return res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan atau Anda tidak memiliki akses.' })

    const filter = { job: jobId }
    if (status && status !== 'all') filter.status = status

const PLAN_CANDIDATE_LIMITS = { free: 15, basic: 75, pro: 300, premium: null }

    const total = await Application.countDocuments(filter)
    const apps  = await Application.find(filter)
      .populate('applicant', 'name email avatar headline phone location skills education experience resumeUrl')
      .sort('-createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))

    // Mark as read
    Application.updateMany({ job: jobId, isRead: false }, { isRead: true }).exec()

    const plan           = req.user.plan || 'free'
    const candidateLimit = PLAN_CANDIDATE_LIMITS[plan]

    // Get index of this job's applicants overall (not just this page)
    const allAppsForJob  = await Application.find({ job: jobId }).sort('-createdAt').select('_id').lean()
    const allowedIds     = new Set(
      candidateLimit === null
        ? allAppsForJob.map(a => a._id.toString())
        : allAppsForJob.slice(0, candidateLimit).map(a => a._id.toString())
    )

    const appsWithBlur = apps.map(app => {
      const isBlurred = !allowedIds.has(app._id.toString())
      if (!isBlurred) return app
      return {
        ...app.toObject(),
        isBlurred: true,
        applicant: {
          _id:      app.applicant._id,
          name:     '••••• •••••',
          email:    '•••••@•••••.com',
          avatar:   null,
          headline: '•••••••••••••••••',
          phone:    null,
          location: '•••••••',
          skills:   [],
          resumeUrl: null,
        },
        coverLetter: '•••••••••••••••••••••••••••••••••••••••••',
      }
    })

    res.json({ success: true, data: appsWithBlur, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }, candidateLimit, plan })
  } catch (err) { next(err) }
}

// ── PATCH /api/applications/:id/status ───────────────────
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note, interviewData } = req.body
    const VALID = ['reviewed','shortlist','interview','offered','rejected','hired']
    if (!VALID.includes(status)) {
      return res.status(400).json({ success: false, message: `Status tidak valid. Pilih: ${VALID.join(', ')}` })
    }

    const app = await Application.findById(req.params.id).populate('job').populate('applicant', 'name email')
    if (!app) return res.status(404).json({ success: false, message: 'Lamaran tidak ditemukan.' })

    // Ownership check
    const job = await Job.findOne({ _id: app.job._id, postedBy: req.user._id })
    if (!job) return res.status(403).json({ success: false, message: 'Akses ditolak.' })

    app.status = status
    app.statusHistory.push({ status, note, changedBy: req.user._id })

    if (status === 'interview' && interviewData) {
      app.interview = interviewData
    }

    await app.save()

    if (status === 'hired') {
      await Company.findByIdAndUpdate(app.company, { $inc: { 'stats.totalHired': 1 } })
    }

    // Notify seeker (fire-and-forget)
    email.sendStatusUpdateEmail(app.applicant, app, app.job).catch(console.warn)

    res.json({ success: true, data: app })
  } catch (err) { next(err) }
}

// ── GET /api/applications/employer/stats ─────────────────
exports.getApplicationStats = async (req, res, next) => {
  try {
    const company = await Company.findOne({ owner: req.user._id })
    if (!company) return res.json({ success: true, data: {} })

    const stats = await Application.aggregate([
      { $match: { company: company._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])

    const result = {}
    stats.forEach(s => { result[s._id] = s.count })
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

// ── GET /api/applications/seeker/stats ───────────────────
exports.getSeekerStats = async (req, res, next) => {
  try {
    const stats = await Application.aggregate([
      { $match: { applicant: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])
    const result = { total: 0 }
    stats.forEach(s => { result[s._id] = s.count; result.total += s.count })
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

// ── PATCH /api/applications/:id/interview ─────────────────
exports.scheduleInterview = async (req, res, next) => {
  try {
    const { scheduledAt, type, link, notes } = req.body
    const app = await Application.findById(req.params.id).populate('job')
    if (!app) return res.status(404).json({ success: false, message: 'Lamaran tidak ditemukan.' })

    const job = await Job.findOne({ _id: app.job._id, postedBy: req.user._id })
    if (!job) return res.status(403).json({ success: false, message: 'Akses ditolak.' })

    app.interview = { scheduledAt, type, link, notes }
    app.status = 'interview'
    app.statusHistory.push({ status: 'interview', note: `Interview dijadwalkan: ${new Date(scheduledAt).toLocaleDateString('id-ID')}`, changedBy: req.user._id })
    await app.save()

    res.json({ success: true, data: app, message: 'Jadwal interview berhasil disimpan.' })
  } catch (err) { next(err) }
}

// ── GET /api/applications/:id/resume ─────────────────────
// Returns resume URL for download (ownership verified)
exports.getResumeUrl = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id)
    if (!app) return res.status(404).json({ success: false, message: 'Lamaran tidak ditemukan.' })

    const isApplicant = app.applicant.toString() === req.user._id.toString()
    const job = await Job.findOne({ _id: app.job, postedBy: req.user._id })
    if (!isApplicant && !job) return res.status(403).json({ success: false, message: 'Akses ditolak.' })

    if (!app.resumeUrl) return res.status(404).json({ success: false, message: 'CV tidak tersedia.' })
    res.json({ success: true, data: { resumeUrl: app.resumeUrl } })
  } catch (err) { next(err) }
}
