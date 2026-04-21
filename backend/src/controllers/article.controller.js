const Article = require('../models/Article')

// ── GET /api/articles ─────────────────────────────────────
exports.getArticles = async (req, res, next) => {
  try {
    const { q, category, page = 1, limit = 12 } = req.query
    const filter = { isPublished: true }
    if (category) filter.category = category
    if (q)        filter.$text = { $search: q }

    const total    = await Article.countDocuments(filter)
    const articles = await Article.find(filter)
      .select('-content')
      .populate('author', 'name avatar')
      .sort('-publishedAt -createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean()

    res.json({ success: true, data: articles, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } })
  } catch (err) { next(err) }
}

// ── GET /api/articles/:slug ───────────────────────────────
exports.getArticleBySlug = async (req, res, next) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug, isPublished: true })
      .populate('author', 'name avatar')
    if (!article) return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan.' })

    Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } }).exec()

    res.json({ success: true, data: article })
  } catch (err) { next(err) }
}

// ── POST /api/articles ────────────────────────────────────
exports.createArticle = async (req, res, next) => {
  try {
    const article = await Article.create({ ...req.body, author: req.user._id })
    res.status(201).json({ success: true, data: article })
  } catch (err) { next(err) }
}

// ── PUT /api/articles/:id ─────────────────────────────────
exports.updateArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!article) return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan.' })
    res.json({ success: true, data: article })
  } catch (err) { next(err) }
}
