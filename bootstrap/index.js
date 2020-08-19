'use strict'

const path = require('path')
const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const consola = require('consola')
const passport = require('passport')
const routes = require('./routes')
const config = require('@/pxl.config')

const app = express()

// Initialize middleware
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())

// Routes
app.use('/api', routes)

// Set the static paths
app.use(express.static(path.join(process.cwd(), 'static')))

// Error handling
app.use((error, req, res, next) => {
  const { statusCode, message, errorCode, data } = error
  return res.status(statusCode || 500).json({
    success: false,
    statusCode: statusCode || 500,
    errorCode: errorCode || '',
    message: message || 'Internal Server Error',
    ...data
  })
})

module.exports = async () => {
  try {
    // Listen the server
    await app.listen(config.port, config.host, () => {
      consola.ready({
        message: `Server listening on \`http://${config.host}:${config.port}/api\``,
        badge: true
      })
    })
  } catch (error) {
    console.error(error)
  }
}
