const router = require('express').Router()
const ctrl   = require('../controllers/application.controller')
const { protect } = require('../middleware/auth')
const requireRole = require('../middleware/roleGuard')
const { uploadResume } = require('../config/cloudinary')

router.use(protect)

// ── Named/specific routes BEFORE /:id wildcard ───────────

// Seeker
router.post('/jobs/:id/apply',        requireRole('seeker'),   uploadResume.single('resume'), ctrl.applyToJob)
router.get('/my',                     requireRole('seeker'),   ctrl.getMyApplications)
router.get('/seeker/stats',           requireRole('seeker'),   ctrl.getSeekerStats)
router.delete('/:id/withdraw',        requireRole('seeker'),   ctrl.withdrawApplication)

// Employer
router.get('/jobs/:jobId/applicants', requireRole('employer'), ctrl.getJobApplicants)
router.get('/employer/all',          requireRole('employer'), ctrl.getAllApplicants)
router.get('/employer/stats',        requireRole('employer'), ctrl.getApplicationStats)
router.patch('/:id/status',           requireRole('employer'), ctrl.updateApplicationStatus)
router.patch('/:id/interview',        requireRole('employer'), ctrl.scheduleInterview)

// Shared — specific sub-paths before bare /:id
router.get('/:id/resume',  ctrl.getResumeUrl)

// ── /:id wildcard (must be last) ─────────────────────────
router.get('/:id', ctrl.getApplicationById)

module.exports = router
