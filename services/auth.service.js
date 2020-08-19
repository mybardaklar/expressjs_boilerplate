'use strict'

const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const db = require('@config/database')
const ErrorHandler = require('@helpers/errorHandler')
const sendEmail = require('@helpers/email')

class AuthService {
  async users(req, res, next) {
    try {
      const { rows } = await db.query(`SELECT * from users`)

      await rows.forEach((user) => {
        delete user.password
        delete user.verification_token
      })

      res.status(200).json({
        success: true,
        statusCode: 200,
        users: rows
      })
    } catch (error) {
      console.error(error)
      return next(error)
    }
  }

  async signUp(req, res, next) {
    try {
      // validation
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ErrorHandler(
          422,
          'Please fix validation errors and try again.',
          'ValidationError',
          {
            errors: errors.mapped()
          }
        )
      }

      // hashing password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(req.body.password, salt)

      // generate verification token
      const payload = {
        email: req.body.email,
        code: Math.floor(100000 + Math.random() * 900000)
      }
      const verification_token = await jwt.sign(payload, process.env.APP_KEY, {
        expiresIn: '2h'
      })

      // create user
      const userQuery_insert = await db.query(
        `INSERT INTO users (fullname, username, email, password, verification_token) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [
          req.body.fullname,
          req.body.username,
          req.body.email,
          hashedPassword,
          verification_token
        ]
      )

      // send verification link and code to email
      await sendEmail
        .template('welcome')
        .from('from@example.com')
        .to('to@example.com')
        .send({
          username: userQuery_insert.rows[0].username,
          link: `${process.env.APP_URL}/auth/verification/${userQuery_insert.rows[0].verification_token}`,
          code: await jwt.verify(
            userQuery_insert.rows[0].verification_token,
            process.env.APP_KEY
          ).code
        })

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message:
          'Successfully signed up and verification code sent to your email.'
      })
    } catch (error) {
      console.error(error)
      return next(error)
    }
  }

  async signIn(req, res, next) {
    try {
      // validation
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ErrorHandler(
          422,
          'Please fix validation errors and try again.',
          'ValidationError',
          {
            errors: errors.mapped()
          }
        )
      }

      // query
      const userQuery_select = await db.query(
        `SELECT * FROM users WHERE email = $1`,
        [req.body.email]
      )

      // checking email address
      if (!userQuery_select.rows[0]) {
        throw new ErrorHandler(
          401,
          'Email is not correct. Please try again.',
          'AuthenticationError'
        )
      }

      // checking password
      const validPassword = await bcrypt.compare(
        req.body.password,
        userQuery_select.rows[0].password
      )
      if (!validPassword) {
        throw new ErrorHandler(
          401,
          'Password is not correct. Please try again.',
          'AuthenticationError'
        )
      }

      // checking verified
      if (!userQuery_select.rows[0].verified) {
        throw new ErrorHandler(
          401,
          'Please verify your membership and try again.',
          'AuthenticationError'
        )
      }

      const tokenPayload = {
        id: userQuery_select.rows[0].id,
        username: userQuery_select.rows[0].username,
        email: userQuery_select.rows[0].email
      }
      let token

      if (req.query.remember_me) {
        token = jwt.sign(tokenPayload, process.env.APP_KEY)
      } else {
        token = jwt.sign(tokenPayload, process.env.APP_KEY, {
          expiresIn: '1d'
        })
      }

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Successfully signed in.',
        data: {
          user: tokenPayload,
          token: {
            type: 'Bearer',
            encoded: token
          }
        }
      })
    } catch (error) {
      console.error(error)
      return next(error)
    }
  }

  async verification(req, res, next) {
    try {
      const token = await jwt.verify(req.params.token, process.env.APP_KEY)

      const userQuery_select = await db.query(
        `SELECT * FROM users WHERE verification_token = $1 AND email = $2`,
        [req.params.token, token.email]
      )

      if (!userQuery_select.rows[0]) {
        throw new ErrorHandler(
          500,
          'This token is invalid. Please check your token and try again.',
          'InvalidToken'
        )
      }

      if (token.code !== parseInt(req.body.code)) {
        throw new ErrorHandler(
          500,
          'Verification code is not correct. Please check your verification code and try again.',
          'InvalidCode'
        )
      }

      await db.query(
        'UPDATE users SET verified = $1, verification_token = $2 WHERE email = $3',
        [true, null, userQuery_select.rows[0].email]
      )

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Your membership has been approved.'
      })
    } catch (error) {
      console.error(error)
      return next(error)
    }
  }
}

module.exports = new AuthService()
