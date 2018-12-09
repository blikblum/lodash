const fs = require('fs')
const rollup = require('rollup')
const minify = require('rollup-plugin-terser').terser
const analyze = require('rollup-plugin-analyzer').plugin

const extractIdRegex = /(\/|\\)([^\/\\]*)?\.js$/

function parseStats(entry, stats) {  
  const name = entry.substr(0, entry.length - 3)  
  const modules = stats.modules.map(module => ({
    name: module.id.match(extractIdRegex)[2],
    size: module.size,
    percent: module.percent,
    internal: module.id.indexOf('.internal') !== -1,
    dependents: module.dependents.map(dependent => dependent.match(extractIdRegex)[2])
  }))
  const ownIndex = modules.findIndex(module => module.name === name)
  const ownModule = modules.splice(ownIndex, 1)[0]  
  return {
    name,
    size: stats.bundleSize,
    ownSize: ownModule.size,
    ownPercent: ownModule.percent,
    dependencies: modules
  }
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


