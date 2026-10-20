import { categoryGlasses } from './category-glasses.js'
import meadCan from '../assets/home/product-renders/medovuha-can.webp?responsive'
import meadGlassShadow from '../assets/home/product-renders/medovuha-glass-shadow.webp?responsive'
import meadCanShadow from '../assets/home/product-renders/medovuha-can-shadow.webp?responsive'
import ciderCan from '../assets/home/product-renders/sidr-can.webp?responsive'
import ciderGlassShadow from '../assets/home/product-renders/sidr-glass-shadow.webp?responsive'
import ciderCanShadow from '../assets/home/product-renders/sidr-can-shadow.webp?responsive'
import perryCan from '../assets/home/product-renders/puare-can.webp?responsive'
import perryGlassShadow from '../assets/home/product-renders/puare-glass-shadow.webp?responsive'
import perryCanShadow from '../assets/home/product-renders/puare-can-shadow.webp?responsive'

export const productSliderRenders = Object.freeze({
  medovuha: { glass: categoryGlasses.medovuha, can: meadCan, canFrame: { left: 1046, top: 279, width: 251, height: 661 }, glassShadow: meadGlassShadow, canShadow: meadCanShadow },
  sidr: { glass: categoryGlasses.sidr, can: ciderCan, canFrame: { left: 1046, top: 279, width: 251, height: 661 }, glassShadow: ciderGlassShadow, canShadow: ciderCanShadow },
  puare: { glass: categoryGlasses.puare, can: perryCan, canFrame: { left: 1046, top: 279, width: 251, height: 661 }, glassShadow: perryGlassShadow, canShadow: perryCanShadow },
})

export const productRenderFrame = Object.freeze({"width":1958,"height":1205,"heightScale":1.3052495840266223,"topOffset":-12.603660565723807,"center":54.70466250333419,"origins":{"glass":"51.65802236036996% 69.45997138611321%","can":"59.82760535584065% 76.51391329482689%"}})
