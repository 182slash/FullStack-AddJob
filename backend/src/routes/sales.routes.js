const router      = require('express').Router()
const ctrl        = require('../controllers/sales.controller')
const { protect } = require('../middleware/auth')
const requireRole = require('../middleware/roleGuard')

router.use(protect)

// Sales rep routes
router.get('/me',             requireRole('sales'),       ctrl.getMe)
router.post('/generate-code', requireRole('sales'),       ctrl.generateCode)

// Super admin routes
router.get('/admin/all',     requireRole('superadmin'),   ctrl.getAllSales)
router.get('/admin/monthly', requireRole('superadmin'),   ctrl.getMonthlyReport)

module.exports = router