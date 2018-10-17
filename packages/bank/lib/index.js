const log = require('jm-log4js')
const Worker = require('worker')
const logger = log.getLogger('bank')

class Service extends Worker {
  constructor (app, opts = {}) {
    super(app, opts)

    this.bind('bank')

    app.on('user.update', message => {
      logger.debug('user.update', message)
      const {id} = message
      id && this.syncUser(id)
    })

    this.subscribe('user.update')
  }

  async syncUser (id) {
    try {
      const doc = await this.user.get(`/users/${id}`)
      if (!doc) return null

      const {uid} = doc
      const name = doc.name || doc.nick

      const data = {uid}
      name && (data.name = name)

      await this.bank.post(`/users/${id}`, data)
      logger.info(`sync user id: ${id} data: ${JSON.stringify(data)}`)
    } catch (e) {
      logger.error(e)
    }
  }

}

module.exports = function (opts = {}) {
  if (opts.debug) {
    logger.setLevel('debug')
  }
  const o = new Service(this, opts)
  return o
}
