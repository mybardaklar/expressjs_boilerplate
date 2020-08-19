'use strict'

class IndexService {
  async index(req, res, next) {
    return res.send({
      message: 'Hello world!'
    })
  }
}

module.exports = new IndexService()
