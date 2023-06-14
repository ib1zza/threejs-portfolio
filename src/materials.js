import * as THREE from 'three'
import waterParticlesVertexShader from './shaders/coolWavesParticles/vertex.glsl';
import waterParticlesFragmentShader from './shaders/coolWavesParticles/fragment.glsl';

export const particlesParams = {
    count: 400,
    size: 8,
    sizeOfPlane: 20,
}

export const particlesMaterial = new THREE.ShaderMaterial({
    depthWrite: false,
    
    blending: THREE.AdditiveBlending,
    // vertexColors: true,
    vertexShader: waterParticlesVertexShader,
    fragmentShader: waterParticlesFragmentShader,
    uniforms: {
        uTime: {value: 0},
        uSize: {value: particlesParams.size * Math.min(window.devicePixelRatio, 2)},
        
        uDepthColor: { value: new THREE.Color("#000000") },
        uSurfaceColor: { value: new THREE.Color("#ffffff") },
        uColorOffset: { value: 0.05},
        uColorMultiplier: { value: 1.7 },

        uSmallWavesElevation: { value: 6 },
        uSmallWavesFrequency: { value: 0.5},
        uSmallWavesSpeed: {value: 0.4},
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
      uniform float uOpacityMultiplier;

      varying vec2 vUv;

      void main() {
         gl_FragColor = vec4(vec3(0.4) * step(0.48, abs(vUv.x - 0.5)) + step(0.48, abs(vUv.y - 0.5)), 1.0 * vUv.y * vUv.y * uOpacityMultiplier );;
      }
  
    `,
    uniforms: {
        uOpacityMultiplier: { value: 0 },
    },
 
    transparent: true,
    side: THREE.DoubleSide,
  }); 

  export const textMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0}
    },

    vertexShader: `
      uniform float uTime;
      uniform float uOpacity;
      varying vec4 vColor;
      varying vec2 vUv;
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        float time = uTime * 0.8;
        // vColor = vec4( abs(sin(time )) + 0.4, 0.3, abs(cos(time)) + 0.4, uOpacity);
        
        vColor = vec4( abs(sin(time )) + 0.4, 0.3, abs(cos(time)) + 0.4, uOpacity);
        vUv = uv;
      }
    `,
    fragmentShader: `  
      varying vec4 vColor;
      varying vec2 vUv;
      uniform float uTime;

      void main() {
        float speed = uTime / 10.0;
        float mul = mod((vUv.y + speed / 2.0) * 20.0, 1.0) *
         abs(sin(((vUv.x + vUv.y) * 10.0 + speed * 25.0)) + 0.2) * 
         (abs(sin(((vUv.x - vUv.y) * 5.0 + speed * 3.0))));

        gl_FragColor = vec4(vColor.rgb * mul, vColor.a);
      }
    `,
  });


  export const overlayMaterial = new THREE.ShaderMaterial(
    {
        // wireframe: true,
        transparent: true,
        uniforms:
        {
            uAlpha: {value: 1}
        },
        vertexShader: `
            varying vec2 vUv;
            void main()
            {
                vUv = uv;
                gl_Position =  vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uAlpha;
            varying vec2 vUv;
            void main()
            {
                vec3 finalColor = vec3(0.0);
                gl_FragColor = vec4(finalColor, uAlpha);
            }
            `
    }
    )


    export const xMarkMaterial = new THREE.ShaderMaterial(
      {
          transparent: true,
        side: THREE.DoubleSide,
          uniforms:
          {
              uAlpha: {value: 0}
          },
          vertexShader: `
              varying vec2 vUv;
              void main()
              {
                  vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

                  // gl_Position =  vec4(position, 1.0);
              }
          `,
          fragmentShader: `
              uniform float uAlpha;
              varying vec2 vUv;
              void main()
              {
                float shirina = 0.04;
                float strength = clamp(0.0, 1.0, step(1.0 - shirina, 1.0 - abs(vUv.x - 0.5)) + step(1.0 - shirina, 1.0 - abs(vUv.y - 0.5)));
                  vec3 finalColor = vec3(1.0);
                  gl_FragColor = vec4(finalColor, uAlpha * strength);
              }
              `
      }
      )