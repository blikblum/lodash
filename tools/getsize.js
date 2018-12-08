const fs = require('fs')
const rollup = require('rollup')
const minify = require('rollup-plugin-terser').terser
const analyze = require('rollup-plugin-analyzer').plugin

const entries = fs.readdirSync('.').filter(file => file.match(/^[^\.].*\.js$/))

const results = {}

async function build() {
  for (entry of entries) {
    const bundle = await rollup.rollup({
      input: entry,      
      plugins: [
        minify(), 
        analyze({onAnalysis: result => {
          results[entry] = result
        }})]
    });    

    await bundle.generate({
      file: `temp-size/${entry}`,
      format: 'esm'      
    });  
  }
}

build().then(() => fs.writeFileSync('size.json', JSON.stringify(results, null, 2)))


