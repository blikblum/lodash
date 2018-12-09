const fs = require('fs')
const rollup = require('rollup')
const minify = require('rollup-plugin-terser').terser
const analyze = require('rollup-plugin-analyzer').plugin

const extractIdRegex = /(\/|\\)([^\/\\]*)?\.js$/

function parseStats(entry, stats) {
  const result = {}
  result.name = entry.substr(0, entry.length - 3)
  result.size = stats.bundleSize
  result.dependencies = stats.modules
    .map(module => ({
      name: module.id.match(extractIdRegex)[2],
      size: module.size,
      percent: module.percent,
      internal: module.id.indexOf('.internal') !== -1,
      dependents: module.dependents.map(dependent => dependent.match(extractIdRegex)[2])
    }))
    .filter(dependency => dependency.name !== result.name)

  return result  
}

const entries = fs.readdirSync('.').filter(file => file.match(/^[^\.].*\.js$/))

const results = []

async function build() {
  for (entry of entries) {
    const bundle = await rollup.rollup({
      input: entry,      
      plugins: [
        minify(), 
        analyze({onAnalysis: result => {
          results.push(parseStats(entry, result))
        }})]
    });    

    await bundle.generate({
      file: `temp-size/${entry}`,
      format: 'esm'      
    });  
  }
}

build().then(() => fs.writeFileSync('size.json', JSON.stringify(results, null, 2)))


