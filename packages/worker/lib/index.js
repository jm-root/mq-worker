const event = require('jm-event')
const MS = require('jm-ms')
const ms = new MS()

class Service {
  constructor (opts = {}) {
    event.enableEvent(this)
    this.ready = true
    this.gateway = opts.gateway

    this.bind('user')
  }

  onReady () {
    return this.ready
  }

  async bind (name, uri) {
    uri || (uri = `/${name}`)
    let doc = await ms.client({uri: this.gateway + uri})
    this[name] = doc
    return doc
  }
}

module.exports = Service
