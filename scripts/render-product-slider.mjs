import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { renderProductBatch } from './render-products.mjs'

const renders = await renderProductBatch({preset:'slider',format:'webp',consistentFrame:true,
  directory:fileURLToPath(new URL('../src/assets/home/product-renders/',import.meta.url)),
  products:[{name:'medovuha',product:'mead-light'},{name:'sidr',product:'cider-antonovka'},{name:'puare',product:'perry-williams'}]})
const { frame:first } = renders[0].metadata
const frame = {width:first.width,height:first.height,heightScale:first.heightScale,topOffset:first.topOffset,center:first.center,origins:first.origins}
const metadataFile = new URL('../src/data/product-slider-renders.js',import.meta.url)
const metadata = await readFile(metadataFile,'utf8')
await writeFile(metadataFile,metadata.replace(/^export const productRenderFrame = .*$/m,`export const productRenderFrame = Object.freeze(${JSON.stringify(frame)})`))
console.info('frame:',frame)
