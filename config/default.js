const fs = require('fs')
const path = require('path')

const modules = {
  kafka: {}
}

// 自动加载工作模块
const dir = path.join(__dirname, '../packages')
fs.readdirSync(dir)
  .filter(file => fs.statSync(path.join(dir, file)).isDirectory() && file !== 'worker')
  .forEach(doc => {
    modules[doc] || (modules[doc] = {})
  })

module.exports = {
  modules
}
