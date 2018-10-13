const Worker = require('worker')

class Service extends Worker {
  constructor (opts = {}) {
    super(opts)

    this.on('message', message => {
      console.log('bank worker', message)
    })
  }
}

module.exports = function (opts = {}) {
  const o = new Service(opts)
  this.emit(
    'consume',
    o,
    {
      topics: ['bank.user.create']
    }
  )
  return o
}
