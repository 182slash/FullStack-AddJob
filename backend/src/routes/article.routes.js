const router = require('express').Router()
const ctrl   = require('../controllers/article.controller')
const { protect } = require('../middleware/auth')
const requireRole = require('../middleware/roleGuard')

// Public
router.get('/',      ctrl.getArticles)
router.get('/:slug', ctrl.getArticleBySlug)

// Admin only
router.post('/',    protect, requireRole('admin'), ctrl.createArticle)
router.put('/:id',  protect, requireRole('admin'), ctrl.updateArticle)

module.exports = router
