const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')
const crypto   = require('crypto')

const educationSchema = new mongoose.Schema({
  school:    { type: String, required: true },
  degree:    String,
  field:     String,
  startYear: Number,
  endYear:   Number,
  current:   { type: Boolean, default: false },
  gpa:       String,
}, { _id: true })

const experienceSchema = new mongoose.Schema({
  company:   { type: String, required: true },
  title:     { type: String, required: true },
  location:  String,
  startDate: Date,
  endDate:   Date,
  current:   { type: Boolean, default: false },
  desc:      String,
}, { _id: true })

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, maxlength: 100 },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, minlength: 8, select: false },
  phone:    { type: String, trim: true },
  role: { type: String, enum: ['seeker', 'employer', 'admin', 'sales'], default: 'seeker' },

  // Profile
  avatar:   String,
  avatarPublicId: String,
  headline: String,
  bio:      { type: String, maxlength: 800 },
  location: String,
  website:  String,

  // Seeker fields
  skills:     [{ type: String, trim: true }],
  education:  [educationSchema],
  experience: [experienceSchema],
  resumeUrl:  String,
  resumePublicId: String,
  savedJobs:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

  // Pre-registration
  major:          { type: String, trim: true },
  preRegistered:  { type: Boolean, default: false },

  // Employer field
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  plan:        { type: String, enum: ['free', 'basic', 'pro', 'premium', 'enterprise'], default: 'free' },
  planExpiresAt: Date,

  // Sales field
  referralCode: { type: String, unique: true, sparse: true, uppercase: true },
  points:       { type: Number, default: 0 },

  // Auth
  googleId:      String,
  isActive:      { type: Boolean, default: true },
  isVerified:    { type: Boolean, default: false },
  verifyToken:   { type: String, select: false },
  verifyExpires: { type: Date,   select: false },
  refreshTokens: { type: [String], select: false },
  resetToken:    { type: String, select: false },
  resetExpires:  { type: Date,   select: false },
  lastLogin:     Date,
}, { timestamps: true, toJSON: { virtuals: true } })

// Indexes
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ googleId: 1 }, { sparse: true })

// Profile completion virtual
userSchema.virtual('profileComplete').get(function () {
  if (this.role !== 'seeker') return 100
  const fields = [
    this.name, this.email, this.phone, this.location, this.bio,
    this.headline, this.resumeUrl,
    this.skills?.length > 0,
    this.education?.length > 0,
    this.experience?.length > 0,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
})

// Hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false
  return bcrypt.compare(candidate, this.password)
}

// Generate verification token
userSchema.methods.createVerifyToken = function () {
  const token = crypto.randomBytes(32).toString('hex')
  this.verifyToken   = crypto.createHash('sha256').update(token).digest('hex')
  this.verifyExpires = Date.now() + 24 * 60 * 60 * 1000 // 24h
  return token
}

// Generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex')
  this.resetToken   = crypto.createHash('sha256').update(token).digest('hex')
  this.resetExpires = Date.now() + 30 * 60 * 1000 // 30min
  return token
}

module.exports = mongoose.model('User', userSchema)
