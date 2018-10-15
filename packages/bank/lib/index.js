const log = require('jm-log4js')
const Worker = require('worker')
const logger = log.getLogger('bank')

class Service extends Worker {
  constructor (app, opts = {}) {
    super(app, opts)

    app.on('user.update', message => {
      logger.debug('user.update', message)
    })

    this.subscribe('user.update')
  }
}

module.exports = function (opts = {}) {
  if (opts.debug) {
    logger.setLevel('debug')
  }
  const o = new Service(this, opts)
  return o
}
