'use strict'

const { Pool } = require('pg')
const config = require('@/pxl.config')

const pool = new Pool({
  host: config.database.connect.host,
  port: config.database.connect.port,
  user: config.database.connect.user,
  password: config.database.connect.password,
  database: config.database.connect.database
})

pool.on('error', (error) => {
  console.error(error)
  process.exit(-1)
})

module.exports = pool
