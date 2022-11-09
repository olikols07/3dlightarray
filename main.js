import './style.css'

import * as THREE from 'three'

import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

// initing variables

let diodeDepth = 5;
let diodeSize = 5;

let diodes, newestSelect, stats;


let camera, scene, renderer, controls;
let composer, outlinePass;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selected = [];

const edgeGlowParams = {
  edgeStrength: 3.0,
  edgeGlow: 0.0,
  edgeThickness: 1.0,
  pulsePeriod: 0,
  rotate: false,
  usePatternTexture: false
};



// initializing all settings and objects

        


init();
animate();

// Making EventListeners

// Window
window.addEventListener( 'mousemove', onMouseMove, false );
window.addEventListener('mousedown', selectObject, false );
window.addEventListener( 'resize', onWindowResize, false );
function init() {
    diodes = []

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    document.body.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );

    controls = new OrbitControls( camera, renderer.domElement ); 

    controls.maxDistance = 50 * diodeDepth + (diodeDepth * diodeSize);
    camera.position.set(diodeDepth * diodeSize, diodeDepth * diodeSize, 50 * diodeDepth + (diodeDepth * diodeSize));
    camera.lookAt(diodeDepth * diodeSize, diodeDepth * diodeSize, (diodeDepth * diodeSize))
    controls.update();

    const AmbientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( AmbientLight );

    for (let x = 0; x < diodeDepth; x++) {
      for (let y = 0; y < diodeDepth; y++) {
        for (let z = 0; z < diodeDepth; z++) {
          let LightGeometry =  new THREE.BoxGeometry(diodeSize, diodeSize, diodeSize);
          let material = new THREE.MeshStandardMaterial( { color: 0x00ffff });
          material.transparent = true;
          material.opacity = 0.9
          let LightDiode = new THREE.Mesh( LightGeometry, material );
          LightDiode.position.x = diodeSize * x * 2;
          LightDiode.position.y = diodeSize * y * 2;
          LightDiode.position.z = diodeSize * z * 2;
          LightDiode.name = (
            "Diode X: " + (LightDiode.position.x / diodeSize / 2).toString() +
            " Y: " + (LightDiode.position.y / diodeSize / 2).toString() +
            " Z: " + (LightDiode.position.z / diodeSize / 2).toString()
          );
          scene.add(LightDiode);
          diodes.push(LightDiode);
        } 
      }
    } 

    stats = new Stats();
    document.body.appendChild( stats.dom );
    
    // postprocessing

    composer = new EffectComposer( renderer );

    const renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );

    outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
    composer.addPass( outlinePass );

}


function onMouseMove( event ) { 
  // calculate mouse position in normalized device coordinates 
  // (-1 to +1) for both components 
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1; 
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1; 
} 
function animate()
{
  requestAnimationFrame( animate )
  stats.begin();
	controls.update();
  
  renderer.render( scene, camera );
  stats.end();
}

function selectObject() {
  // update the picking ray with the camera and mouse position
  raycaster.setFromCamera( mouse, camera ); 
  // calculate objects intersecting the picking ray var intersects =     
  let intersects = raycaster.intersectObjects( scene.children ); 
  if(intersects != 0 && intersects.length != scene.children.length - 1 && newestSelect != intersects[0].object.name) {
    if(window.event.ctrlKey) {
      if(selected.includes(intersects[0].object)) {
        return
      }
      newestSelect = intersects[0].object;
      selected.push(newestSelect.name);
      if(selected.length > 1) {
        document.getElementById('ObjectName').innerHTML = selected.length.toString() + " Diodes selected";
      } else {
        document.getElementById('ObjectName').innerHTML = newestSelect.name + " is selected"
      }
    } else {
      newestSelect = intersects[0].object;
      selected = [newestSelect.name];
      document.getElementById('ObjectName').innerHTML = newestSelect.name;
    }
    console.log(selected)
  }
}


function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}
