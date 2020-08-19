'use strict'

const express = require('express')
const router = express.Router()
const authService = require('@services/auth.service')
const authValidator = require('@validators/auth.validator')

router.get('/users', authService.users)
router.post('/signup', [authValidator.signUp()], authService.signUp)
router.post('/signin', [authValidator.signIn()], authService.signIn)
router.post('/verification/:token', authService.verification)

module.exports = router
