const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema({
  job:       { type: mongoose.Schema.Types.ObjectId, ref: 'Job',     required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  company:   { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },

  coverLetter:    String,
  resumeUrl:      String,
  resumePublicId: String,
  portfolioUrl:   String,

  status: {
    type: String,
    enum: ['pending','reviewed','shortlist','interview','offered','rejected','withdrawn','hired'],
    default: 'pending',
  },

  statusHistory: [{
    status:    String,
    note:      String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
  }],

  interview: {
    scheduledAt: Date,
    type:  { type: String, enum: ['online','onsite','phone'] },
    link:  String,
    notes: String,
  },

  employerNote: String,
  isRead:       { type: Boolean, default: false },
}, { timestamps: true })

// Prevent duplicate application
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true })
applicationSchema.index({ applicant: 1, status: 1 })
applicationSchema.index({ job: 1, status: 1 })
applicationSchema.index({ company: 1 })
applicationSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Application', applicationSchema)
