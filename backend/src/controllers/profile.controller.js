const User          = require('../models/User')
const SeekerProfile = require('../models/SeekerProfile')
const { deleteFile } = require('../config/cloudinary')

// ── GET /api/profile ──────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user    = await User.findById(req.user._id).populate('company', 'name logo')
    const profile = await SeekerProfile.findOne({ user: req.user._id })
    res.json({ success: true, data: { ...user.toObject(), extended: profile || {} } })
  } catch (err) { next(err) }
}

// ── PUT /api/profile ──────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const forbidden = ['password','email','role','isVerified','googleId','refreshTokens','company']
    forbidden.forEach(f => delete req.body[f])

    const {
      // Extended profile fields
      githubUrl, linkedinUrl, portfolioUrl, behanceUrl,
      certifications, languages, preferredJobTypes, preferredLocations,
      preferredSalaryMin, noticePeriod, isOpenToWork, isOpenToRemote,
      showContactInfo, profileVisibility,
      // rest goes to User model
      ...userFields
    } = req.body

    const user = await User.findByIdAndUpdate(req.user._id, userFields, { new: true, runValidators: true })

    // Upsert extended profile
    const extendedFields = { githubUrl, linkedinUrl, portfolioUrl, behanceUrl, certifications, languages, preferredJobTypes, preferredLocations, preferredSalaryMin, noticePeriod, isOpenToWork, isOpenToRemote, showContactInfo, profileVisibility }
    const cleaned = Object.fromEntries(Object.entries(extendedFields).filter(([,v]) => v !== undefined))

    let profile = null
    if (Object.keys(cleaned).length > 0) {
      profile = await SeekerProfile.findOneAndUpdate({ user: req.user._id }, { $set: cleaned }, { new: true, upsert: true })
    }

    res.json({ success: true, data: { ...user.toObject(), extended: profile || {} } })
  } catch (err) { next(err) }
}

// ── POST /api/profile/upload-cv ───────────────────────────
exports.uploadCV = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'File CV tidak ditemukan.' })

    const user = await User.findById(req.user._id)

    // Delete old CV from Wasabi
    if (user.resumePublicId) await deleteFile(user.resumePublicId)

    user.resumeUrl      = req.file.path  
    user.resumePublicId = req.file.filename       
    await user.save({ validateBeforeSave: false })

    res.json({ success: true, data: { resumeUrl: user.resumeUrl }, message: 'CV berhasil diupload.' })
  } catch (err) { next(err) }
}
// ── DELETE /api/profile/cv ────────────────────────────────
exports.deleteCV = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (user.resumePublicId) await deleteFile(user.resumePublicId)
    user.resumeUrl      = undefined
    user.resumePublicId = undefined
    await user.save({ validateBeforeSave: false })
    res.json({ success: true, message: 'CV berhasil dihapus.' })
  } catch (err) { next(err) }
}
