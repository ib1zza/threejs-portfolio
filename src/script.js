import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import waterParticlesVertexShader from './shaders/coolWavesParticles/vertex.glsl';
import waterParticlesFragmentShader from './shaders/coolWavesParticles/fragment.glsl';
import gsap from "gsap";
import { EffectComposer } from  'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const duration = 0.8;
let textMaterial;

const initialState = {
  camera: {
    position: {x: -0.01, y: 2.5,z: 0},
  },
  rectangles: {
    position: {x: -0.01, y: 3,z: 0},
  },
  text: {
    position: {x: 0, y: 1,z: 0},
  }
}
/**
 * Base
 */
// Debug

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


// Material

const parameters = {}
parameters.count = 200
parameters.size = 5
 


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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.001, 100)
camera.position.set(...Object.values(initialState.camera.position))
scene.add(camera)


// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


const material = new THREE.ShaderMaterial({
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    vertexShader: waterParticlesVertexShader,
    fragmentShader: waterParticlesFragmentShader,
    uniforms: {
        uTime: {value: 0},
        uSize: {value: parameters.size * renderer.getPixelRatio()},
        
        uDepthColor: { value: new THREE.Color("#000000") },
        uSurfaceColor: { value: new THREE.Color("#ffffff") },
        uColorOffset: { value: 0.1},
        uColorMultiplier: { value: 0.5 },

        uSmallWavesElevation: { value: 10 },
        uSmallWavesFrequency: { value: 0.5},
        uSmallWavesSpeed: {value: 0.6},
        uSmallWavesIterations: {value: 1.0},

        uMultiplierElevation: { value: 0 },
    }
})


 
/**
 * Points
 */
let points;

const createPoints = () => {
    const geometry = new THREE.BufferGeometry()

    const vertices = [];
    
    for ( let i = 0; i < parameters.count; i ++ ) {
        for ( let j = 0; j < parameters.count; j ++ ) {
            const x = ((i) / parameters.count - 0.5)  * 10;
            const y = 0;
            const z =  ((j) / parameters.count - 0.5)  * 10;
            vertices.push( x, y, z );
        }
    }
    
    
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    
     points = new THREE.Points(geometry, material)

    scene.add(points)
}

createPoints()

/**
 * Animate
 */
const clock = new THREE.Clock()

const group = new THREE.Group();
let arr = [];

const triangleMaterial = new THREE.ShaderMaterial({
    vertexShader: `
  
    varying vec2 vUv;
 
  
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
       
        vUv = uv;
      
      }
    `,
    fragmentShader: `
   
    varying vec2 vUv;
 
   
    uniform float uOpacityMultiplier;
  
      void main() {
        vec3 color = vec3(1.0) * uOpacityMultiplier;

        vec2 newUv = vUv;
        newUv.y = newUv.y * newUv.y + 0.1;

        vec3 mul = vec3(newUv.y);

        float strength = step(0.495, abs(vUv.x - 0.5)) + step(0.495, abs(vUv.y - 0.5)) ;

        gl_FragColor = vec4( color, mul * strength );
      }
  
    `,
    uniforms: {
        uOpacityMultiplier: { value: 1 },
    },
 
    transparent: true,
    side: THREE.DoubleSide,
  });
  




const count = 120;
const multiplier =1.2;

const sizeHeight = 1.0 * multiplier;
const sizeWidth = 0.5 * multiplier;


const createRectangles = () => {
  if(arr.length > 0) {
    animateRectanglesToBase();
  } else {
    for (let i = 0; i < count; i++) {
        const element = new THREE.Mesh(
          new THREE.PlaneGeometry(sizeWidth, sizeHeight),
          triangleMaterial
        );
    
        element.rotation.y = (Math.PI * 2 * (count - i)) / count;
    
        element.position.z = Math.sin((Math.PI * 2 * (count - i + 70)) / (count)) * multiplier;
        element.position.x = -Math.cos((Math.PI * 2 * (count - i + 70)) / (count)) * multiplier;

        arr.push(element);
        group.add(element); 
    }
  }
 
  group.position.y = 0.025;
  scene.add(group);
}

createRectangles();

// ! post processing

const params = {
  threshold: 0.35,
  strength: 2,
  radius: 0.8,
};

const renderTarget = new THREE.WebGLRenderTarget(
  sizes.width,
  sizes.height,
  {
      samples: renderer.getPixelRatio() === 1 ? 2 : 0,
  }
)

const renderScene = new RenderPass( scene, camera );

      const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
      bloomPass.threshold = params.threshold;
      bloomPass.strength = params.strength;
      bloomPass.radius = params.radius;

		 

    const composer = new EffectComposer( renderer, renderTarget);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    composer.setSize(sizes.width, sizes.height)
    composer.addPass( renderScene );
    composer.addPass( bloomPass );

  if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
    // antialiasing pass 
    const smaaPass = new SMAAPass()
    composer.addPass(smaaPass)
    console.log("using antialias pass (SMAAPass)")
  }

  




// ! animations




function buttonListener(state) {
    if(state) {
      showRectangles();
  } else {
      hideRectangles()
  }

}


function animateRectanglesToBase () {
    for (let i = 0; i < count; i++) {
        const element = arr[i]
     
        gsap.to(element.rotation, {
            duration: duration,
            x: 0,
            z: 0,
            y: (Math.PI * 2 * (count - i)) / count,
          })
         
        gsap.to(element.position, {
            duration: duration,
            z: Math.sin((Math.PI * 2 * (count - i + 70)) / (count)) * multiplier ,
            x: -Math.cos((Math.PI * 2 * (count - i + 70)) / (count)) * multiplier,
          })
          group.add(element); 
    }
}


if(window.location.hash == '#debug')
{
    const gui = new dat.GUI();
    
    gui.add(material.uniforms.uSize, 'value').min(0).max(10).step(0.001).name('point size')
    gui.add(material.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('color offset')
    gui.add(material.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('color multiplier')

    gui.add(material.uniforms.uSmallWavesElevation, 'value').min(0).max(10).step(0.001).name('small waves elevation')
    gui.add(material.uniforms.uSmallWavesFrequency, 'value').min(0).max(10).step(0.001).name('small waves frequency')
    gui.add(material.uniforms.uSmallWavesSpeed, 'value').min(0).max(10).step(0.001).name('small waves speed')
    gui.add(material.uniforms.uSmallWavesIterations, 'value').min(0).max(10).step(0.001).name('small waves iterations')

    const bloomFolder = gui.addFolder( 'bloom' );

				bloomFolder.add( params, 'threshold', 0.0, 1.0 ).onChange( function ( value ) {

					bloomPass.threshold = Number( value );

				} );

				bloomFolder.add( params, 'strength', 0.0, 3.0 ).onChange( function ( value ) {

					bloomPass.strength = Number( value );

				} );

				gui.add( params, 'radius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

					bloomPass.radius = Number( value );

				} );

			 
}

let text;
const createText = (text1, font, x = 0, y = 0, z = 0, rotate) => {
  const textGeometry = new TextGeometry(text1, {
    font: font,
    size: 0.3,
    height: 0.0001,

    // curveSegments: 5,
    // bevelEnabled: true,
    // bevelThickness: 0.01,
    // bevelSize: 0.005,
    // bevelOffset: 0,
    // bevelSegments: 3,
  });
  //   textGeometry.computeBoundingBox();
  

  if (rotate) {
    textGeometry.rotateX(rotate.x);
    textGeometry.rotateY(rotate.y);
    textGeometry.rotateZ(rotate.z);
  }
  textGeometry.center();

  // const textMaterial = new THREE.MeshBasicMaterial({
  //   side: THREE.DoubleSide,
  // });

  textMaterial = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1}
    },
    vertexShader: `

      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader: `
      uniform float uOpacity;
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        float time = uTime * 0.8;
        vec3 color = vec3( abs(sin(time )) + 0.4, 0.3, abs(cos(time)) + 0.4);
        gl_FragColor = vec4(color, 1.0 * uOpacity);
      }
    `,
  });
  const text = new THREE.Mesh(textGeometry, textMaterial);
  text.position.y = y;
  text.position.z = z;
  text.position.x = x;
  return text;
};

const fontLoader = new FontLoader();
fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
  text = createText("ib1zza", font, 0, 1, 0, {
    x: -Math.PI / 2,
    y: -Math.PI / 2,
    z: 0,
  });
 
  scene.add(text);
  
})



const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    material.uniforms.uTime.value = elapsedTime;
    group.rotation.y = elapsedTime / 2
    if(textMaterial){
    textMaterial.uniforms.uTime.value = elapsedTime;
    // console.log(textMaterial.uniforms.uOpacity)}
    }
    // Update controls
    controls.update()
    
    // Render
    // renderer.render(scene, camera)
    composer.render();


    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


function hideRectangles  () {
  gsap.to(camera.position, {
      duration: duration,
      x: -5,
      y: 2,
      z: 0,
    });

    gsap.to(material.uniforms.uMultiplierElevation, {
      duration: duration,
      value: 1
    });

    gsap.to(triangleMaterial.uniforms.uOpacityMultiplier, {
      duration: duration,
      value:  0,
     
    })

    gsap.to(group.position, {
      duration: duration,
      x: 5,
      y: 3,
      z: 0,
    });

    gsap.to(textMaterial.uniforms.uOpacity, {
      duration: duration / 2,
      value:  0,
  
    })

    gsap.to(text.position, {
      duration: duration ,
      y: 0.5,
      x: 10,
    })


  arr.forEach(element => {
      gsap.to(element.rotation, {
          duration: duration,
          x: Math.random(),
          z: Math.random(),
        })
       
      gsap.to(element.position, {
          duration: duration,
           
          x: element.position.x * 5.0 ,
          z: element.position.z * 5.0,
        }).then(() => {
          scene.remove(group);
          group.remove(element);
        })
  })
}

function showRectangles  () {

  createRectangles();
  gsap.to(camera.position, {
    duration: duration,
    ...initialState.camera.position
  });

  gsap.to(group.position, {
    duration: duration,
    x: -0.001,
    y: 0,
    z: 0,
  });

    gsap.to(material.uniforms.uMultiplierElevation, {
      duration: duration,
      value: 0
    });

    gsap.to(triangleMaterial.uniforms.uOpacityMultiplier, {
      duration: duration,
      value:  1,
    })

    gsap.to(textMaterial.uniforms.uOpacity, {
      duration: duration /2 ,
      delay: duration / 2,
      value:  1,
    })

    gsap.to(text.position, {
      duration: duration / 5,
      ...initialState.text.position
    })

  scene.add(group);
}

export {buttonListener}