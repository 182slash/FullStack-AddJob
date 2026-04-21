require('dotenv').config()
const app       = require('./src/app')
const connectDB = require('./src/config/db')

const PORT = process.env.PORT || 8080

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 AddJob API running on port ${PORT}`)
    console.log(`   ENV : ${process.env.NODE_ENV || 'development'}`)
    console.log(`   URL : http://localhost:${PORT}/api`)
    console.log(`   Health: http://localhost:${PORT}/api/health\n`)
  })

  // Graceful shutdown
  const graceful = (sig) => {
    console.log(`\n[${sig}] Shutting down gracefully...`)
    server.close(() => {
      console.log('HTTP server closed.')
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10000)
  }
  process.on('SIGTERM', () => graceful('SIGTERM'))
  process.on('SIGINT',  () => graceful('SIGINT'))
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err.message)
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
  process.exit(1)
})
