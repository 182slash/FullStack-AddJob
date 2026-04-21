const Company = require('../models/Company')
const Job     = require('../models/Job')
const User    = require('../models/User')
const { deleteFile } = require('../config/cloudinary')

// ── GET /api/companies ────────────────────────────────────
exports.getCompanies = async (req, res, next) => {
  try {
    const { q, industry, size, page = 1, limit = 20 } = req.query
    const filter = { isActive: true }
    if (q)        filter.$or = [{ name: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }]
    if (industry) filter.industry = industry
    if (size)     filter.size = size

    const total     = await Company.countDocuments(filter)
    const companies = await Company.find(filter)
      .sort('-stats.activeJobs -createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean()

    res.json({ success: true, data: companies, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } })
  } catch (err) { next(err) }
}

// ── GET /api/companies/:id ────────────────────────────────
exports.getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate('owner', 'name avatar')
    if (!company || !company.isActive) {
      return res.status(404).json({ success: false, message: 'Perusahaan tidak ditemukan.' })
    }
    const jobs = await Job.find({ company: company._id, isActive: true })
      .sort('-createdAt').limit(6).lean({ virtuals: true })

    res.json({ success: true, data: { ...company.toObject(), jobs } })
  } catch (err) { next(err) }
}

// ── GET /api/companies/employer/me ────────────────────────
exports.getMyCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({ owner: req.user._id })
    if (!company) return res.status(404).json({ success: false, message: 'Profil perusahaan belum dibuat.' })
    res.json({ success: true, data: company })
  } catch (err) { next(err) }
}

// ── POST /api/companies ───────────────────────────────────
exports.createCompany = async (req, res, next) => {
  try {
    const existing = await Company.findOne({ owner: req.user._id })
    if (existing) return res.status(409).json({ success: false, message: 'Anda sudah memiliki profil perusahaan.' })

    const company = await Company.create({ ...req.body, owner: req.user._id })
    await User.findByIdAndUpdate(req.user._id, { company: company._id })
    res.status(201).json({ success: true, data: company })
  } catch (err) { next(err) }
}

// ── PUT /api/companies/employer/me ────────────────────────
exports.updateMyCompany = async (req, res, next) => {
  try {
    const forbidden = ['owner','isVerified','stats']
    forbidden.forEach(f => delete req.body[f])

    const company = await Company.findOneAndUpdate(
      { owner: req.user._id },
      { $set: req.body },
      { new: true, runValidators: false }
    )
    if (!company) return res.status(404).json({ success: false, message: 'Profil perusahaan tidak ditemukan.' })
    res.json({ success: true, data: company })
  } catch (err) { next(err) }
}

// ── POST /api/companies/employer/logo ─────────────────────
exports.uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'File tidak ditemukan.' })
    const company = await Company.findOne({ owner: req.user._id })
    if (!company) return res.status(404).json({ success: false, message: 'Perusahaan tidak ditemukan.' })

    if (company.logoPublicId) await deleteFile(company.logoPublicId)

    company.logo         = req.file.path  
    company.logoPublicId = req.file.filename       
    await company.save()

    res.json({ success: true, data: { logo: company.logo } })
  } catch (err) { next(err) }
}
