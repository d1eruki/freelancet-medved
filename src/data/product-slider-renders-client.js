import { categoryGlasses } from './category-glasses.js'
import meadPairShadow from '../assets/home/product-renders/medovuha-pair-shadow.webp?responsive'
import ciderPairShadow from '../assets/home/product-renders/sidr-pair-shadow.webp?responsive'
import perryPairShadow from '../assets/home/product-renders/puare-pair-shadow.webp?responsive'

export const productSliderRenders = Object.freeze({
  medovuha: { pair: { ...categoryGlasses.medovuha, slider: {"heightScale":0.8899389432714035,"topOffset":0.8058916492771317,"leftOffset":50.072088398079615,"center":50,"origin":"49.938931162076614% 95.69752738359938%"} }, pairShadow: meadPairShadow },
  sidr: { pair: { ...categoryGlasses.sidr, slider: {"heightScale":0.8817553949984888,"topOffset":1.33224544324715,"leftOffset":50.072088398079615,"center":50.17482517482518,"origin":"50.11404478620373% 95.98875502159154%"} }, pairShadow: ciderPairShadow },
  puare: { pair: { ...categoryGlasses.puare, slider: {"heightScale":0.871393900888323,"topOffset":1.8382813903367687,"leftOffset":50.072088398079615,"center":50,"origin":"49.93732408739442% 96.54940959148318%"} }, pairShadow: perryPairShadow },
})

export const productRenderFrame = Object.freeze({"width":1833,"height":1243,"heightScale":1.7921175762593038,"topOffset":-52.45976555304147,"center":30.523731587561375,"origins":{"glass":"30.539560145890228% 77.24415821238256%"}})
