'use strict'

const { body } = require('express-validator')
const db = require('@config/database')

class AuthValidator {
  // [POST] Sign up page
  signUp() {
    return [
      body('fullname')
        .exists()
        .withMessage('required')
        .notEmpty()
        .withMessage('empty')
        .isString()
        .withMessage('string')
        .trim(),
      body('username')
        .exists()
        .withMessage('required')
        .notEmpty()
        .withMessage('empty')
        .isString()
        .withMessage('string')
        .custom(async (username) => {
          const query = `SELECT username FROM users WHERE username = $1`
          const { rows } = await db.query(query, [username])

          if (rows.length > 0) throw new Error('already_exists')
          return true
        })
        .trim()
        .escape(),
      body('email')
        .exists()
        .withMessage('required')
        .notEmpty()
        .withMessage('empty')
        .isString()
        .withMessage('string')
        .isEmail()
        .withMessage('email')
        .isLength({ min: '6', max: '75' })
        .withMessage('length')
        .custom(async (email) => {
          const query = `SELECT email FROM users WHERE email = $1`
          const { rows } = await db.query(query, [email])

          if (rows.length > 0) throw new Error('already_exists')
          return true
        })
        .trim()
        .normalizeEmail(),
      body('password')
        .exists()
        .withMessage('required')
        .notEmpty()
        .withMessage('empty')
        .isString()
        .withMessage('string')
        .isLength({ min: '6', max: '75' })
        .withMessage('length')
        .trim()
        .escape()
    ]
  }

  // [POST] Sign in page
  signIn() {
    return [
      body('email')
        .exists()
        .withMessage('required')
        .notEmpty()
        .withMessage('empty')
        .isString()
        .withMessage('string')
        .isEmail()
        .withMessage('email')
        .isLength({ min: '6', max: '75' })
        .withMessage('length')
        .trim()
        .normalizeEmail(),
      body('password')
        .exists()
        .withMessage('required')
        .notEmpty()
        .withMessage('empty')
        .isString()
        .withMessage('string')
        .isLength({ min: '6', max: '75' })
        .withMessage('length')
        .trim()
        .escape()
    ]
  }
}

module.exports = new AuthValidator()
