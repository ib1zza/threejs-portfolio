uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;

uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;
varying vec2 vUv;



void main() 
{
    // float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    // vec3 color = mix( uDepthColor, uSurfaceColor, mixStrength );
    // gl_FragColor = vec4(color, 1.0);

    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix( uDepthColor, uSurfaceColor, mixStrength );
    float multiplier = 200.0;
    float cellSize = 0.15;
    float opacity = step(1.0 - cellSize, mod(vUv.y * multiplier, 1.0)) * step(1.0 - cellSize, mod(vUv.x * multiplier, 1.0))  ;
    gl_FragColor = vec4(color, 1.0);
}