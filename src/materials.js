import * as THREE from 'three'
import waterParticlesVertexShader from './shaders/coolWavesParticles/vertex.glsl';
import waterParticlesFragmentShader from './shaders/coolWavesParticles/fragment.glsl';

export const particlesParams = {
    count: 200,
    size: 5
}
 


export const particlesMaterial = new THREE.ShaderMaterial({
    depthWrite: false,
    
    vertexColors: true,
    vertexShader: waterParticlesVertexShader,
    fragmentShader: waterParticlesFragmentShader,
    uniforms: {
        uTime: {value: 0},
        uSize: {value: particlesParams.size * Math.min(window.devicePixelRatio, 2)},
        
        uDepthColor: { value: new THREE.Color("#000000") },
        uSurfaceColor: { value: new THREE.Color("#ffffff") },
        uColorOffset: { value: 0.05},
        uColorMultiplier: { value: 1.5 },

        uSmallWavesElevation: { value: 7 },
        uSmallWavesFrequency: { value: 0.5},
        uSmallWavesSpeed: {value: 0.6},
        uSmallWavesIterations: {value: 1.0},

        uMultiplierElevation: { value: 0 },
    }
})


export const triangleMaterial = new THREE.ShaderMaterial({
    vertexShader: `
  

   varying vec2 vUv;
 
  
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    
        vUv = uv;
       
      }
    `,
    // fragmentShader: `
   
    // varying vec2 vUv;
    // uniform float uOpacityMultiplier;

    //   void main() {

    //     float strengthForShadowBottom = vUv.y * vUv.y + 0.05;

    //     float strengthForPattern = step(0.48, abs(vUv.x - 0.5)) + step(0.48, abs(vUv.y - 0.5));

    //     // mul *= strengthForPattern;

    //     vec3 whiteColor = vec3(uOpacityMultiplier - 0.4) * strengthForPattern;

    //     vec4 finalColor = vec4(whiteColor, 1.0 * strengthForShadowBottom);

    //     gl_FragColor = finalColor;
    //   }
  
    // `,
    fragmentShader: `
   
    varying vec2 vUv;
    uniform float uOpacityMultiplier;

      void main() {
         gl_FragColor = vec4(vec3(0.4) * step(0.48, abs(vUv.x - 0.5)) + step(0.48, abs(vUv.y - 0.5)), 1.0 * vUv.y * vUv.y * uOpacityMultiplier );;
      }
  
    `,
    uniforms: {
        uOpacityMultiplier: { value: 1 },
    },
 
    transparent: true,
    side: THREE.DoubleSide,
  });
  

  export const textMaterial = new THREE.ShaderMaterial({
    // side: THREE.DoubleSide,
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