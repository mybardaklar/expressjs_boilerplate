'use strict'

const express = require('express')
const app = express()

app.use('/', require('@routes/index.route'))
app.use('/auth', require('@routes/auth.route'))

module.exports = app
