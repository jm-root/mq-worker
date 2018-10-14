const event = require('jm-event')
const MS = require('jm-ms')
const ms = new MS()

class Service {
  constructor (app, opts = {}) {
    event.enableEvent(this)
    this.ready = true
    this.app = app
    this.gateway = opts.gateway

    this.bind('user')
  }

  onReady () {
    return this.ready
  }

  subscribe (...args) {
    this.app.emit('subscribe', ...args)
  }

  async bind (name, uri) {
    uri || (uri = `/${name}`)
    let doc = await ms.client({uri: this.gateway + uri})
    this[name] = doc
    return doc
  }
}

module.exports = Service
