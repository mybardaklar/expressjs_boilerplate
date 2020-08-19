'use strict'

const express = require('express')
const router = express.Router()
const indexService = require('@services/index.service')

router.get('/', indexService.index)

module.exports = router
