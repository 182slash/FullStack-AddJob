const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true },
  requirements:String,
  benefits:    String,

  company:  { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },

  location: { type: String, trim: true },
  remote:   { type: Boolean, default: false },
  workMode: { type: String, enum: ['onsite','remote','hybrid'], default: 'onsite' },

  type:     {
    type: String,
    enum: ['fulltime','parttime','contract','freelance','internship'],
    default: 'fulltime',
  },
  category:   { type: String, trim: true },
  experience: { type: String, enum: ['fresh','1-2','3-5','5+'] },

  salaryMin:    Number,
  salaryMax:    Number,
  isNegotiable: { type: Boolean, default: false },

  skills: [{ type: String, trim: true }],
  tags:   [{ type: String, trim: true }],

  slots:       { type: Number, default: 1, min: 1 },
  deadline:    Date,

  isActive:   { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isUrgent:   { type: Boolean, default: false },

  views:          { type: Number, default: 0 },
  applicantCount: { type: Number, default: 0 },
}, { timestamps: true, toJSON: { virtuals: true } })

// Indexes
jobSchema.index({ company: 1, isActive: 1 })
jobSchema.index({ postedBy: 1 })
jobSchema.index({ category: 1, isActive: 1 })
jobSchema.index({ location: 1, isActive: 1 })
jobSchema.index({ type: 1, isActive: 1 })
jobSchema.index({ isFeatured: 1, isActive: 1 })
jobSchema.index({ createdAt: -1 })
jobSchema.index({ title: 'text', description: 'text', requirements: 'text', tags: 'text' })

// isExpired virtual
jobSchema.virtual('isExpired').get(function () {
  if (!this.deadline) return false
  return new Date() > new Date(this.deadline)
})

module.exports = mongoose.model('Job', jobSchema)
