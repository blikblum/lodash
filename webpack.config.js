const fs = require('fs')
const path = require('path')


const entries = fs.readdirSync('.').filter(file => file.match(/^[^\.].*\.js$/))

const entry = entries.reduce((result, file) => {    
  result[file] = `./${file}`
  return result
}, {})

module.exports = {
  entry,
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, 'temp-size')
  },
  mode: 'production'
}