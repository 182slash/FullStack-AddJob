const router = require('express').Router()
const ctrl   = require('../controllers/subscription.controller')
const { protect } = require('../middleware/auth')
const requireRole  = require('../middleware/roleGuard')

router.get('/validate-referral/:code', ctrl.validateReferralCode)

router.use(protect)

router.get('/my-plan',       requireRole('employer'), ctrl.getMyPlan)
router.post('/purchase',     requireRole('employer'), ctrl.purchasePlan)

// Admin-only route for manual plan activation
router.post('/admin/activate', requireRole('superadmin'), ctrl.adminActivatePlan)

module.exports = router
