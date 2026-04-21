const mongoose = require('mongoose')

const referralTransactionSchema = new mongoose.Schema({
  salesUserId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  plan:          { type: String, enum: ['free', 'basic', 'pro', 'premium'], required: true },
  pointsAwarded: { type: Number, required: true },
}, { timestamps: true })

referralTransactionSchema.index({ salesUserId: 1 })
referralTransactionSchema.index({ companyId: 1 })

module.exports = mongoose.model('ReferralTransaction', referralTransactionSchema)