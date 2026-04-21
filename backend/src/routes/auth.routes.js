const router = require('express').Router()
const { body } = require('express-validator')
const ctrl   = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth')
const validate   = require('../middleware/validate')
const { uploadImage } = require('../config/cloudinary')

const emailRule    = body('email').isEmail().normalizeEmail().withMessage('Email tidak valid.')
const passwordRule = body('password').isLength({ min: 8 }).withMessage('Password minimal 8 karakter.')

// Public
router.post('/register',
  [body('name').trim().notEmpty().withMessage('Nama wajib diisi.'), emailRule, passwordRule],
  validate, ctrl.register)

router.post('/pre-register',
  [body('name').trim().notEmpty().withMessage('Nama wajib diisi.'), emailRule, passwordRule],
  validate, ctrl.preRegister)

router.post('/login',     [emailRule, passwordRule], validate, ctrl.login)
router.post('/google',    ctrl.googleAuth)
router.post('/refresh',   ctrl.refreshToken)
router.post('/forgot-password', [emailRule], validate, ctrl.forgotPassword)
router.post('/reset-password',  ctrl.resetPassword)
router.get('/verify-email/:token', ctrl.verifyEmail)

// Protected
router.use(protect)
router.get('/me',     ctrl.getMe)
router.put('/me',     ctrl.updateMe)
router.put('/change-password', ctrl.changePassword)
router.post('/logout', ctrl.logout)
router.post('/avatar', uploadImage.single('avatar'), ctrl.uploadAvatar)

module.exports = router
