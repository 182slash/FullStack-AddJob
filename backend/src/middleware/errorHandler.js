const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message    = err.message    || 'Terjadi kesalahan pada server.'

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400
    message    = 'ID tidak valid.'
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0]
    statusCode  = 409
    message     = field === 'email'
      ? 'Email sudah terdaftar.'
      : `Data duplikat pada field: ${field}.`
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 422
    message    = Object.values(err.errors).map(e => e.message).join('. ')
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError')  { statusCode = 401; message = 'Token tidak valid.' }
  if (err.name === 'TokenExpiredError')  { statusCode = 401; message = 'Token kedaluwarsa.' }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE')    { statusCode = 413; message = 'Ukuran file melebihi batas yang diizinkan.' }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') { statusCode = 400; message = 'Field file tidak dikenali.' }

  // CORS error
  if (err.message?.includes('CORS')) { statusCode = 403 }

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, err)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

module.exports = errorHandler
