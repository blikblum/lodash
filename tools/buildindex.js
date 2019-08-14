const fs = require('fs')

const extractNameRegex = /^(.+)\.js$/

const files = fs.readdirSync('.').filter(file => {
  return file.match(/^[^\.].*\.js$/) && file !== 'index.js'
})

const contents = []

for (let file of files) {
  contents.push(`export { default as ${ file.match(extractNameRegex)[1] } } from './${file}';`)
}

fs.writeFileSync('index.js', contents.join('\n'))

