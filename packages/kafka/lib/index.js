const event = require('jm-event')
const log = require('jm-log4js')
const error = require('jm-err')
const Kafka = require('kafka-node')
const {URL} = require('url')

const logger = log.getLogger('kafka')

class Service {
  constructor (opts = {}) {
    event.enableEvent(this)
    this.ready = true
    const url = new URL(opts.kafka)
    const {protocol, host} = url
    if (protocol === 'zk:') {
      this.client = new Kafka.Client(host) // deprecated
    } else {
      this.client = new Kafka.KafkaClient({kafkaHost: host})
    }
  }

  onReady () {
    return this.ready
  }

  consume (obj, opts = {}) {
    const {topics, groupId = 'mqworker'} = opts
    if (!obj || !topics) throw error.err(error.Err.FA_PARAMS)

    const items = topics.map(topic => {
      return {topic}
    })

    logger.debug('consume', opts)
    const consumer = new Kafka.Consumer(
      this.client,
      items,
      {
        groupId
      }
    )

    consumer.on('message', function (message) {
      logger.debug(message)
      try {
        obj.emit('message', message)
      } catch (e) {
        logger.error(e)
      }
    })
  }

}

module.exports = function (opts = {}) {
  const o = new Service(opts)
  this.on('consume', (obj, opts) => {
    o.consume(obj, opts)
  })
  return o
}
