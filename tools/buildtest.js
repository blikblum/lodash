const { rollup } = require('rollup')

async function build() {  
  const bundle = await rollup({
    input: 'index.js'
  });

  await bundle.write({
    file: `test-oldsuite/lodash-testbuild.js`,
    format: 'umd',
    name: '_'    
  });  
}

build()