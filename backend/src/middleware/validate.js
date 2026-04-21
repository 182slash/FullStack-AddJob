const { validationResult } = require('express-validator')

/**
 * Run after express-validator chains:
 * router.post('/', [...validators], validate, controller)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const msg = errors.array().map(e => e.msg).join('. ')
    return res.status(422).json({
      success: false,
      message: msg,
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    })
  }
  next()
}

module.exports = validate
