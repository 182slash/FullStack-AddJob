const mongoose = require('mongoose')

const companySchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  slug:  { type: String, unique: true },
  logo:  String,
  logoPublicId: String,
  cover: String,
  coverPublicId: String,

  industry: String,
  size: { type: String, enum: ['1-10','11-50','51-200','201-500','500+'] },
  type: { type: String, enum: ['PT','CV','Firma','Perseorangan','UMKM','startup','corporate','agency','nonprofit','government','other'] },
  founded: String,

  website:  String,
  location: String,
  description: { type: String, maxlength: 3000 },
  culture:     String,
  benefits:    [String],

  socialMedia: {
    linkedin:  String,
    twitter:   String,
    instagram: String,
    facebook:  String,
  },

  isVerified: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },

  owner:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nib:        { type: String, trim: true },
  npwp:       { type: String, trim: true },
  email:      { type: String, trim: true },
  phone:      { type: String, trim: true },
  referredBy: { type: String, uppercase: true, trim: true },

  stats: {
    totalJobs:         { type: Number, default: 0 },
    activeJobs:        { type: Number, default: 0 },
    totalApplications: { type: Number, default: 0 },
    totalHired:        { type: Number, default: 0 },
  },
}, { timestamps: true, toJSON: { virtuals: true } })

companySchema.index({ owner: 1 }, { unique: true })
companySchema.index({ slug: 1 })
companySchema.index({ industry: 1 })
companySchema.index({ isActive: 1 })

companySchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') +
                '-' + Date.now().toString(36)
  }
  next()
})

module.exports = mongoose.model('Company', companySchema)
