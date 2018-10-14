const log = require('jm-log4js')
const Worker = require('worker')
const logger = log.getLogger('bank')

class Service extends Worker {
  constructor (app, opts = {}) {
    super(app, opts)

    app.on('bank.user.create', message => {
      logger.debug('bank.user.create', message)
    })

    this.subscribe('bank.user.create')
  }
}

module.exports = function (opts = {}) {
  if (opts.debug) {
    logger.setLevel('debug')
  }
  const o = new Service(this, opts)
  return o
}
