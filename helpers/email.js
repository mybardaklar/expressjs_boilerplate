'use strict'

const path = require('path')
const Email = require('email-templates')
const config = require('@/pxl.config')

class Mail {
  constructor() {
    this.template_str = null
    this.from_str = null
    this.to_str = null

    this.email = new Email({
      send: true,
      transport: {
        host: config.email.host,
        port: config.email.port,
        ssl: config.email.ssl,
        tls: config.email.tls,
        auth: config.email.auth
      }
    })
  }

  template(template) {
    this.template_str = path.join(
      process.cwd(),
      `${config.email.views}/${template}`
    )
    return this
  }

  from(from) {
    this.from_str = from
    return this
  }

  to(to) {
    this.to_str = to
    return this
  }

  send(locals) {
    this.email.send({
      template: this.template_str,
      message: {
        from: this.from_str,
        to: this.to_str
      },
      locals: locals
    })
  }
}

module.exports = new Mail()
