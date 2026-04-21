const router = require('express').Router()
const ctrl   = require('../controllers/job.controller')
const { protect, optionalAuth } = require('../middleware/auth')
const requireRole = require('../middleware/roleGuard')

// ── All named/specific routes BEFORE any /:id wildcard ───
router.get('/featured',        ctrl.getFeaturedJobs)
router.get('/categories',      ctrl.getCategories)
router.get('/skills', ctrl.getSkills)
router.get('/recommended',     optionalAuth, ctrl.getRecommendedJobs)
router.get('/saved',           protect, requireRole('seeker'), ctrl.getSavedJobs)
router.get('/employer/my-jobs',protect, requireRole('employer'), ctrl.getEmployerJobs)
router.get('/employer/stats',  protect, requireRole('employer'), ctrl.getJobStats)

// ── Collection ────────────────────────────────────────────
router.get('/',   ctrl.getJobs)
router.post('/',  protect, requireRole('employer'), ctrl.createJob)

// ── /:id wildcard (must be last GET) ─────────────────────
router.get('/:id',           optionalAuth, ctrl.getJobById)
router.put('/:id',           protect, requireRole('employer'), ctrl.updateJob)
router.delete('/:id',        protect, requireRole('employer'), ctrl.deleteJob)
router.patch('/:id/toggle',  protect, requireRole('employer'), ctrl.toggleJobActive)
router.post('/:id/save',     protect, requireRole('seeker'),   ctrl.saveJob)
router.delete('/:id/save',   protect, requireRole('seeker'),   ctrl.unsaveJob)

module.exports = router
