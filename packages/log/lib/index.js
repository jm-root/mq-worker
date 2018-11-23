const log = require('jm-log4js')
const Worker = require('worker')
const logger = log.getLogger('log')

class Service extends Worker {
  constructor (app, opts = {}) {
    super(app, opts)

    this.bind('log')

    app
      .on('log', message => {
        this.saveLog({
          title: message
        })
      })
      .on('user.signon', (message, topic) => {
        logger.debug(topic, message)
        const opts = {
          category: topic,
          title: topic,
          data: message
        }
        this.saveLog(opts)
      })

    this.subscribe('log', 'user.signon')
  }

  async saveLog (opts) {
    if (!opts) return
    try {
      await this.log.post(`/logs`, opts)
      logger.info(`save log ${JSON.stringify(opts)}`)
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
