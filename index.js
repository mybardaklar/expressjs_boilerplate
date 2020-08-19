'use strict'

require('dotenv-expand')(require('dotenv').config())
require('module-alias/register')

// Start the server
const startApp = require('@/bootstrap')
startApp()
