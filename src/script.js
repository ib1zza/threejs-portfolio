import './style.css'
import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import gsap from "gsap";
import { EffectComposer } from  'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import Stats from "stats.js";
import {particlesMaterial, triangleMaterial, textMaterial, particlesParams, overlayMaterial } from "./materials.js";

let state = false;
const stats = new Stats();
const animationDuration = 1;


const loadingBarElement = document.querySelector('.loadingBar')

const LoadingManager = new THREE.LoadingManager(
    () => {
        window.setTimeout(() => {
            addObjectsToScene()
        }, 1500)
        window.setTimeout(() => {
            gsap.to(overlayMaterial.uniforms.uAlpha, {
                value: 0,
                duration: 1,
                ease: "power2.inOut"
            }).then(() => {
              scene.remove(overlay)
              overlay.material.dispose()
              overlay.geometry.dispose()
            })
            loadingBarElement.classList.add("finished")
            loadingBarElement.style.transform = ''  
        }, 500); 
    },
    (_, itemsLoaded, itemsTotal) => {
        const progressRatio = itemsLoaded / itemsTotal;
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
    }
);

 
function addObjectsToScene() {
    showRectangles();
    showText();

    camera.add(group);
    camera.add(text);
}

const initialState = {
  camera: {
    position: {x: -0.01, y: 3.5,z: 0},
  },
}


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//! Overlay

const overlayGeometry = new THREE.PlaneGeometry(2, 2 ,1, 1);

const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay)

overlay.rotation.x = Math.PI / 2
overlay.position.set(0, 2, 0)
 
// !

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 10)
camera.position.set(...Object.values(initialState.camera.position))
scene.add(camera)
camera.lookAt(0, 0, 0)
 

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

 
/**
 * Points
 */

let points;

const createPoints = () => {
    const geometry = new THREE.BufferGeometry()

    const vertices = [];
    
    for ( let i = 0; i < particlesParams.count; i ++ ) {
        for ( let j = 0; j < particlesParams.count; j ++ ) {
            const x = ((i) / particlesParams.count - 0.5)  * 10;
            const y = 0;
            const z =  ((j) / particlesParams.count - 0.5)  * 10;
            vertices.push( x, y, z );
        }
    }
    
    
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    
     points = new THREE.Points(geometry, particlesMaterial)

    scene.add(points)
}

createPoints()

const group = new THREE.Group();
let arrayWithRectangles = [];

const count = 120;
const multiplier = 1.2;

const sizeHeight = 1.0 * multiplier;
const sizeWidth = 0.6 * multiplier;

const triangleGeometry = new THREE.PlaneGeometry(sizeWidth, sizeHeight, 1, 1);

const createRectangles = () => {
  if(arrayWithRectangles.length > 0) {
    animateRectanglesToBase();
  } else {
    for (let i = 0; i < count; i++) {
      const element = new THREE.Mesh(
        triangleGeometry,
        triangleMaterial
      );
  
      element.rotation.y = (Math.PI * 2 * (count - i)) / count;
      element.rotation.x = Math.random();
      element.position.z = Math.random();

      element.position.z = Math.sin((Math.PI * 2 * (count - i + 70)) / (count)) * multiplier *(1 + Math.random() * 1);
      element.position.x = -Math.cos((Math.PI * 2 * (count - i + 70)) / (count)) * multiplier *(1 + Math.random() * 1);
      arrayWithRectangles.push(element);
  }
  }
  group.position.z = -3.5;
  group.rotation.x = Math.PI / 2
  group.add(...arrayWithRectangles)
}

createRectangles();

function animateRectanglesToBase () {
  for (let i = 0; i < count; i++) {
      const element = arrayWithRectangles[i]
   
      gsap.to(element.rotation, {
          duration: animationDuration,
          x: 0,
          z: 0,
          y: (Math.PI * 2 * (count - i)) / count,
        })
       
      gsap.to(element.position, {
          duration: animationDuration,
          z: Math.sin((Math.PI * 2 * (count - i + 70)) / (count)) * multiplier ,
          x: -Math.cos((Math.PI * 2 * (count - i + 70)) / (count)) * multiplier,
          y: 0,
        })
  }
}



// ! post processing
const bloomParams = {
  threshold: 0,
  strength: 0.9,
  radius: 0.8,
};

let composer;
function applyPostProcessing() {

  const renderTarget = new THREE.WebGLRenderTarget(
    sizes.width,
    sizes.height,
    {
        samples: renderer.getPixelRatio() === 1 ? 2 : 0,
    }
  )
  
  const renderPass = new RenderPass( scene, camera );
  
  const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 0, 0, 0 );
  bloomPass.threshold = bloomParams.threshold;
  bloomPass.strength = bloomParams.strength;
  bloomPass.radius = bloomParams.radius;
  
  composer = new EffectComposer( renderer, renderTarget);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  composer.setSize(sizes.width, sizes.height)
  composer.addPass( renderPass );
  composer.addPass( bloomPass );
  
  if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
    // antialiasing pass if no webGl2
    const smaaPass = new SMAAPass()
    composer.addPass(smaaPass)
    console.log("using antialias pass (SMAAPass)")
  }
}

applyPostProcessing()

// Debug UI and Stats

if(window.location.hash == '#debug')
{
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

    const gui = new dat.GUI();
    
    gui.add(particlesMaterial.uniforms.uSize, 'value').min(0).max(10).step(0.001).name('point size')
    gui.add(particlesMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('color offset')
    gui.add(particlesMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('color multiplier')

    gui.add(particlesMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(10).step(0.001).name('small waves elevation')
    gui.add(particlesMaterial.uniforms.uSmallWavesFrequency, 'value').min(0).max(10).step(0.001).name('small waves frequency')
    gui.add(particlesMaterial.uniforms.uSmallWavesSpeed, 'value').min(0).max(10).step(0.001).name('small waves speed')
    gui.add(particlesMaterial.uniforms.uSmallWavesIterations, 'value').min(0).max(10).step(0.001).name('small waves iterations')


    gui.add(overlay.position, 'x').min(-10).max(10).step(0.01)
gui.add(overlay.position, 'y').min(-10).max(10).step(0.01)
gui.add(overlay.position, 'z').min(-10).max(10).step(0.01)


    const bloomFolder = gui.addFolder( 'bloom' );

				bloomFolder.add( bloomParams, 'threshold', 0.0, 1.0 ).onChange( function ( value ) {

					bloomPass.threshold = Number( value );

				} );

				bloomFolder.add( bloomParams, 'strength', 0.0, 3.0 ).onChange( function ( value ) {

					bloomPass.strength = Number( value );

				} );

				gui.add( bloomParams, 'radius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

					bloomPass.radius = Number( value );

				} );

        const o = {
          listener: buttonListener
        }
        gui.add(o, 'listener').name('trigger')
}

// Text creation

let text;
const createText = (text1, font, x = 0, y = 0, z = 0, rotate) => {
  const textGeometry = new TextGeometry(text1, {
    font: font,
    size: 0.3,
    height: 0.0001,
    curveSegments: 12,
  });
  
  

  if (rotate) {
    textGeometry.rotateX(rotate.x);
    textGeometry.rotateY(rotate.y);
    textGeometry.rotateZ(rotate.z);
  }
  textGeometry.center();

  const text = new THREE.Mesh(textGeometry, textMaterial);
  text.position.y = y;
  text.position.z = z;
  text.position.x = x;
  return text;
};

const fontLoader = new FontLoader(LoadingManager);
fontLoader.load("/fonts/titillium_bold.typeface.json", (font) => {
  text = createText("ib1zza", font, 0, 0, 0, {
    x: 0,
    y: 0,
    z: 0,
  });
  
  text.position.z = -2.5; 
})


/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () =>
{
    stats.begin();

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    particlesMaterial.uniforms.uTime.value = elapsedTime;
    
    if(!state){
      group.rotation.y = elapsedTime / 2;
    }
     
    if(textMaterial){
      textMaterial.uniforms.uTime.value = elapsedTime;
    }
    
    // Update controls
    // controls.update()
    
    // Render
    composer.render();
    
    stats.end();
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


// ! animations



function buttonListener(buttonState) {
    if(buttonState) {
      ACTION_SHOWSTART();
    } else {
        ACTION_SHOWINFO()
    }
    state = !state
}

function ACTION_SHOWINFO  () {
  moveCameraWaves();

    gsap.to(particlesMaterial.uniforms.uMultiplierElevation, {
      duration: animationDuration,
      value: 1
    });

    hideRectangles()
 
    hideText();
}

function ACTION_SHOWSTART  () {
  showRectangles();
  moveCameraDefault();

  gsap.to(particlesMaterial.uniforms.uMultiplierElevation, {
    duration: animationDuration,
    value: 0
  });

  showText();

  camera.add(group);
}

function showRectangles() {
  createRectangles();

  gsap.to(triangleMaterial.uniforms.uOpacityMultiplier, {
    duration: animationDuration,
    value:  1,
  })
}

function hideRectangles() {
  gsap.to(triangleMaterial.uniforms.uOpacityMultiplier, {
    duration: animationDuration,
    value:  0,
  })

  arrayWithRectangles.forEach(element => {
    gsap.to(element.rotation, {
        duration: animationDuration,
        x: Math.random(),
        z: Math.random(),
      })

    gsap.to(element.position, {
      duration: animationDuration,
      x: element.position.x *(1 + Math.random() * 1) ,
      z: element.position.z *(1 + Math.random() * 1),
    }).then(() => {
      camera.remove(group);
    })
})
}

function showText() {
  gsap.to(textMaterial.uniforms.uOpacity, {
    duration: animationDuration / 2,
    delay: animationDuration / 4,
    value:  1,
  })

  gsap.to(text.position, {
    duration: animationDuration /4 ,
    z: -2.5,
  })
}

function hideText() {

  gsap.to(textMaterial.uniforms.uOpacity, {
    duration: animationDuration / 4,
    value:  0,
  })

  gsap.to(text.position, {
    duration: animationDuration ,
    z: -5,
  })
}

function moveCameraWaves() {
  gsap.to(camera.position, {
    duration: animationDuration,
    x: -7,
    y: 1.5,
    z: 0,
  });

  gsap.to(camera.rotation, {
    duration: animationDuration,
    x: -2.1,
    y: -Math.PI / 2,
    z: -2.1,
  }) 
}

function moveCameraDefault() {
  gsap.to(camera.position, {
    duration: animationDuration,
    ...initialState.camera.position
  });

  gsap.to(camera.rotation, {
    duration: animationDuration,
    x:   -Math.PI / 2,
    y: 0,
    z: -Math.PI / 2,
  })
}


export {buttonListener}

