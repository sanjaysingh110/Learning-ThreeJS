import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { Scene } from 'three';
import * as dat from 'dat.gui';
import bg from '../img/stars.jpeg'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";

const  modelURL = new URL('../assets/jeep.glb',import.meta.url);


//adding Renderer
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);




//gui
const gui = new dat.GUI();
const options = {
    sphereColour:'#d4cb49',
    boxColour:'#00FF00',
    planeColour:'#595959',
    bounceSpeed:0.01,
    lightIntensity:0.8,
    penumbra:0.8
};
gui.addColor(options,'sphereColour').onChange(function(e){
    sphere.material.color.set(e);
});
gui.addColor(options,'boxColour').onChange(function(e){
    box.material.color.set(e);
});
gui.addColor(options,'planeColour').onChange(function(e){
    plane.material.color.set(e);
});
gui.add(options,'bounceSpeed',0,0.1);
gui.add(options,'lightIntensity',0,2);
gui.add(options,'penumbra',0,1);


//initializeScene
const scene = new THREE.Scene();

// //Backgorund Image
const textureLoader = new THREE.TextureLoader();
var loader = new THREE.CubeTextureLoader();
scene.background = textureLoader.load(bg);
var textureCube = loader.load( [
    bg, bg,
    bg, bg,
    bg, bg
  ] );
  scene.background = textureCube;

  
//initializeCamera

const camera = new THREE.PerspectiveCamera(50,window.innerWidth/window.innerHeight,0.1,1000);

const orbit = new OrbitControls(camera,renderer.domElement);

//axis Helper
const axesHelper = new THREE.AxesHelper(5);
//scene.add(axesHelper);
camera.position.set(0,1,5);
orbit.update();
//camera.rotation.set(-0.1,0.1,0);



//PostProcessing
const renderScene = new RenderPass(scene,camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
//let composer;




//adding grid
const gridHelper = new THREE.GridHelper(10)
//scene.add(gridHelper);

//adding plane
const planeMesh = new THREE.PlaneGeometry(10,10);
const planeMaterial = new THREE.MeshStandardMaterial({color:0x595959,side:THREE.DoubleSide});
const plane = new THREE.Mesh(planeMesh,planeMaterial);
scene.add(plane);
scene.add(plane);
plane.rotation.x = -0.5*Math.PI;
plane.receiveShadow = true;

//adding box
const boxMesh = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshStandardMaterial({color:0xFFFFFF,map:textureLoader.load(bg)});
const box = new THREE.Mesh(boxMesh,boxMaterial);
//scene.add(box);
box.position.set(1.5,0.8,0.8);
box.castShadow= true;


// const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0,0.9,0.1);
// composer.addPass(bloomPass);

// bloomPass.strength = 0.5;
// bloomPass.radius = 0.1;
// bloomPass.threshold = 0.1;

renderer.toneMapping = THREE.CineonToneMapping;
renderer.toneMappingExposure = 1;

let mixer;
//GLTF loader
const assetLoader = new GLTFLoader();
assetLoader.load(modelURL.href,function(GLTF){
    const model = GLTF.scene;
    scene.add(model);
    console.log(model.getObjectByName('Cube047_6'));
    model.getObjectByName('Cube047_6').material.color.setHex(0x00030F);
    model.getObjectByName('polySurface8739015').material.emissive.setHex(0xFFFFFF);
    model.getObjectByName('polySurface8739015').material.emissiveIntensity = 10;
    console.log(model.getObjectByName('Cube047_7').material.normalMap);


    //AnimationsOfModel
    console.log("1");
    mixer = new THREE.AnimationMixer(model);
    const clips = GLTF.animations;
    for (let i = 0; i < clips.length; i++) 
    {
        const action = mixer.clipAction(clips[i]);
        action.loop = true;;
        action.play();
    }
    
    console.log("2");





    model.position.set(0,0.01,0);
    model.scale.set(0.5,0.5,0.5);
    model.castShadow = true;
},undefined, function(error){
    console.error(error);
} );



//adding sphere
const sphereMesh = new THREE.SphereGeometry(0.5,50,50);
const sphereMaterial = new THREE.MeshStandardMaterial({color:0xd4cb49});
const sphere = new THREE.Mesh(sphereMesh,sphereMaterial);
//scene.add(sphere);
sphere.position.x = 1.5;
sphere.position.z = 2.5;
sphere.castShadow= true;


//AmbientLight
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

//Spotlight
const spotLight = new THREE.SpotLight(0xFFFFFF);
scene.add(spotLight);
spotLight.castShadow=true;
spotLight.position.set(-10,10,0);
spotLight.angle=0.2;
spotLight.penumbra=0.2;

//Spotlighthelper
const spotlightHelper = new THREE.SpotLightHelper(spotLight);
//scene.add(spotlightHelper);

//DirectionalLight
const directionalLight = new THREE.DirectionalLight(0xFFFFFF,options.lightIntensity);
scene.add(directionalLight);
directionalLight.castShadow = true;
directionalLight.position.set(-6,10,0);
//directionalLightHelper
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight,2);
//scene.add(directionalLightHelper);

scene.fog = new THREE.Fog(0X64daff,0,80);

//Raycast
//const rayCaster = new THREE.Raycaster();



//Animate
let step = 0;
const clock =  new THREE.Clock();
function Update(time)
{
    //requestAnimationFrame(renderer);
    if(mixer)
    {
        mixer.update(clock.getDelta);
    }
    box.rotation.x= time/10000;
    box.rotation.y= time/10000;
    step += options.bounceSpeed;
    sphere.position.y = 5*Math.abs(Math.sin(step));

    spotLight.penumbra = options.penumbra;
    //directionalLight.intensity = options.intensity;
    directionalLightHelper.update();






    //rayCaster.setFromCamera(mouse)
    //  composer.render();
    //  requestAnimationFrame(Update);
    renderer.render(scene,camera);
}
renderer.setAnimationLoop(Update);
Update();
//ResponsiveCanvas
window.addEventListener('resize',function(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight)
});