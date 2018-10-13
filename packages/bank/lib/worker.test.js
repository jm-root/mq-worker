const Kafka = require('kafka-node')
const $ = require('./service')

let service = null
beforeAll(async () => {
  await $.onReady()
  service = $

  let consumer = new Kafka.Consumer(
    service.client,
    [
      {topic: 'pay.update'}
    ],
    {
      groupId: 'test'
    }
  )

  consumer.on('message', function (message) {
    console.log(message)
  })

})

test('produce', async () => {
  expect(1).toBeTruthy()
})
