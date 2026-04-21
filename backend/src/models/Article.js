const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
  title:   { type: String, required: true, trim: true },
  slug:    { type: String, unique: true },
  excerpt: { type: String, maxlength: 300 },
  content: { type: String, required: true },
  cover:   String,
  coverPublicId: String,

  author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: {
    type: String,
    enum: ['tips','interview','resume','salary','career','news'],
  },
  tags: [String],

  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  views:    { type: Number, default: 0 },
  readTime: Number,
}, { timestamps: true })

articleSchema.index({ slug: 1 })
articleSchema.index({ category: 1, isPublished: 1 })
articleSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' })

articleSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') +
                '-' + Date.now().toString(36)
  }
  if (!this.readTime && this.content) {
    this.readTime = Math.max(1, Math.round(this.content.split(/\s+/).length / 200))
  }
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  next()
})

module.exports = mongoose.model('Article', articleSchema)
