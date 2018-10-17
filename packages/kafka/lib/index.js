const event = require('jm-event')
const log = require('jm-log4js')
const error = require('jm-err')
const {ConsumerGroup} = require('kafka-node')
const {URL} = require('url')
const logger = log.getLogger('kafka')

class Service {
  constructor (app, opts = {}) {
    event.enableEvent(this)
    this.app = app
    this.ready = true
    this.config = opts
    this.topics = new Set()
  }

  onReady () {
    return this.ready
  }

  createConsumerGroup (opts) {
    const {app} = this
    const {kafka, id, groupId = 'mq_worker', topics = []} = opts

    const consumerOptions = {
      groupId,
      sessionTimeout: 15000,
      protocol: ['roundrobin'],
      fromOffset: 'earliest'
    }

    const url = new URL(kafka)
    const {protocol, host} = url
    if (protocol === 'zk:') {
      consumerOptions.host = host
    } else {
      consumerOptions.kafkaHost = host
    }

    id && (consumerOptions.id = id)
    logger.debug(`createConsumerGroup`, consumerOptions, topics)
    const consumerGroup = new ConsumerGroup(consumerOptions, topics)

    function onError (e) {
      logger.error(e)
    }

    function onMessage (message) {
      const {topic, partition, offset} = message
      let {value} = message
      const {clientId} = this.client
      logger.debug(`${clientId} read msg Topic="${topic}" Partition=${partition} Offset=${offset} Value=${value}`)
      try {
        value = JSON.parse(value)
      } catch (e) {
      }
      try {
        app.emit(topic, value)
      } catch (e) {
        logger.error(e)
      }
    }

    consumerGroup.on('error', onError)
    consumerGroup.on('message', onMessage)

    process.once('SIGINT', function () {
      consumerGroup.close()
    })

    return consumerGroup
  }

  subscrible (...args) {
    let s = new Set()
    args.forEach(arg => {
      if (typeof arg === 'string') {
        s.add(arg)
      } else if (Array.isArray(arg)) {
        s = new Set([...s, ...arg])
      }
    })

    if (!s.size) throw error.err(error.Err.FA_PARAMS)

    const v = []
    s.forEach(topic => {
      if (!this.topics.has(topic)) {
        v.push(topic)
        this.topics.add(topic)
      }
    })

    if (v.length) {
      const opts = Object.assign(this.config, {topics: v})
      this.createConsumerGroup(opts)
      logger.info('subscribe', v)
    }
  }
}

module.exports = function (opts = {}) {
  if (opts.debug) {
    logger.setLevel('debug')
  }
  const o = new Service(this, opts)
  this.on('subscribe', () => {
    o.subscrible(...arguments)
  })
  return o
}
