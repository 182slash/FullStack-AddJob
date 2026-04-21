const mongoose = require('mongoose')

// Separate lightweight profile document for extended seeker data
// (user.skills, user.education, user.experience are on the User model)
// This model is for any overflow or extended profile data
const seekerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // Extended social links
  githubUrl:   String,
  linkedinUrl: String,
  portfolioUrl:String,
  behanceUrl:  String,
  dribbbleUrl: String,

  // Certifications
  certifications: [{
    name:      { type: String, required: true },
    issuer:    String,
    issuedAt:  Date,
    expiresAt: Date,
    url:       String,
  }],

  // Language proficiencies
  languages: [{
    name:        String,
    proficiency: { type: String, enum: ['basic','intermediate','fluent','native'] },
    _id: false,
  }],

  // Job preferences
  preferredJobTypes:     [String],
  preferredLocations:    [String],
  preferredSalaryMin:    Number,
  noticePeriod:          { type: String, enum: ['immediately','1week','2weeks','1month','3months'] },
  isOpenToWork:          { type: Boolean, default: true },
  isOpenToRemote:        { type: Boolean, default: false },

  // Privacy
  showContactInfo:  { type: Boolean, default: true },
  profileVisibility:{ type: String, enum: ['public','private','employers_only'], default: 'public' },
}, { timestamps: true })

module.exports = mongoose.model('SeekerProfile', seekerProfileSchema)