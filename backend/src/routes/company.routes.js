const router = require('express').Router()
const ctrl   = require('../controllers/company.controller')
const { protect } = require('../middleware/auth')
const requireRole = require('../middleware/roleGuard')
const { uploadImage } = require('../config/cloudinary')

// ── Specific named routes MUST come before /:id ──────────
// Employer protected routes (specific paths first)
router.get('/employer/me',    protect, requireRole('employer'), ctrl.getMyCompany)
router.post('/employer/me',   protect, requireRole('employer'), ctrl.createCompany)
router.put('/employer/me',    protect, requireRole('employer'), ctrl.updateMyCompany)
router.post('/employer/logo', protect, requireRole('employer'), uploadImage.single('logo'), ctrl.uploadLogo)

// Public (wildcard after named routes)
router.get('/',    ctrl.getCompanies)
router.get('/:id', ctrl.getCompanyById)

module.exports = router
