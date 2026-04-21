const router = require('express').Router()
const ctrl   = require('../controllers/profile.controller')
const { protect } = require('../middleware/auth')
const requireRole = require('../middleware/roleGuard')
const { uploadResume } = require('../config/cloudinary')

router.use(protect, requireRole('seeker'))

router.get('/',            ctrl.getProfile)
router.put('/',            ctrl.updateProfile)
router.post('/upload-cv',  uploadResume.single('resume'), ctrl.uploadCV)
router.delete('/cv',       ctrl.deleteCV)

module.exports = router
