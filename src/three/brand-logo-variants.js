import * as THREE from 'three'
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js'
import {SVGLoader} from 'three/addons/loaders/SVGLoader.js'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js'
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js'
import { createBrandLogoModel } from './brand-logo.js'
import svg from '../assets/branding/brand-logo-mark.svg?raw'

const stage=document.querySelector('#stage'), status=document.querySelector('#status');
try {
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;stage.append(renderer.domElement);
const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(32,1,.1,100);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=3;controls.maxDistance=60;
const pmrem=new THREE.PMREMGenerator(renderer), room=new RoomEnvironment(), environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.35;room.dispose();pmrem.dispose();
const variantsLights=new THREE.Group();scene.add(variantsLights);
variantsLights.add(new THREE.HemisphereLight(0xfff3da,0x393548,.8));
for(const [x,y,z,power,color] of [[-4,6,8,2,0xffe7c5],[5,1,5,.75,0xffffff],[-2,-4,1,.35,0xd8e4ff]]){const light=new THREE.DirectionalLight(color,power);light.position.set(x,y,z);variantsLights.add(light)}
const doc=new DOMParser().parseFromString(svg,'image/svg+xml');for(const el of doc.querySelectorAll('[fill]'))el.style.fill=el.getAttribute('fill');
const data=new SVGLoader().parse(new XMLSerializer().serializeToString(doc));
const raw=data.paths.flatMap(p=>p.toShapes(true));
function shapeFrom(points){return new THREE.Shape(points)}
function bearShapes(scale){return raw.map(s=>{const transform=p=>new THREE.Vector2((p.x-81)*scale,(66.5-p.y)*scale);const sh=shapeFrom(s.getPoints(10).map(transform));sh.holes=s.holes.map(h=>new THREE.Path(h.getPoints(10).map(transform)));return sh})}
function noiseTexture(){const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d'), img=ctx.createImageData(256,256);let seed=19;for(let i=0;i<img.data.length;i+=4){seed=(1664525*seed+1013904223)>>>0;const n=95+(seed>>>24)*.42;img.data[i]=img.data[i+1]=img.data[i+2]=n;img.data[i+3]=255}ctx.putImageData(img,0,0);const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,4);return t}
const grain=noiseTexture();
const bronze=new THREE.MeshStandardMaterial({color:0x67513c,metalness:.86,roughness:.65,bumpMap:grain,bumpScale:.014});
const bronzeRelief=bronze.clone();bronzeRelief.color.set(0x9b7e52);bronzeRelief.roughness=.51;
const wax=new THREE.MeshPhysicalMaterial({color:0x30131b,roughness:.49,metalness:0,clearcoat:.16,clearcoatRoughness:.6,bumpMap:grain,bumpScale:.008});
const red=new THREE.MeshStandardMaterial({color:0x9c1624,metalness:.06,roughness:.47,bumpMap:grain,bumpScale:.005});
function mesh(group,geometry,material,z=0){const m=new THREE.Mesh(geometry,material);m.position.z=z;group.add(m);return m}
function extrude(group,sh,depth,material,z,bevel=.012){return mesh(group,new THREE.ExtrudeGeometry(sh,{depth,steps:1,curveSegments:48,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3}),material,z)}
function disk(group,r,depth,material,z){const sh=new THREE.Shape();sh.absarc(0,0,r,0,Math.PI*2,false);return extrude(group,sh,depth,material,z,.025)}
function ring(group,r,t,material,z){return mesh(group,new THREE.TorusGeometry(r,t,10,160),material,z)}
function relief(group,material,scale,z,depth){for(const sh of bearShapes(scale))extrude(group,sh,depth,material,z,.009)}
function ornament(group,material,r,z,count){for(let i=0;i<count;i++){const a=i/count*Math.PI*2;const sh=new THREE.Shape();sh.moveTo(0,-.095);sh.bezierCurveTo(-.085,-.02,-.065,.065,0,.115);sh.bezierCurveTo(.065,.065,.085,-.02,0,-.095);const leaf=extrude(group,sh,.026,material,z,.005);leaf.position.x=Math.cos(a)*r;leaf.position.y=Math.sin(a)*r;leaf.rotation.z=a-Math.PI/2;const bead=mesh(group,new THREE.SphereGeometry(.022,10,8),material,z+.04);bead.position.x=Math.cos(a+Math.PI/count)*r;bead.position.y=Math.sin(a+Math.PI/count)*r}}
const coin=new THREE.Group();coin.name='medved-bronze-coin';disk(coin,1.4,.19,bronze,-.15);ring(coin,1.34,.036,bronzeRelief,.095);ring(coin,1.07,.018,bronzeRelief,.09);ornament(coin,bronzeRelief,1.21,.085,40);relief(coin,bronzeRelief,.0108,.055,.052);
for(let i=0;i<112;i++){const a=i/112*Math.PI*2;const ridge=mesh(coin,new THREE.BoxGeometry(.018,.038,.13),bronzeRelief,-.045);ridge.position.x=Math.cos(a)*1.397;ridge.position.y=Math.sin(a)*1.397;ridge.rotation.z=a-Math.PI/2}

const seal=new THREE.Group();seal.name='medved-red-wax-seal';
// Sculpted radial wax profile, with a broad irregular rim and a droplet below.
const n=192, profile=[[0,-.045],[.91,.09],[1.025,.11],[1.10,.24],[1.22,.29],[1.36,.21],[1.46,.04],[1.40,-.11],[0,-.11]];
const pos=[],indices=[];
for(let j=0;j<profile.length;j++)for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,[radius,height]=profile[j];const outer=Math.max(0,(radius-1.02)/.44);const rightSoftening=1-.6*Math.pow(Math.max(0,Math.cos(a)),4);const wave=rightSoftening*(.043*Math.sin(5*a+.4)+.027*Math.sin(9*a-1)+.017*Math.cos(13*a));const drop=.32*Math.exp(-Math.pow((a-4.46)/.14,2));const rr=radius+outer*(wave+drop);pos.push(Math.cos(a)*rr,Math.sin(a)*rr,height+outer*.028*Math.sin(7*a))}
for(let j=0;j<profile.length-1;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+n+1;indices.push(a,b,a+1,b,b+1,a+1)}
const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(indices);const weldedWax=mergeVertices(geo,0.00001);geo.dispose();weldedWax.computeVertexNormals();mesh(seal,weldedWax,wax);
// Continuous dark burgundy wax face with the original gold bear relief.
const face=new THREE.Shape();face.absarc(0,0,1.035,0,Math.PI*2,false);
extrude(seal,face,.069,wax,.10,.003);
ring(seal,1.038,.026,wax,.182);ring(seal,.982,.009,wax,.174);
const goldBear=new THREE.MeshStandardMaterial({color:0xdcab67,metalness:0,roughness:.57,bumpMap:grain,bumpScale:.003});
for(const shape of bearShapes(.0107))mesh(seal,new THREE.ShapeGeometry(shape,48),goldBear,.175);

const stamp=new THREE.Group();stamp.name='medved-red-ornamental-stamp';disk(stamp,1.4,.11,red,-.10);ring(stamp,1.35,.028,red,.035);ring(stamp,1.02,.023,red,.045);ornament(stamp,red,1.19,.025,32);relief(stamp,red,.0104,.035,.105);
const originalModel=createBrandLogoModel();
const original=new THREE.Group();original.name='medved-original';
originalModel.logo.updateMatrixWorld(true);
const originalCenter=new THREE.Box3().setFromObject(originalModel.logo).getCenter(new THREE.Vector3());
originalModel.logo.position.sub(originalCenter);original.add(originalModel.logo);original.scale.setScalar(.016);
const originalLights=new THREE.Group();
originalLights.add(new THREE.HemisphereLight(0xffffff,0x806442,1));
const originalKey=new THREE.DirectionalLight(0xffffff,1.5);originalKey.position.set(-120,180,200);originalLights.add(originalKey);scene.add(originalLights);
const models={original,coin,wax:seal,stamp};for(const group of Object.values(models))scene.add(group);
let selected='wax';
function overviewDistance(){
  const halfHeight=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
  return Math.max(1.7/halfHeight,6.6/(halfHeight*camera.aspect))*1.18;
}
function select(id){
  selected=id;
  for(const [index,[key,g]] of Object.entries(models).entries()){
    g.visible=id==='all'||id===key;
    g.position.set(id==='all'?(index-1.5)*3.3:0,0,0);
    g.rotation.set(key==='original'?0:-.14,key==='original'?0:.2,0);
  }
  const isOriginal=id==='original';
  variantsLights.visible=!isOriginal;originalLights.visible=isOriginal;
  scene.environment=isOriginal?null:environment.texture;
  renderer.toneMapping=isOriginal?THREE.NoToneMapping:THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=isOriginal?1:.85;
  camera.position.set(0,isOriginal?0:-.7,id==='all'?overviewDistance():6.5);
  controls.target.set(0,0,0);controls.update();
  for(const b of document.querySelectorAll('[data-variant]'))b.setAttribute('aria-pressed',String(b.dataset.variant===id));
}

for(const b of document.querySelectorAll('[data-variant]'))b.onclick=()=>select(b.dataset.variant);document.querySelector('#reset').onclick=()=>select(selected);select('wax');
function resize(){renderer.setSize(stage.clientWidth,stage.clientHeight,false);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();if(selected==='all'){camera.position.setLength(overviewDistance());controls.update()}}const observer=new ResizeObserver(resize);observer.observe(stage);resize();
let frame;function animate(){frame=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)}animate();
function save(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
document.querySelector('#png').onclick=()=>{renderer.render(scene,camera);renderer.domElement.toBlob(blob=>save(blob,`medved-${selected}.png`))};
document.querySelector('#glb').onclick=async()=>{try{const root=new THREE.Group();for(const [key,g] of Object.entries(models))if(selected==='all'||key===selected)root.add(g.clone());const buffer=await new GLTFExporter().parseAsync(root,{binary:true});save(new Blob([buffer],{type:'model/gltf-binary'}),`medved-${selected}.glb`)}catch(e){status.textContent=e.message}};
status.textContent='Четыре модели готовы к просмотру';window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();scene.traverse(o=>{o.geometry?.dispose()});grain.dispose();environment.dispose();renderer.dispose()},{once:true});
}catch(e){status.textContent=`Ошибка: ${e.message}`;console.error(e)}
